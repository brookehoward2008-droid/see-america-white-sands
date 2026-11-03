// dist/depth.js: Coordinate reading progress, optional motion and the photographic light comparison.
(() => {
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.getElementById('motion-toggle');
let motion=!reduced.matches, pending=false;
const hero=document.querySelector('.hero>img');
const progress=document.querySelector('.reading-progress');
function render(){pending=false;const y=scrollY;const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${range>0?y/range:0})`;if(motion&&hero)hero.style.transform=`translateY(${Math.min(y*.12,95)}px) scale(1.08)`;}
function setMotion(value){motion=value&&!reduced.matches;document.body.classList.toggle('motion-off',!motion);toggle.textContent=motion?'Motion on':'Motion off';toggle.setAttribute('aria-pressed',String(motion));render();}
toggle.addEventListener('click',()=>setMotion(!motion));reduced.addEventListener('change',()=>setMotion(!reduced.matches));
addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(render)}},{passive:true});addEventListener('resize',render);
const targets=document.querySelectorAll('.observations,.play-section,.town-section,.food-section,.place-study,.production');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.06});targets.forEach(el=>{el.classList.add('reveal-section');observer.observe(el)});document.body.classList.add('depth-ready');}
const slider=document.getElementById('light-range');slider.addEventListener('input',()=>document.querySelector('.light-images').style.setProperty('--reveal',`${slider.value}%`));
setMotion(motion);
})();
