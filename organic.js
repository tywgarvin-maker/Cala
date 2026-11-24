/* Cala Organic Recognition Pass 02.
 * Overlays the original strict recognizer with tolerant, progressive detection.
 * Does not change history, saves, or user-placed block geometry.
 * Uses the SAME recognition function for demo and player-created structures.
 */
(function(root){
  'use strict';
  const ax=.64,az=.23,bx=.48,bz=-.52,det=ax*bz-bx*az;
  const dirs=[[[1,0],[0,1]],[[0,1],[-1,0]],[[-1,0],[0,-1]],[[0,-1],[1,0]]];
  const k=(a,b)=>a+','+b;
  function analyze(blocks){
    const ground=blocks.filter(b=>b.level===0);
    const remaining=ground.slice(), features=[];
    while(remaining.length){
      const anchor=remaining.shift(),pos=new Map([['0,0',anchor]]);
      for(let i=remaining.length-1;i>=0;i--){
        const b=remaining[i],dx=b.x-anchor.x,dz=b.z-anchor.z;
        const u=(dx*bz-dz*bx)/det,v=(dz*ax-dx*az)/det;
        if(Math.abs(u-Math.round(u))<.035&&Math.abs(v-Math.round(v))<.035){
          pos.set(k(Math.round(u),Math.round(v)),b);remaining.splice(i,1);
        }
      }
      if(pos.size<6)continue;
      const has=(a,b)=>pos.has(k(a,b));
      const pts=[...pos.keys()].map(v=>v.split(',').map(Number));
      const minU=Math.min(...pts.map(p=>p[0])),maxU=Math.max(...pts.map(p=>p[0]));
      const minV=Math.min(...pts.map(p=>p[1])),maxV=Math.max(...pts.map(p=>p[1]));
      const candidates=[];
      // Enclosed garden: recognisable four-sided enclosure, allowing small
      // construction gaps. Interior must remain unbuilt.
      for(let size=8;size>=4;size--)for(let u=minU;u<=maxU-size+1;u++)for(let v=minV;v<=maxV-size+1;v++){
        let present=0,inside=0;const edges=[0,0,0,0];
        for(let i=0;i<size;i++)for(let j=0;j<size;j++){
          if(!has(u+i,v+j))continue;
          if(i===0||j===0||i===size-1||j===size-1){
            present++;if(i===0)edges[0]++;if(i===size-1)edges[1]++;
            if(j===0)edges[2]++;if(j===size-1)edges[3]++;
          }else inside++;
        }
        const completion=present/(4*size-4);
        if(!inside&&completion>=.84&&edges.every(n=>n>=Math.ceil(size*.6)))
          candidates.push({type:'garden',u,v,size,area:size*size,completion,anchor});
      }
      // Entrance court: an open U with a back wall and two visible wings.
      for(const [[au,av],[bu,bv]] of dirs){
        const cell=(u,v,i,j)=>[u+i*au+j*bu,v+i*av+j*bv];
        for(const [u,v] of pts)for(let w=3;w<=7;w++)for(let d=3;d<=7;d++){
          let count=0,rear=0,left=0,right=0,interior=0,front=0;
          for(let i=0;i<w;i++)for(let j=0;j<d;j++){
            const [x,y]=cell(u,v,i,j);if(!has(x,y))continue;
            if(j===0||i===0||i===w-1){count++;if(j===0)rear++;if(i===0)left++;if(i===w-1)right++;}
            else interior++;
          }
          for(let i=1;i<w-1;i++){const [x,y]=cell(u,v,i,d);if(has(x,y))front++;}
          const completion=count/(w+2*d-2);
          if(!interior&&!front&&completion>=.74&&rear>=Math.ceil(w*.66)&&left>=Math.ceil(d*.60)&&right>=Math.ceil(d*.60))
            candidates.push({type:'entrance',u,v,w,d,au,av,bu,bv,area:w*d,completion,anchor});
        }
      }
      // Boulevard: paired rows with a clear pedestrian corridor.
      for(const [[au,av],[bu,bv]] of dirs.slice(0,2))for(const [u,v] of pts)for(let gap=1;gap<=3;gap++){
        const l=i=>has(u+i*au,v+i*av);
        const r=i=>has(u+i*au+(gap+1)*bu,v+i*av+(gap+1)*bv);
        if(!l(0)||(!r(0)&&!r(1)))continue;
        let len=0,lcount=0,rcount=0;
        while(len<32){
          const x=u+len*au,y=v+len*av;
          let clear=true;for(let j=1;j<=gap;j++)if(has(x+j*bu,y+j*bv)){clear=false;break;}
          if(!clear||(!l(len)&&!r(len)))break;
          lcount+=l(len)?1:0;rcount+=r(len)?1:0;len++;
        }
        if(len>=3&&lcount>=Math.ceil(len*.67)&&rcount>=Math.ceil(len*.67)&&!(l(-1)&&r(-1)))
          candidates.push({type:'boulevard',u,v,len,gap,au,av,bu,bv,area:len*(gap+2),completion:(lcount+rcount)/(2*len),anchor});
      }
      const order={garden:0,entrance:1,boulevard:2};
      candidates.sort((a,b)=>order[a.type]-order[b.type]||b.area*b.completion**3-a.area*a.completion**3);
      const claimed=new Set();
      for(const f of candidates){
        const tiles=[];
        if(f.type==='garden')for(let i=1;i<f.size-1;i++)for(let j=1;j<f.size-1;j++)tiles.push(k(f.u+i,f.v+j));
        if(f.type==='entrance')for(let i=1;i<f.w-1;i++)for(let j=1;j<f.d;j++)tiles.push(k(f.u+i*f.au+j*f.bu,f.v+i*f.av+j*f.bv));
        if(f.type==='boulevard')for(let i=0;i<f.len;i++)for(let j=1;j<=f.gap;j++)tiles.push(k(f.u+i*f.au+j*f.bu,f.v+i*f.av+j*f.bv));
        if(tiles.some(t=>claimed.has(t)))continue;
        for(const t of tiles)claimed.add(t);
        features.push({...f,tiles});
        if(features.length>=24)break;
      }
    }
    return features;
  }
  root.analyzeRomanPatterns=analyze;
})(globalThis);
