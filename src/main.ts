import { invoke } from "@tauri-apps/api/core";
import { listen, emit } from '@tauri-apps/api/event';

const input: HTMLInputElement = document.getElementById("input") as HTMLInputElement;
const select: HTMLSelectElement = document.getElementById("select") as HTMLSelectElement;
let value: string = "cps"
emit('type', value);
const audio = document.querySelector('audio')
let on = false;
let delay = 1000;
input.value = delay.toString();

input?.addEventListener("input", (e) => {
  delay = parseInt((e.target as HTMLInputElement).value);
  if (isNaN(delay)) delay = 1000;
  if (delay < 1) delay = 1;
  invoke("set_delay", { delay: delay, unit: value});
  console.log(delay);
});

await listen(('sound'), (e) => {
  const msg = e.payload;
  if (msg === 'on') {
    on = true;
    audio?.play();
  } else if (msg === 'off') {
    on = false;
    audio?.pause();
    if (audio) audio.currentTime = 0;
  };
});

select?.addEventListener("change", (e) => {
  value = (e.target as HTMLSelectElement).value;
  invoke("set_delay", { delay: delay, unit: value});
});


const unlisten = await listen<string>('error', (e) => {
  console.error(`Got error, payload: ${e.payload}`);
});
unlisten();