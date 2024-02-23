import { invoke } from "@tauri-apps/api/core";
import { listen, emit } from '@tauri-apps/api/event';

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

await listen(('bg_color'), (e) => {
  const msg = e.event
  if (msg === 'bg_color') toggle.style.backgroundColor = 'green'
});

await listen(('hover'), (e) => {
  const msg = e.event;
  if (msg === 'hover') toggle.style.backgroundColor = 'orange';
});

document.addEventListener('mouseover', () => {
  emit('focus');
});

document.addEventListener('mousemove', () => {
  emit('focus');
});

document.addEventListener('mouseenter', () => {
  emit('focus');
});

document.addEventListener('mouseout', () => {
  emit('leave');
});

const unlisten = await listen<string>('error', (e) => {
  console.error(`Got error, payload: ${e.payload}`);
});
unlisten();