/* Cala — Flat Foundation Baseline 01. Preserves coastline and one-block history. */
(function(){
'use strict';
const DATUM=1.45, BACKUP='cala-town-v1-before-flat-foundations', MIGRATION='cala-flat-foundations-v1';
height=function(){return DATUM;};
for(const t of tiles){t.h=DATUM;for(const v of t.v)v[2]=DATUM;}
let migrated=false;
try{
  if(localStorage.getItem(MIGRATION)!=='1'){
    const old=localStorage.getItem(saveKey);
    if(old&&localStorage.getItem(BACKUP)===null)localStorage.setItem(BACKUP,old);
    for(const batch of history)for(const a of batch)
      if(a.type==='block')a.h=DATUM+(a.level||0)*blockHeight;
    migrated=true;
  }
}catch(e){console.warn('Cala save migration: storage unavailable',e)}
const previousFoundation=foundation;
foundation=function(px,py){
  const site=previousFoundation(px,py);
  return site?{...site,h:DATUM}:site;
};
const previousBackdrop=backdrop;
backdrop=function(){
  previousBackdrop();
  if(!bg||!W||!H)return;
  const g=bg.getContext('2d');
  g.save();g.scale(bg.width/W,bg.height/H);
  for(const t of tiles){
    const pts=t.v.map(v=>P(...v));
    const edge=land(t.x,t.z)<.15,q=.35+.55*noise(t.x,t.z,3);
    const base=edge?mix('#baa47d','#d8c399',q):mix('#a7a57b','#c6bd8c',q);
    g.globalAlpha=edge?.72:.94;
    poly(g,pts,base);
    g.globalAlpha=edge?.30:.44;
    terrainPaint(g,t,pts,S);
    g.globalAlpha=1;
  }
  const lanes=joinedLanes(objects);
  for(const t of tiles)paintLane(g,t,lanes);
  g.restore();
};
rebuild();
try{
  if(migrated){save();localStorage.setItem(MIGRATION,'1');}
}catch(e){console.warn('Cala flat migration save failed',e)}
backdrop();draw();
console.info('Cala flat-foundations enabled at',DATUM);
})();