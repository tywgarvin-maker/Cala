/* Cala House Architecture & Art Pass 02 — connected Roman streetscape.
 * Derived at draw time: no extra blocks, save mutations, hit zones or terrain edits.
 * Overrides the first-pass decoration rather than stacking it twice.
 */
(function(){
'use strict';
const lerp=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
const uv=(q,u,v)=>blend(blend(q[0],q[1],u),blend(q[3],q[2],u),v);
const area=(q,l,t,r,b)=>[uv(q,l,t),uv(q,r,t),uv(q,r,b),uv(q,l,b)];
function path(g,pts,colour,width,close=false){
  g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));if(close)g.closePath();
  g.strokeStyle=colour;g.lineWidth=width;g.stroke();
}
function fill(g,pts,colour){poly(g,pts,colour)}
function hash(t){return Math.abs(Math.round(t.x*53+t.z*113+(t.level||0)*71));}
function nbr(t,u,v,z=0){return adjacentBlock(t,u,v,z)}
function colour(t){
  // Connected houses have the same plaster family. A free-standing house
  // is allowed to be warmer or cooler, but adjacent bays never checkerboard.
  let start=t;
  for(let n=0;n<24;n++){const left=nbr(start,-1,0)||nbr(start,0,-1);if(!left)break;start=left;}
  const families=[
    ['#e8d0aa','#bd9e79','#efdbb7'],['#eee0c7','#c4ab8e','#fbebd4'],
    ['#dfc6a6','#b69a79','#f2dfbe'],['#ead7bc','#b9a089','#f5e6ca']
  ];
  return families[hash(start)%families.length];
}
function exposed(t,u,v){return !nbr(t,u,v);}
function wallQuad(gm,a,b){return [gm.top[a],gm.top[b],gm.bottom[b],gm.bottom[a]];}
function archedOpening(g,q,kind,stone){
  const door=kind==='door'||kind==='shop',left=door?.24:.31,right=door?.76:.69;
  const top=door?.23:.29,base=door?.96:.71;
  const out=[];
  for(let i=0;i<=12;i++){
    const x=left+(right-left)*i/12;
    const d=(x-(left+right)/2)/((right-left)/2);
    out.push(uv(q,x,top+.11*(1-Math.sqrt(Math.max(0,1-d*d)))));
  }
  const voidShape=[...out,uv(q,right,base),uv(q,left,base)];
  fill(g,voidShape,'#765b48');
  path(g,out,stone,.036);
  if(door){
    fill(g,area(q,left+.035,top+.13,right-.035,base),'#604637');
    if(kind==='shop'){
      fill(g,area(q,left+.055,.49,right-.055,.70),'#382f2b');
      path(g,[uv(q,left+.055,.71),uv(q,right-.055,.71)],'#d0a47a',.026);
    }else{
      path(g,[uv(q,.50,top+.15),uv(q,.50,base)],'#a27a54',.015);
      for(let i=1;i<5;i++)path(g,[uv(q,left+.06,top+.16+i*.095),uv(q,right-.06,top+.16+i*.095)],'rgba(209,161,107,.28)',.008);
      fill(g,[uv(q,.64,.65),uv(q,.67,.65),uv(q,.67,.67),uv(q,.64,.67)],'#d7ac6e');
    }
    path(g,[uv(q,left-.07,.97),uv(q,right+.07,.97)],'#c9ac87',.046);
  }else{
    fill(g,area(q,left+.04,.40,right-.04,.665),'#5b4438');
    path(g,[uv(q,.5,.405),uv(q,.5,.66)],'#b99a74',.021);
    fill(g,area(q,left-.06,.715,right+.06,.755),'#e2c39e');
    path(g,[uv(q,left-.065,.76),uv(q,right+.065,.76)],'#8f7259',.012);
  }
}
function upperOpening(g,q,stone,variant){
  const left=variant?.36:.30,right=variant?.64:.70;
  fill(g,area(q,left,.37,right,.64),'#bca185');
  fill(g,area(q,left+.035,.40,right-.035,.62),'#503f36');
  path(g,[uv(q,left-.045,.35),uv(q,right+.045,.35)],stone,.035);
  path(g,[uv(q,left-.065,.67),uv(q,right+.065,.67)],'#e7caac',.046);
  if(variant)path(g,[uv(q,.50,.40),uv(q,.50,.61)],'#a08264',.012);
}
function portico(g,q,stone){
  // Recessed dark arcade with columns, limited to actual courtyard frontage.
  fill(g,area(q,.09,.33,.91,.94),'#76614f');
  for(let i=0;i<2;i++){
    const l=.16+i*.34,r=l+.32;
    const arc=[];
    for(let n=0;n<=10;n++){
      const x=l+(r-l)*n/10,d=(x-(l+r)/2)/((r-l)/2);
      arc.push(uv(q,x,.41+.12*(1-Math.sqrt(Math.max(0,1-d*d)))));
    }
    path(g,arc,'#e5c5a0',.043);
  }
  for(let i=0;i<3;i++){
    const u=.13+i*.35;
    path(g,[uv(q,u,.45),uv(q,u,.93)],stone,.060);
    path(g,[uv(q,u-.065,.45),uv(q,u+.065,.45)],'#f0d8bc',.044);
    path(g,[uv(q,u-.072,.93),uv(q,u+.072,.93)],'#d5b58e',.047);
  }
}
function courtyard(t,du,dv){
  if(nbr(t,du,dv))return false;
  const facing=blockOffset(t,du,dv);
  const cross=du?[[0,-1],[0,1]]:[[-1,0],[1,0]];
  const side=cross.map(([u,v])=>nbr(facing,u,v));
  return side.every(Boolean);
}
function runOffset(t,u,v,max=7){let i=0,c=t;while(i<max&&(c=nbr(c,u,v)))i++;return i;}
function facade(g,t,gm,a,b,du,dv,family,shade){
  if(!exposed(t,du,dv))return;
  const q=wallQuad(gm,a,b),pal=blockPalette(t);
  fill(g,q,shade?family[1]:family[0]);
  paintedPlane(g,t.level?'upper-bay':'plaster',q,.37);
  fill(g,q,'rgba(180,122,72,.045)');
  const n=hash(t),level=t.level||0,openCourt=courtyard(t,du,dv);
  // Small facade vocabulary, with continuity and deliberately blank bays.
  if(level===0){
    if(openCourt&&n%4!==0)portico(g,q,family[2]);
    else if((du===0&&n%5===0)||(du===1&&n%6===1))archedOpening(g,q,'door',family[2]);
    else if(n%5===3)archedOpening(g,q,'shop',family[2]);
    else if(n%4!==1)archedOpening(g,q,'window',family[2]);
  }else if(n%5!==1)upperOpening(g,q,family[2],n%3===0);
  // Continuous cornice: only exposed walls, no pilaster at every block seam.
  if(!nbr(t,0,0,1)){
    path(g,[uv(q,0,.075),uv(q,1,.075)],'#96775d',.054);
    path(g,[uv(q,0,.056),uv(q,1,.056)],family[2],.022);
  }else{
    path(g,[uv(q,0,.035),uv(q,1,.035)],'rgba(107,81,65,.32)',.018);
  }
  if(level===0){
    fill(g,area(q,0,.91,1,1),'rgba(154,127,93,.20)');
    path(g,[uv(q,0,.93),uv(q,1,.93)],'#d1b28b',.033);
  }
  // Corner quoins are limited to *outer* ends, not every join between blocks.
  const end=du===0?!nbr(t,-1,0):!nbr(t,0,-1);
  if(end){
    path(g,[uv(q,.035,.11),uv(q,.035,.90)],'rgba(245,226,196,.47)',.021);
  }
}
function roofing(g,t,gm,family){
  if(nbr(t,0,0,1))return;
  const {point,top}=gm,pal=blockPalette(t);
  const connectedU=Boolean(nbr(t,-1,0)||nbr(t,1,0));
  const connectedV=Boolean(nbr(t,0,-1)||nbr(t,0,1));
  // Continuous terrace surfaces are intentional for complex corners.
  // A shallow pitched tiled roof runs along the dominant connected direction.
  let alongU=connectedU||!connectedV;
  if(connectedU&&connectedV){
    const lengthU=runOffset(t,-1,0)+runOffset(t,1,0);
    const lengthV=runOffset(t,0,-1)+runOffset(t,0,1);
    alongU=lengthU>=lengthV;
  }
  const rise=.14;
  const midpoint=alongU?[point(0,.5,blockHeight+rise),point(1,.5,blockHeight+rise)]:
    [point(.5,0,blockHeight+rise),point(.5,1,blockHeight+rise)];
  const [r0,r1]=midpoint;
  const first=alongU?[top[0],top[1],r1,r0]:[top[0],top[3],r1,r0];
  const second=alongU?[r0,r1,top[2],top[3]]:[r0,r1,top[2],top[1]];
  fill(g,first,'#c2734e');fill(g,second,'#a86042');
  paintedPlane(g,'tiles',first,.68);paintedPlane(g,'tiles',second,.54);
  fill(g,first,'rgba(202,123,75,.12)');
  for(let j=1;j<=5;j++){
    const u=j/6;
    const a=alongU?[point(u,0,blockHeight),point(u,.5,blockHeight+rise),point(u,1,blockHeight)]:
      [point(0,u,blockHeight),point(.5,u,blockHeight+rise),point(1,u,blockHeight)];
    path(g,a,'rgba(120,61,40,.24)',.008);
  }
  // A ridge is continuous across adjoining roofs and capped at free ends.
  path(g,midpoint,pal.ridge,.030);
  const ends=alongU?[[top[0],r0,top[3],-1,0],[top[1],r1,top[2],1,0]]:
    [[top[0],r0,top[1],0,-1],[top[3],r1,top[2],0,1]];
  for(const [a,r,b,u,v] of ends){
    if(!nbr(t,u,v))path(g,[a,r,b],pal.roofDark,.022);
    else if(nbr(nbr(t,u,v),0,0,1))path(g,[a,r,b],'rgba(82,53,45,.5)',.04);
  }
  for(const [a,b,u,v] of [[top[0],top[1],0,-1],[top[1],top[2],1,0],[top[2],top[3],0,1],[top[3],top[0],-1,0]])
    if(!nbr(t,u,v))path(g,[a,b],pal.roofDark,.029);
}
renderBlock=function(g,t){
  const gm=blockGeometry(t),family=colour(t),faces=[];
  const support=blockSupport(t),pal=blockPalette(t);
  if(support.kind==='arcade')drawArcade(g,t,gm.point,pal);
  for(const [a,b,u,v,shade] of [[0,1,0,-1,false],[1,2,1,0,true]]){
    if(!exposed(t,u,v))continue;
    facade(g,t,gm,a,b,u,v,family,shade);
    faces.push({t,type:'side',du:u,dv:v,points:wallQuad(gm,a,b)});
    if(t.level===0){
      const under=blockSupport(t);
      if(under.kind==='bearing'){
        const q=wallQuad(gm,a,b);
        fill(g,area(q,0,.96,1,1),pal.stone);
      }
    }
  }
  if(!nbr(t,0,0,1)){
    roofing(g,t,gm,family);
    faces.push({t,type:'top',points:gm.top});
  }
  return faces;
};
console.info('Cala: House Architecture Pass 02 — contextual urban fabric');
})();
