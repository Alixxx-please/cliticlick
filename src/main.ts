import { invoke } from "@tauri-apps/api/core";

//const toggle = document.querySelector('.toggle') as HTMLDivElement;
const input: HTMLInputElement = document.getElementById("input") as HTMLInputElement;
//const off = document.querySelector('.off') as HTMLDivElement;
let delay = 1000;
input.value = delay.toString();

input?.addEventListener("input", (e) => {
  delay = parseInt((e.target as HTMLInputElement).value);
  if (isNaN(delay)) delay = 1000;
  if (delay < 1) delay = 1;
  invoke("set_delay", { delay: delay });
  console.log(delay);
});

const output: HTMLElement = document.getElementById("counter") as HTMLElement;
let counter = 0;
document.addEventListener("click", () => {
  console.log("CLICK RECEIVED");
  counter += 1;
  output.innerText = counter.toString();
});
