import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// A separate material/geometry library keeps the city's established art unchanged.
const materials=new Map(),geometries=new Map(),textures=new Map();let reflection=null;
export function setFurnitureReflection(texture){reflection=texture;for(const m of materials.values()){m.envMap=texture;m.needsUpdate=true}}
function maps(kind){
 if(textures.has(kind))return textures.get(kind);
 const size=128,height=new Float32Array(size*size),rgb=new Uint8Array(size*size*4),normal=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4);
 let seed=371;const random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=y*size+x,n=random();let h=.5;
  if(kind==='wood'){
   const warp=Math.sin(x*.024)*2.5+Math.sin(x*.071)*.65;
   h=.6+.12*Math.sin(y*.58+warp)+.055*Math.sin(y*2.4+warp*2)+.035*(n-.5);
   if(n>.982)h-=.14;
  }else if(kind==='fabric'){
   h=.48+.13*Math.sin(x*Math.PI/4)*Math.sin(y*Math.PI/4)+.035*(n-.5);
  }else if(kind==='leather')h=.53+.07*Math.sin(x*.8+Math.sin(y*.6)*2)+.1*(n-.5);
  else if(kind==='rubber')h=.5+.035*Math.sin(y*1.1)+.045*(n-.5);
  else if(kind==='mesh')h=(x%10<2||y%10<2)?.69:.3;
  else if(kind==='brushed')h=.52+.05*(n-.5)+.035*Math.sin(y*2.2);
  else h=.55+.045*(n-.5);
  height[i]=h;
  const value=Math.round(185+h*68),r=kind==='brushed'?Math.round(180+random()*30):Math.round(205+h*35);
  rgb.set([value,value,value,255],i*4);rough.set([r,r,r,255],i*4);
 }
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size];
  const dy=height[(y+1)%size*size+x]-height[(y+size-1)%size*size+x];
  const v=new T.Vector3(-dx*2.2,-dy*2.2,1).normalize();normal.set([Math.round(v.x*127+128),Math.round(v.y*127+128),Math.round(v.z*127+128),255],(y*size+x)*4);
 }
 const make=(data,color=false)=>{const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;if(color)t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t};
 const result={map:make(rgb,true),normalMap:make(normal),roughnessMap:make(rough)};textures.set(kind,result);return result;
}
export function furnitureMaterial(kind,color='#ffffff'){
 const key=kind+color;if(materials.has(key))return materials.get(key);
 const settings={wood:[.43,.02,.13],fabric:[.92,0,.32],mesh:[.85,0,.22],leather:[.6,0,.17],rubber:[.87,0,.16],brushed:[.27,.86,.07],paint:[.37,.25,.06],ceramic:[.24,.02,.04],leaf:[.64,0,.1],plastic:[.43,.08,.05]};
 const [roughness,metalness,bump]=settings[kind]||settings.plastic;
 const grain=kind==='leaf'||kind==='ceramic'||kind==='paint'?'plastic':kind;
 const m=new T.MeshStandardMaterial({color,...maps(grain),roughness,metalness,normalScale:new T.Vector2(bump,bump),envMap:reflection,envMapIntensity:kind==='brushed'?1.15:.45,side:kind==='leaf'?T.DoubleSide:T.FrontSide});
 m.userData.furniture=true;m.userData.surface=kind;materials.set(key,m);return m;
}
export function furnitureBox(parent,w,h,d,color,x=0,y=0,z=0,r=.06,metal=0){
 const radius=Math.min(r,w/3,h/3,d/3),segments=1,key=[w,h,d,radius,segments].join(':');
 if(!geometries.has(key)){
  const g=radius<.012?new T.BoxGeometry(w,h,d):new RoundedBoxGeometry(w,h,d,segments,radius);
  // World-sized UVs keep fabric and grain consistent between a cushion and a long desk.
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
   if(ny>=nx&&ny>=nz)uv.setXY(i,p.getX(i)*.55,p.getZ(i)*1.5);
   else if(nx>=nz)uv.setXY(i,p.getZ(i)*.55,p.getY(i)*1.5);
   else uv.setXY(i,p.getX(i)*.55,p.getY(i)*1.5);
  }
  g.userData.shared=true;geometries.set(key,g);
 }
 const m=new T.Mesh(geometries.get(key),furnitureMaterial(metal||['#83969d','#737f85','#71818a'].includes(color)?'brushed':'plastic',color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
export function finishFurniture(root,wood,theme){
 root.traverse(m=>{
  if(!m.isMesh||m.material.isMeshBasicMaterial||m.material.userData.furniture)return;
  let kind='plastic',color=m.material.color?.getHexString()||'ffffff';
  if(m.material===wood){kind='wood';color=theme==='loft'?'986c43':'c4a47a'}
  else if(['cfaa79','9b815f'].includes(color))kind='wood';
  else if(m.material.metalness>.25||['83969d','71818a','737f85'].includes(color))kind='brushed';
  else if(['26353e','35434c','4b5962','6c737b'].includes(color))kind='rubber';
  else if(['5e8053','79945d','91a878','50724a','789258','94a474'].includes(color))kind='leaf';
  m.material=furnitureMaterial(kind,'#'+color);
 });
}
export function fabric(mesh,color,kind='fabric'){mesh.material=furnitureMaterial(kind,color);return mesh}
export function curvedTube(parent,points,radius,color,kind='brushed'){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
 const g=new T.TubeGeometry(curve,Math.max(8,points.length*3),radius,6,false);
 const m=new T.Mesh(g,furnitureMaterial(kind,color));m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
export function upholsteredSeam(parent,w,d,x,y,z,color){
 const r=.12,a=w/2-r,b=d/2-r;
 return curvedTube(parent,[[-a+x,y,-b+z],[a+x,y,-b+z],[a+r+x,y,-b+r+z],[a+r+x,y,b-r+z],[a+x,y,b+z],[-a+x,y,b+z],[-a-r+x,y,b-r+z],[-a-r+x,y,-b+r+z],[-a+x,y,-b+z]],.012,color,'fabric');
}
export function displayMaterial(kind='desktop'){
 const key='screen:'+kind;if(materials.has(key))return materials.get(key);
 // Data textures allow the same models to be validated without a browser DOM.
 const w=256,h=160,data=new Uint8Array(w*h*4);const rect=(x,y,rw,rh,c)=>{for(let yy=Math.max(0,y);yy<Math.min(h,y+rh);yy++)for(let xx=Math.max(0,x);xx<Math.min(w,x+rw);xx++)data.set([...c,255],(yy*w+xx)*4)};
 rect(0,0,w,h,kind==='fitness'?[23,35,41]:[38,62,77]);
 if(kind==='fitness'){
  for(let i=0;i<3;i++){rect(16+i*82,27,64,47,[12,21,28]);for(let bar=0;bar<4;bar++)rect(23+i*82+bar*12,36+bar%2*8,8,25,[140,199,184]);}
  for(let i=0;i<24;i++)rect(12+i*10,110-Math.floor(Math.sin(i*.8)*19),7,3,[115,177,176]);
 }else if(kind==='arcade'){
  for(let i=0;i<22;i++)rect((i*43)%238,(i*29)%145,8,8,i%3?[98,173,191]:[205,151,118]);
  rect(38,69,180,16,[190,199,206]);
 }else{
  rect(6,7,244,13,[172,191,198]);rect(9,25,46,115,[49,74,83]);rect(62,25,183,115,[213,220,218]);
  for(let i=0;i<7;i++){rect(69,34+i*12,43+i%3*22,3,[96,127,141]);rect(143,34+i*12,89-i%2*30,3,[165,181,181]);}
  rect(68,120,72,12,[111,151,158]);rect(4,148,248,7,[26,42,52]);
 }
 const t=new T.DataTexture(data,w,h);t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;
 const m=new T.MeshStandardMaterial({map:t,emissive:'#ffffff',emissiveMap:t,emissiveIntensity:.18,roughness:.27,metalness:.12,envMap:reflection,envMapIntensity:.3});m.userData.furniture=true;materials.set(key,m);return m;
}

export function contactShadowMaterial(){
 const n=64,data=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const ax=Math.abs((x+.5)/n*2-1),ay=Math.abs((y+.5)/n*2-1);
  const edge=Math.max(ax,ay),core=Math.exp(-Math.pow(edge/.72,5));
  data.set([28,34,36,Math.round(core*62)],(y*n+x)*4);
 }
 const map=new T.DataTexture(data,n,n);map.needsUpdate=true;map.magFilter=T.LinearFilter;map.minFilter=T.LinearFilter;
 const m=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});m.userData.owned=true;return m;
}
export function addContactShadow(root,o,material){
 if(o.type==='objective'||o.type==='roofAccess'||o.type==='partition')return;
 const mesh=new T.Mesh(new T.PlaneGeometry(o.w+1.1,o.d+1.1),material);
 mesh.rotation.x=-Math.PI/2;mesh.position.set(o.x,.115,o.z);mesh.castShadow=mesh.receiveShadow=false;root.add(mesh);
}

let leafGeometry;
export function leaf(parent,position,direction,length,width,color){
 if(!leafGeometry){
  const vertices=[],uvs=[],indices=[];
  for(let y=0;y<=6;y++)for(let x=0;x<=2;x++){
   const t=y/6,u=x-1,s=Math.sin(t*Math.PI)*.5;
   vertices.push(u*s,t,.1*Math.sin(t*Math.PI)+.035*Math.abs(u)*Math.sin(t*Math.PI));uvs.push(x/2,t);
  }
  for(let y=0;y<6;y++)for(let x=0;x<2;x++){const a=y*3+x;indices.push(a,a+1,a+3,a+1,a+4,a+3)}
  leafGeometry=new T.BufferGeometry();leafGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));leafGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));leafGeometry.setIndex(indices);leafGeometry.computeVertexNormals();leafGeometry.userData.shared=true;
 }
 const m=new T.Mesh(leafGeometry,furnitureMaterial('leaf',color));m.position.set(...position);m.scale.set(width,length,length);
 m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...direction).normalize());m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
