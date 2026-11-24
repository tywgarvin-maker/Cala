/* Cala: first-visit architecture showcase. Does not overwrite saves. */
(function(){
  const css=document.createElement('style');
  css.textContent='#cala-showcase{position:fixed;z-index:25;left:50%;bottom:max(100px,calc(env(safe-area-inset-bottom) + 91px));transform:translateX(-50%);width:min(390px,calc(100vw - 28px));padding:12px;border-radius:18px;background:rgba(249,253,249,.97);color:#244e47;box-shadow:0 12px 35px #153a3440;font-family:system-ui,-apple-system,sans-serif}#cala-showcase strong{font-size:14px}#cala-showcase p{margin:4px 0 10px;font-size:12px;line-height:1.3}#cala-showcase .choices{display:flex;gap:5px}#cala-showcase button{flex:1;border:0;border-radius:10px;padding:10px 4px;font-weight:650;font-size:11px;background:#e6f0e9;color:#275047}#cala-showcase button[aria-pressed=true]{background:#29554c;color:white}#cala-showcase #cala-exit{width:100%;margin-top:7px;background:transparent;color:#657c74}@media(max-height:560px){#cala-showcase{bottom:85px;padding:8px}#cala-showcase p{display:none}}';
  document.head.appendChild(css);
  const panel=document.createElement('aside');
  panel.id='cala-showcase';
  panel.innerHTML='<strong>See Cala create Roman spaces</strong><p>Explore three editable arrangements. Your own town is preserved.</p><div class="choices"><button data-show="boulevard">Boulevard</button><button data-show="entrance">Entrance court</button><button data-show="garden">Garden</button></div><button id="cala-exit">Return to my town</button>';
  document.body.appendChild(panel);
  function show(name){
    try {
      sampleRomanPattern(name);
      panel.querySelector('strong').textContent=({boulevard:'Roman boulevard',entrance:'U-shaped entrance court',garden:'Peristyle garden'})[name];
      panel.querySelectorAll('[data-show]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.show===name)));
    } catch(e){console.error('Cala examples:',e);panel.querySelector('strong').textContent='Could not load example';}
  }
  panel.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>show(b.dataset.show));
  panel.querySelector('#cala-exit').onclick=()=>{if(typeof returnToTown==='function')returnToTown();panel.remove()};
  document.getElementById('return-town')?.addEventListener('click',()=>panel.remove());
  let seen=false;
  try{seen=localStorage.getItem('cala-showcase-seen-v1')==='1';localStorage.setItem('cala-showcase-seen-v1','1')}catch(e){}
  if(seen){panel.remove();return;}
  requestAnimationFrame(()=>show('entrance'));
})();
