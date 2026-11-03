// script.js — Provide deterministic timed playback, manual navigation, and accessible reduced-motion controls.
const scenes = Array.from(document.querySelectorAll('.scene'));
const toggle = document.getElementById('toggle');
const restart = document.getElementById('restart');
const explore = document.getElementById('explore');
const progress = document.getElementById('progress');
const status = document.getElementById('mode-status');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const durations = scenes.map(scene => Math.max(3000, Number(scene.dataset.hold) || 14000));
const total = durations.reduce((sum, duration) => sum + duration, 0);
const offsets = durations.map((_, index) => durations.slice(0, index).reduce((sum, n) => sum + n, 0));
let index = 0;
let elapsed = 0;
let last = 0;
let playing = !reduced.matches;
let manual = reduced.matches;
let internalScroll = false;
let scrollUnlock;
let frame = 0;

function controls() {
  toggle.textContent = playing ? 'Pause' : 'Play';
  toggle.setAttribute('aria-label', playing ? 'Pause presentation' : 'Play presentation');
  explore.textContent = manual ? 'Watch' : 'Explore';
  explore.setAttribute('aria-pressed', String(manual));
  status.textContent = manual ? 'Explore mode. Scroll or use arrow keys.' : playing ? 'Presentation playing.' : 'Presentation paused.';
}
function setMode(play) {
  playing = Boolean(play) && !reduced.matches;
  manual = !playing;
  last = 0;
  controls();
}
function navigate(target, smooth = true) {
  index = Math.max(0, Math.min(scenes.length - 1, target));
  elapsed = 0;
  internalScroll = true;
  clearTimeout(scrollUnlock);
  scenes[index].scrollIntoView({behavior: smooth && !reduced.matches ? 'smooth' : 'instant', block:'start'});
  scrollUnlock = setTimeout(() => {internalScroll = false;}, smooth ? 1100 : 100);
  updateProgress();
}
function updateProgress() {
  progress.style.width = `${Math.min(100, 100 * (offsets[index] + elapsed) / total)}%`;
}
function enterManual() {
  if (playing && !internalScroll) {
    setMode(false);
    const viewportMiddle = window.scrollY + window.innerHeight / 2;
    index = scenes.reduce((best, scene, i) => Math.abs(scene.offsetTop - viewportMiddle) < Math.abs(scenes[best].offsetTop - viewportMiddle) ? i : best, 0);
    elapsed = 0;
    updateProgress();
  }
}
toggle.addEventListener('click', () => {
  if (playing) setMode(false);
  else setMode(true);
});
restart.addEventListener('click', () => {navigate(0, false);setMode(!reduced.matches);});
explore.addEventListener('click', () => {setMode(manual);});
reduced.addEventListener('change', () => {if(reduced.matches) setMode(false);});
window.addEventListener('wheel', enterManual, {passive:true});
window.addEventListener('touchmove', enterManual, {passive:true});
window.addEventListener('scroll', () => { if(!internalScroll) enterManual(); }, {passive:true});
document.addEventListener('visibilitychange', () => {last = 0;});
document.addEventListener('keydown', event => {
  if(event.target.closest('button,a,input,textarea,select')) return;
  if(event.code === 'Space') {event.preventDefault();setMode(!playing);}
  if(['ArrowRight','PageDown'].includes(event.key)) {event.preventDefault();setMode(false);navigate(index+1);}
  if(['ArrowLeft','PageUp'].includes(event.key)) {event.preventDefault();setMode(false);navigate(index-1);}
});
function tick(now) {
  if (!last) last = now;
  const delta = Math.min(now-last, 100);
  last = now;
  if (playing && !document.hidden) {
    elapsed += delta;
    if (elapsed >= durations[index]) {
      if (index === scenes.length-1) { elapsed = durations[index]; setMode(false); }
      else navigate(index+1);
    }
    updateProgress();
    const photo = scenes[index].querySelector('.photo');
    if(photo && !reduced.matches) photo.style.setProperty('--shift', `${(elapsed / durations[index] - 0.5)*28}px`);
  }
  frame = requestAnimationFrame(tick);
}
controls();
updateProgress();
frame = requestAnimationFrame(tick);
