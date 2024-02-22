import { invoke } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';

const toggle = document.querySelector('.toggle') as HTMLDivElement;
const input: HTMLInputElement = document.getElementById("input") as HTMLInputElement;
const audio = document.querySelector('audio')
let delay = 1000;
input.value = delay.toString();

input?.addEventListener("input", (e) => {
  delay = parseInt((e.target as HTMLInputElement).value);
  if (isNaN(delay)) delay = 1000;
  if (delay < 1) delay = 1;
  invoke("set_delay", { delay: delay });
  console.log(delay);
});

await listen(('sound'), (e) => {
  const msg = e.payload;
  if (msg === 'on') {
    audio?.play();
    toggle.style.backgroundColor = 'green';
  } else if (msg === 'off') {
    audio?.pause();
    if (audio) audio.currentTime = 0;
    toggle.style.backgroundColor = 'red';
  }
});

toggle?.addEventListener('focus', () => {
  console.log('focus');
});

const unlisten = await listen<string>('error', (e) => {
  console.error(`Got error, payload: ${e.payload}`);
});
unlisten();