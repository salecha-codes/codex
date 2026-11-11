import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const materials=new Map(),geometries=new Map();
export function mat(color,metal=0){const key=color+':'+metal;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:metal?.32:.78,metalness:metal}));return materials.get(key)}
export function sphereGeometry(){if(!geometries.has('sphere'))geometries.set('sphere',new T.SphereGeometry(1,14,10));geometries.get('sphere').userData.shared=true;return geometries.get('sphere')}
export function boxGeo(w,h,d,r=.06){const k=[w,h,d,r].join();if(!geometries.has(k))geometries.set(k,r<.035?new T.BoxGeometry(w,h,d):new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/3,h/3,d/3)));geometries.get(k).userData.shared=true;return geometries.get(k)}
export function mesh(parent,geo,color,x=0,y=0,z=0,metal=0){const m=new T.Mesh(geo,mat(color,metal));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export function box(p,w,h,d,c,x=0,y=0,z=0,r=.06,metal=0){return mesh(p,boxGeo(w,h,d,r),c,x,y,z,metal)}
export function ball(p,sx,sy,sz,c,x=0,y=0,z=0){const m=mesh(p,sphereGeometry(),c,x,y,z);m.scale.set(sx,sy,sz);return m}
export function cyl(p,r1,r2,h,c,x=0,y=0,z=0,metal=0){const key=['cylinder',r1,r2,h].join(':');if(!geometries.has(key)){const geo=new T.CylinderGeometry(r1,r2,h,12);geo.userData.shared=true;geometries.set(key,geo)}return mesh(p,geometries.get(key),c,x,y,z,metal)}
export function rod(p,a,b,r,c,metal=0){const av=new T.Vector3(...a),bv=new T.Vector3(...b);const m=cyl(p,r,r,av.distanceTo(bv),c,...av.clone().add(bv).multiplyScalar(.5).toArray(),metal);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m}
export function torus(p,r,t,c,x,y,z){const key=['torus',r,t].join(':');if(!geometries.has(key)){const geo=new T.TorusGeometry(r,t,7,24);geo.userData.shared=true;geometries.set(key,geo)}return mesh(p,geometries.get(key),c,x,y,z)}
export function labelTexture(text,color='#283845',size=512){const c=document.createElement('canvas');c.width=size;c.height=size/2;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='900 100px Arial';ctx.textAlign='center';ctx.textBaseline='middle';const width=ctx.measureText(text).width;if(width>size-30)ctx.font='900 '+Math.floor(100*(size-30)/width)+'px Arial';ctx.fillText(text,size/2,size/4);return new T.CanvasTexture(c)}
const vertexMaterials=new Map();
function batchPart(o,matrix,vertexColors){
 const geo=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(matrix);let material=o.material;
 if(vertexColors&&!material.vertexColors&&material.isMeshStandardMaterial&&!material.map&&!material.transparent&&!material.userData.furniture&&!material.userData.owned&&material.emissive.getHex()===0){
  const key=[material.roughness,material.metalness,material.side,material.depthWrite,material.depthTest].join(':');
  if(!vertexMaterials.has(key)){const m=material.clone();m.color.set('#ffffff');m.vertexColors=true;vertexMaterials.set(key,m)}
  const colors=new Float32Array(geo.attributes.position.count*3),c=material.color;
  for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b}
  geo.setAttribute('color',new T.BufferAttribute(colors,3));material=vertexMaterials.get(key);
 }
 return {geo,material};
}
export function staticBatch(root,vertexColors=false){root.updateMatrixWorld(true);const groups=new Map();root.traverse(o=>{if(o.isMesh){const {geo,material}=batchPart(o,o.matrixWorld,vertexColors),k=material.uuid+o.castShadow+o.receiveShadow;let g=groups.get(k);if(!g){g={mat:material,cast:o.castShadow,receive:o.receiveShadow,geos:[]};groups.set(k,g)}g.geos.push(geo);if(!o.geometry.userData.shared)o.geometry.dispose()}});const merged=new T.Group();for(const g of groups.values()){const geo=mergeGeometries(g.geos);if(geo){const m=new T.Mesh(geo,g.mat);m.castShadow=g.cast;m.receiveShadow=g.receive;merged.add(m)}for(const geo of g.geos)geo.dispose()}return merged}
export function batchLocal(root,exclude=[],vertexColors=false){root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map(),remove=[];const collect=o=>{if(exclude.includes(o))return;if(o.isMesh&&!o.isInstancedMesh){const {geo,material}=batchPart(o,inverse.clone().multiply(o.matrixWorld),vertexColors),key=material.uuid+o.castShadow+o.receiveShadow;let g=groups.get(key);if(!g){g={mat:material,cast:o.castShadow,receive:o.receiveShadow,geos:[]};groups.set(key,g)}g.geos.push(geo);remove.push(o)}for(const child of o.children)collect(child)};for(const child of root.children)collect(child);for(const m of remove){m.removeFromParent();if(!m.geometry.userData.shared)m.geometry.dispose()}for(const g of groups.values()){const geo=mergeGeometries(g.geos);if(geo){const m=new T.Mesh(geo,g.mat);m.castShadow=g.cast;m.receiveShadow=g.receive;root.add(m)}for(const geo of g.geos)geo.dispose()}}

export function plant(p,x,z){cyl(p,.43,.32,.65,'#f0e4d4',x,.35,z);cyl(p,.37,.37,.03,'#584c43',x,.69,z);for(let i=0;i<7;i++){const a=i*2.4;rod(p,[x,.65,z],[x+Math.cos(a)*.35,1.35+i*.09,z+Math.sin(a)*.35],.035,'#69864e');const b=ball(p,.19,.43,.09,i%2?'#82a75d':'#557f49',x+Math.cos(a)*.38,1.4+i*.09,z+Math.sin(a)*.38);b.rotation.set(.3,a,.5*Math.sin(a))}}
