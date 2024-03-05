import { invoke } from "@tauri-apps/api/core";
import { listen, emit } from '@tauri-apps/api/event';

const toggle = document.querySelector('.toggle') as HTMLDivElement;
const input: HTMLInputElement = document.getElementById("input") as HTMLInputElement;
const button = document.getElementById('button') as HTMLDivElement;
const audio = document.querySelector('audio')
const top = document.querySelector('.top') as HTMLDivElement;
const bottom = document.querySelector('.bottom') as HTMLDivElement;
let on = false;
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
    on = true;
    audio?.play();
    toggle.style.backgroundColor = 'green';
    button?.classList.remove('stop');
    if (top) top.style.backgroundColor = 'transparent';
    if (bottom) bottom.style.backgroundColor = 'transparent';
    button?.classList.add('paused');

  } else if (msg === 'off') {
    on = false;
    button?.classList.remove('paused');
    if (top) top.style.backgroundColor = 'white';
    if (bottom) bottom.style.backgroundColor = 'white';
    button?.classList.add('stop');
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

window.addEventListener('mouseover', () => {
  window.focus();
  emit('focus')
  if (on) {
    button?.classList.remove('stop');
    button?.classList.remove('paused');
  }
});

window.addEventListener('mousemove', () => {
  window.focus();
  emit('focus')
  if (on) {
    button?.classList.remove('stop');
    button?.classList.remove('paused');
  }
});

window.addEventListener('mouseenter', () => {
  window.focus();
  emit('focus')
  if (on) {
    button?.classList.remove('stop');
    button?.classList.remove('paused');
  }
});

document.addEventListener('mouseout', () => {
  emit('leave');
  if (on) {
    button?.classList.remove('stop');
    button?.classList.add('paused');
  } else {
    button?.classList.add('stop');
  };
});

const unlisten = await listen<string>('error', (e) => {
  console.error(`Got error, payload: ${e.payload}`);
});
unlisten();