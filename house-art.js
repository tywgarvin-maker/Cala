/* Cala — House Architecture & Art Pass 01.
   Derived decoration only. History, block geometry, picking and saves remain unchanged. */
(function(){
  'use strict';
  const originalRenderBlock=renderBlock;
  const mix2=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const p4=(quad,u,v)=>mix2(mix2(quad[0],quad[1],u),mix2(quad[3],quad[2],u),v);
  const rect=(q,u0,v0,u1,v1)=>[p4(q,u0,v0),p4(q,u1,v0),p4(q,u1,v1),p4(q,u0,v1)];
  const stroke=(g,points,color,width)=>{g.beginPath();g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);g.strokeStyle=color;g.lineWidth=width;g.stroke()};
  const facing=(t,du,dv)=>!adjacentBlock(t,du,dv);
  function courtyardSide(t,du,dv){
    const cross=du?[0,1]:[1,0];
    const side=blockOffset(t,du,dv),a=adjacentBlock(side,cross[0],cross[1]),b=adjacentBlock(side,-cross[0],-cross[1]);
    return !adjacentBlock(t,du,dv)&&Boolean(a&&b);
  }
  function door(g,q,pal){
    const u0=.30,u1=.70,top=.29,bottom=.96;
    const arch=[];
    for(let n=0;n<=12;n++){
      const x=u0+(u1-u0)*n/12;
      const rad=(x-(u0+u1)/2)/((u1-u0)/2);
      arch.push(p4(q,x,top+.12*(1-Math.sqrt(Math.max(0,1-rad*rad)))));
    }
    const opening=[...arch,p4(q,u1,bottom),p4(q,u0,bottom)];
    poly(g,opening,'#604438');stroke(g,arch,'#e1bb8e',.025);
    poly(g,rect(q,u0+.035,top+.10,u1-.035,bottom),'#6a4936');
    for(let n=1;n<=3;n++){const u=u0+.035+(u1-u0-.07)*n/4;stroke(g,[p4(q,u,top+.20),p4(q,u,bottom)],'#a87a50',.011)}
    stroke(g,[p4(q,.24,bottom),p4(q,.76,bottom)],pal.stone,.04);
  }
  function window(g,q,pal){
    const outer=rect(q,.31,.30,.69,.69),inner=rect(q,.345,.345,.655,.655);
    poly(g,outer,pal.stone);poly(g,inner,'#554b42');
    poly(g,rect(q,.365,.37,.635,.625),'#354f54');
    stroke(g,[p4(q,.50,.36),p4(q,.50,.64)],'#b8a384',.019);
    stroke(g,[p4(q,.365,.49),p4(q,.635,.49)],'#b8a384',.018);
    stroke(g,[p4(q,.27,.70),p4(q,.73,.70)],'#e4c6a4',.042);
    stroke(g,[p4(q,.29,.74),p4(q,.70,.74)],'#8a745c',.012);
  }
  function colonnade(g,q,pal){
    poly(g,rect(q,.10,.42,.90,.94),'#85664d');
    for(let i=0;i<3;i++){
      const u=.16+i*.34;
      stroke(g,[p4(q,u,.37),p4(q,u,.93)],pal.stone,.072);
      stroke(g,[p4(q,u-.07,.38),p4(q,u+.07,.38)],'#ead5b8',.033);
      stroke(g,[p4(q,u-.085,.92),p4(q,u+.085,.92)],pal.stone,.047);
    }
    stroke(g,[p4(q,.07,.34),p4(q,.93,.34)],pal.stone,.064);
  }
  function embellishWall(g,t,point,du,dv,pal,side){
    if(!facing(t,du,dv))return;
    const q=side==='front'?
      [point(0,0,blockHeight),point(1,0,blockHeight),point(1,0,-.06),point(0,0,-.06)]:
      [point(1,0,blockHeight),point(1,1,blockHeight),point(1,1,-.06),point(1,0,-.06)];
    const court=courtyardSide(t,du,dv);
    const frontPath=[...objects].some(([id,type])=>{
      if(type!=='path')return false;const c=cells.get(id);
      return c&&Math.hypot(c.x-t.x,c.z-t.z)<1.15;
    });
    const n=Math.abs(Math.round(t.x*19+t.z*29));
    if(t.level===0&&(court||frontPath&&n%3===0))colonnade(g,q,pal);
    else if(t.level===0&&n%3===0)door(g,q,pal);
    else if(n%4!==1)window(g,q,pal);
    if(!adjacentBlock(t,0,0,1)){
      stroke(g,[p4(q,0,.09),p4(q,1,.09)],pal.stone,.042);
      stroke(g,[p4(q,0,.12),p4(q,1,.12)],'#f0d5b0',.012);
    }
    if(!adjacentBlock(t,-1,0)&&side==='front'){
      stroke(g,[p4(q,.03,.11),p4(q,.03,.93)],pal.stone,.026);
    }
  }
  function roof(g,t,point,pal){
    if(adjacentBlock(t,0,0,1))return;
    const a=point(0,0,blockHeight),b=point(1,0,blockHeight),
      c=point(1,1,blockHeight),d=point(0,1,blockHeight);
    const r0=point(0,.5,blockHeight+.105),r1=point(1,.5,blockHeight+.105);
    poly(g,[a,b,r1,r0],'rgba(222,153,101,.50)');
    poly(g,[r0,r1,c,d],'rgba(123,66,49,.27)');
    for(let i=1;i<=4;i++){
      const u=i/5;
      const n=point(u,0,blockHeight),r=point(u,.5,blockHeight+.105),f=point(u,1,blockHeight);
      stroke(g,[n,r,f],'rgba(112,52,36,.25)',.009);
    }
    const left=adjacentBlock(t,-1,0),right=adjacentBlock(t,1,0);
    if(!left||adjacentBlock(left,0,0,1))stroke(g,[a,r0,d],pal.ridge,.033);
    if(!right||adjacentBlock(right,0,0,1))stroke(g,[b,r1,c],pal.roofDark,.026);
    stroke(g,[r0,r1],pal.ridge,.035);
    if(!adjacentBlock(t,0,-1))stroke(g,[a,b],pal.roofDark,.038);
    if(!adjacentBlock(t,0,1))stroke(g,[d,c],pal.roofDark,.03);
  }
  renderBlock=function(g,t){
    const faces=originalRenderBlock(g,t);
    const {point}=blockGeometry(t),pal=blockPalette(t);
    embellishWall(g,t,point,0,-1,pal,'front');
    embellishWall(g,t,point,1,0,pal,'side');
    roof(g,t,point,pal);
    return faces;
  };
  console.info('Cala House Architecture & Art Pass 01 loaded');
})();
