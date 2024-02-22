// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use autopilot::mouse::Button;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers};
extern crate autopilot;
extern crate tauri_plugin_global_shortcut;

struct DelayState {
    delay: u64,
    enabled: bool,
}

async fn setup_hotkey(app: AppHandle) {
    let shortcut_delay =
        tauri_plugin_global_shortcut::Shortcut::new(Some(Modifiers::FN), Code::F1);
    let shortcut_delay_id = shortcut_delay.id();
    #[cfg(desktop)]
    app.app_handle()
        .plugin(
            tauri_plugin_global_shortcut::Builder::with_handler(move |app, key| {
                let state = app.state::<Mutex<DelayState>>();
                let mut lock = state.lock().unwrap();
                let handle = app.app_handle().clone();
                if key.id() == shortcut_delay_id {
                    lock.enabled = !lock.enabled;
                };
                if !lock.enabled {
                  handle.emit("sound", "off").unwrap();
                  return;
                };
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
                      autopilot::mouse::click(Button::Left, Some(0));
                    };
                });
            })
            .build(),
        )
        .unwrap();
    app.app_handle()
        .global_shortcut()
        .register(shortcut_delay)
        .unwrap();
}

#[tauri::command]
async fn set_delay(app: AppHandle, delay: u64) {
    println!("{}", delay);
    let state = app.state::<Mutex<DelayState>>();
    let mut lock = state.lock().unwrap();
    lock.delay = delay;
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(DelayState {
            delay: 1000,
            enabled: false,
        }))
        .setup(|app| {
            tauri::async_runtime::block_on(setup_hotkey(app.handle().clone()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_delay])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}