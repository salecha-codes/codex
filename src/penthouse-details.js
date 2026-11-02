import * as T from 'three';
import {box,staticBatch} from './art.js';
import {furnitureMaterial} from './furniture-surfaces.js';

// Exterior glazing is a camera cutaway outside the playable drop-off, not interior cover.
export function buildPenthouseGlazing(map,owned){
 const material=new T.MeshStandardMaterial({color:'#b7d9ea',metalness:.12,roughness:.12,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
 owned.add(material);const result=[];
 for(const axis of['x','z'])for(const side of[-1,1]){
  const group=new T.Group(),span=axis==='x'?map.size.z*2:map.size.x*2,edge=side*(map.size[axis]+.65),height=9.5;
  const panelWidth=span/Math.ceil(span/7.5),n=Math.round(span/panelWidth);
  for(let i=0;i<n;i++){
   const along=-span/2+(i+.5)*panelWidth;
   const pane=axis==='x'?box(group,.045,height,panelWidth-.12,'#ffffff',edge,height/2,along,0):box(group,panelWidth-.12,height,.045,'#ffffff',along,height/2,edge,0);
   pane.material=material;pane.castShadow=pane.receiveShadow=false;
  }
  for(let i=0;i<=n;i++){
   const along=-span/2+i*panelWidth;
   const frame=axis==='x'?box(group,.14,height,.105,'#718997',edge,height/2,along,0):box(group,.105,height,.14,'#718997',along,height/2,edge,0);
   frame.material=furnitureMaterial('brushed','#8295a0');frame.castShadow=frame.receiveShadow=false;
  }
  for(const y of[.12,height]){
   const frame=axis==='x'?box(group,.15,.14,span,'#718997',edge,y,0,0):box(group,span,.14,.15,'#718997',0,y,edge,0);
   frame.material=furnitureMaterial('brushed','#8295a0');frame.castShadow=frame.receiveShadow=false;
  }
  const batch=staticBatch(group);batch.name='Exterior glass · '+axis+side;
  result.push({group:batch,axis,side});
 }
 return result;
}
