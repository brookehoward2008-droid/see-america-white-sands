// dist/presentation.js: Move through the main editorial page automatically while keeping reader control immediate.
(() => {
const toggle=document.getElementById('flow-toggle');
const restart=document.getElementById('flow-restart');
const status=document.getElementById('flow-state');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let playing=!reduced.matches, frame=0, last=0, holdUntil=performance.now()+4200, resumeAfterHidden=false;
const speed=27;
const held=new Set();
const chapters=[...document.querySelectorAll("#landscape,#desert-plants,#history,#design,#experience,#field-notes,#town,#food,#visit,#collection,#colophon")];
let position=scrollY;
function paint(message){toggle.textContent=playing?'Pause':'Resume';toggle.setAttribute('aria-pressed',String(playing));status.textContent=message||(playing?'Playing':'Paused');document.body.classList.toggle('flow-playing',playing);}
function tick(now){frame=0;if(!playing||document.hidden)return;
 if(!last)last=now;
 const dt=Math.min((now-last)/1000,.08);last=now;
 const bottom=Math.max(0,document.documentElement.scrollHeight-innerHeight);
 if(scrollY>=bottom-2){playing=false;paint('Finished');last=0;return;}
 if(now<holdUntil){position=scrollY;}else{const next=Math.min(bottom,position+speed*dt);
 const chapter=chapters.find(el=>{const top=el.getBoundingClientRect().top+scrollY-65;return !held.has(el)&&top>position&&top<=next;});
 position=next;window.scrollTo({top:position,behavior:'instant'});if(chapter){held.add(chapter);holdUntil=now+3400;}}
 frame=requestAnimationFrame(tick);
}
function setPlaying(value,message){playing=value;last=0;position=scrollY;cancelAnimationFrame(frame);paint(message);if(playing){holdUntil=performance.now()+900;frame=requestAnimationFrame(tick);}}
function pauseForReader(){if(playing)setPlaying(false,'Paused for reading');}
toggle.addEventListener('click',()=>setPlaying(!playing));
restart.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'instant'});held.clear();setPlaying(true);holdUntil=performance.now()+4200;});
addEventListener('wheel',pauseForReader,{passive:true});addEventListener('touchstart',event=>{if(!event.target.closest('.flow-controls'))pauseForReader();},{passive:true});
addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)&&!event.target.closest('button,input,summary'))pauseForReader();});
document.querySelectorAll('a,summary,input,.swatches button').forEach(el=>el.addEventListener('click',pauseForReader));
document.addEventListener('visibilitychange',()=>{if(document.hidden){resumeAfterHidden=playing;setPlaying(false,'Paused while away');}else if(resumeAfterHidden){resumeAfterHidden=false;setPlaying(true);}});
reduced.addEventListener('change',()=>{if(reduced.matches)setPlaying(false,'Reduced motion · paused');});
addEventListener('load',()=>{position=scrollY;holdUntil=performance.now()+4200;},{once:true});
paint(reduced.matches?'Reduced motion · paused':'Playing');if(playing)frame=requestAnimationFrame(tick);
})();
