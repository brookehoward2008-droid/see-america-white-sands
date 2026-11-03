// dist/background.js: Preserve top-aligned footage below the hero and avoid unnecessary playback.
(()=>{
  const video=document.getElementById('desert-background');
  if(!video)return;
  const hero=document.querySelector('.opening');
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  const toggle=document.querySelector('.motion-toggle');
  let userPaused=false;
  let scheduled=false;
  let visible=false;
  function sync(){
    if(userPaused||motion.matches||document.hidden||!visible)video.pause();
    else if(video.paused)video.play().catch(()=>{});
  }
  function position(){
    scheduled=false;
    const offset=Math.max(0,hero?hero.getBoundingClientRect().bottom:0);
    video.style.setProperty('--film-offset',`${offset}px`);
    visible=offset<window.innerHeight;
    sync();
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(position);
  }
  if(toggle){
    toggle.hidden=motion.matches;
    toggle.addEventListener('click',()=>{
      userPaused=!userPaused;
      toggle.setAttribute('aria-pressed',String(userPaused));
      toggle.textContent=userPaused?'Play background':'Pause background';
      sync();
    });
    motion.addEventListener('change',()=>{toggle.hidden=motion.matches;});
  }
  video.muted=true;
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
  if(hero&&'ResizeObserver' in window)new ResizeObserver(schedule).observe(hero);
  position();
})();
