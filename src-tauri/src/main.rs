// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use autopilot::mouse::Button;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers};
extern crate autopilot;
extern crate tauri_plugin_global_shortcut;

struct DelayState {
  delay: u64,
  enabled: bool,
}

fn click(enable: bool) {
  if enable == true {
    autopilot::mouse::click(Button::Left, Some(0));
  }
}

async fn setup_hotkey(app: AppHandle, click_enabled: Arc<Mutex<bool>>) {
  let shortcut_delay = tauri_plugin_global_shortcut::Shortcut::new(Some(Modifiers::FN), Code::F1);
  let shortcut_delay_id = shortcut_delay.id();
  #[cfg(desktop)]
  app.app_handle()
    .plugin(
      tauri_plugin_global_shortcut::Builder::with_handler(move |app, key| {
        let state = app.state::<Mutex<DelayState>>();
        let mut lock = state.lock().unwrap();
        let handle = app.app_handle().clone();
        let click_enabled = click_enabled.clone();
        if key.id() == shortcut_delay_id {
          lock.enabled = !lock.enabled;
        };
        if !lock.enabled {
          handle.emit("sound", "off").unwrap();
          return;
        };
        *click_enabled.lock().unwrap() = true;
        handle.emit("sound", "on").unwrap();
        tauri::async_runtime::spawn(async move {
          let mut enabled: bool = true;
          let mut delay: u64 = 1000;
          while enabled {
            tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
            let state = handle.state::<Mutex<DelayState>>();
            let lock = state.lock().unwrap();
            enabled = lock.enabled;
            delay = lock.delay;
            if !enabled {
              break;
            }
            if *click_enabled.lock().unwrap() == false {
              handle.emit("hover", "").unwrap()
            } else {
              handle.emit("bg_color", "").unwrap();
            }
            click(*click_enabled.lock().unwrap());
          };
        });
      }).build(),
    ).unwrap();
  app.app_handle().global_shortcut().register(shortcut_delay).unwrap();
}

#[tauri::command]
async fn set_delay(app: AppHandle, delay: u64) {
  let state = app.state::<Mutex<DelayState>>();
  let mut lock = state.lock().unwrap();
  lock.delay = delay;
}

fn main() {
  let click_enabled = Arc::new(Mutex::new(true));
  tauri::Builder::default()
  .plugin(tauri_plugin_shell::init())
  .manage(Mutex::new(DelayState {
    delay: 1000,
    enabled: false,
  }))
  .setup(move |app| {
    let click_enabled_clone = click_enabled.clone();
    tauri::async_runtime::block_on(setup_hotkey(app.handle().clone(), click_enabled_clone));
    let click_enabled_leave = click_enabled.clone();
    app.listen("focus", move |_e| {
      let mut click_enabled = click_enabled.lock().unwrap();
      *click_enabled = false;
    });
    app.listen("leave", move |_e| {
      let mut click_enabled = click_enabled_leave.lock().unwrap();
      *click_enabled = true;
    });
    Ok(())
  })
  .invoke_handler(tauri::generate_handler![set_delay])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}