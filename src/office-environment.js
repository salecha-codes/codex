import {buildPenthouseGlazing} from './penthouse-details.js';
import {contactShadowMaterial,addContactShadow} from './furniture-surfaces.js';
import * as T from 'three';
import {box,staticBatch,labelTexture} from './art.js';
import {makeOfficeFurniture} from './office-furniture.js';

// Surface detail stays subtle at driving height. Large floor areas are not checkerboards.
function makeSurface(kind,base){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const c=canvas.getContext('2d');let seed=63;
 const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 c.fillStyle=base;c.fillRect(0,0,512,512);
 if(kind==='geometric-carpet'){
  // Large interlocking L-shaped color fields contain fine carpet-tile seams.
  const cell=32,colors=['#d4d9dd','#a8b7c4','#879fb3','#c3cdd5'];
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
   const bx=Math.floor(x/4),by=Math.floor(y/4),lx=x%4,ly=y%4;
   const field=(bx+by*2)%4,inner=(lx<2&&ly<3)||(ly<2&&lx<3);
   c.fillStyle=colors[inner?field:(field+1)%4];c.fillRect(x*cell,y*cell,cell,cell);
  }
  c.fillStyle='#435c6b12';for(let x=0;x<512;x+=8)c.fillRect(x,0,.5,512);for(let y=0;y<512;y+=8)c.fillRect(0,y,512,.5);
 }else if(kind==='modern-rug'){
  for(let i=12;i<64;i+=12){c.strokeStyle=i%24?'#d0d7dc':'#738a9d';c.lineWidth=3;c.strokeRect(i,i,512-i*2,512-i*2)}
  c.strokeStyle='#d2d9dc24';c.lineWidth=1;for(let y=0;y<512;y+=4){c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke()}
 }else if(kind==='wood'){
  for(let row=0;row<8;row++){
   const y=row*64;c.fillStyle=row%3?'#ffffff07':'#00000007';c.fillRect(0,y,512,64);
   c.fillStyle='#392d281e';c.fillRect(0,y,512,1);c.fillRect((row%3)*171,y,1,64);
   for(let i=0;i<12;i++){
    const yy=y+random()*64;c.strokeStyle=i%2?'#ffffff12':'#614a3515';
    c.beginPath();c.moveTo(0,yy);c.bezierCurveTo(160,yy+5,350,yy-5,512,yy+2);c.stroke();
   }
  }
 }else if(kind==='rug'){
  for(let inset=12;inset<=55;inset+=9){c.lineWidth=5;c.strokeStyle=inset%2?'#d6c49b':'#5e6151';c.strokeRect(inset,inset,512-inset*2,512-inset*2)}
  for(let y=110;y<450;y+=65)for(let x=110;x<450;x+=65){
   c.fillStyle='#dbbe8e';c.beginPath();c.moveTo(x,y-15);c.lineTo(x+12,y);c.lineTo(x,y+15);c.lineTo(x-12,y);c.fill();
  }
 }else if(kind==='rubber'){
  c.fillStyle='#d5dcdc12';for(let y=0;y<512;y+=128)c.fillRect(0,y,512,1);for(let x=0;x<512;x+=128)c.fillRect(x,0,1,512);
 }else if(kind==='concrete'){
  c.fillStyle='#ffffff06';c.fillRect(0,0,250,512);c.fillStyle='#5e63581a';c.fillRect(0,0,512,1);c.fillRect(0,0,1,512);
 }
 const speckles=kind==='carpet'||kind==='grass'?30000:13000;
 for(let i=0;i<speckles;i++){
  c.fillStyle=i%2?'#ffffff0d':'#0000000b';c.fillRect(random()*512,random()*512,kind==='grass'?2:1,kind==='grass'?3:1);
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;return texture;
}

export function buildOfficeInterior(map,buildPreviousCity){
 const root=new T.Group(),solid=new T.Group(),animated=new T.Group(),owned=new Set(),exterior=[];
 root.name='Open rooftop · '+map.id;root.add(animated);
 const theme=map.interior,p=map.palette,{x:rx,z:rz}=map.size;
 const mats=new Map();
 function surface(kind,color,repeatX=1,repeatZ=1){
  const key=[kind,color,repeatX,repeatZ].join(':');if(mats.has(key))return mats.get(key);
  const texture=makeSurface(kind,color);texture.repeat.set(repeatX,repeatZ);
  const material=new T.MeshStandardMaterial({map:texture,roughness:kind==='wood'?.66:.92});
  mats.set(key,material);owned.add(material);return material;
 }
 function panel(w,d,x,z,y,material){const m=box(solid,w,.025,d,'#ffffff',x,y,z,0);m.material=material;return m}
 const wood=surface('wood',theme==='loft'?'#a47d58':'#c7ad83',1,1);
 const luminous=new Map();
 function emit(parent,w,h,d,color,x,y,z){
  if(!luminous.has(color)){
   const material=new T.MeshBasicMaterial({color,toneMapped:false});luminous.set(color,material);owned.add(material);
  }
  const m=box(parent,w,h,d,color,x,y,z,0);m.material=luminous.get(color);m.castShadow=false;return m;
 }
 function zonePanel(zone,material){
  if(!zone.shape)return panel(zone.w,zone.d,zone.x,zone.z,.055,material);
  const a=zone.w/2,b=zone.d/2,shape=new T.Shape();
  if(zone.shape==='ellipse')shape.absellipse(0,0,a,b,0,Math.PI*2,false);
  else{
   const r=Math.min(4,a,b);
   shape.moveTo(-a+r,-b);shape.lineTo(a-r,-b);shape.quadraticCurveTo(a,-b,a,-b+r);
   shape.lineTo(a,b-r);shape.quadraticCurveTo(a,b,a-r,b);shape.lineTo(-a+r,b);
   shape.quadraticCurveTo(-a,b,-a,b-r);shape.lineTo(-a,-b+r);shape.quadraticCurveTo(-a,-b,-a+r,-b);
  }
  const geometry=new T.ShapeGeometry(shape,16),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+a)/zone.w,(uv.getY(i)+b)/zone.d);
  const mesh=new T.Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;mesh.position.set(zone.x,.073,zone.z);mesh.receiveShadow=true;solid.add(mesh);
 }
 function floorLabel(text,x,z,width,color='#4b5d61'){
  const texture=labelTexture(text,color),material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide});
  owned.add(material);const m=new T.Mesh(new T.PlaneGeometry(width,width*.5),material);
  m.rotation.x=-Math.PI/2;m.position.set(x,.13,z);root.add(m);
 }
 // The existing city's towers, roads and traffic are reused verbatim below.
 const previous={...map,id:map.surroundings,seed:map.citySeed};
 buildPreviousCity(solid,previous,animated);
 // Restore the former rooftop slab and facade instead of adding an enclosing room.
 box(solid,rx*2,.65,rz*2,p.wall,0,-.4,0,.035);
 box(solid,rx*2,10,rz*2,p.wall,0,-5.6,0,0);
 panel(rx*2,rz*2,0,0,.025,surface(map.floorStyle==='geometric-carpet'?'geometric-carpet':theme==='oasis'?'grass':'concrete',p.floor,map.floorStyle?1:rx/6,map.floorStyle?1:rz/6));
 for(const side of[-1,1]){
  const x=side*(rx+1.1);
  box(solid,.25,22,rz*2-4,'#d9d6c9',x,-11,0,0);
  for(let z=-rz+3;z<rz-2;z+=4)for(const y of[-3,-7,-11])box(solid,.12,1.7,2.2,'#688796',x+side*.14,y,z,0);
 }
 // Sections are floor finishes and furniture, with open edges and routes between them.
 for(const zone of map.zones){
  const rug=zone.surface==='rug'||zone.surface==='modern-rug';
  zonePanel(zone,surface(zone.surface,zone.color,rug?1:zone.w/9,rug?1:zone.d/9));
  if(theme==='cyber'){
   for(const z of[zone.z-zone.d/2,zone.z+zone.d/2])emit(solid,zone.w,.025,.075,zone.name.includes('HOURS')?'#b29bcf':'#83d0d9',zone.x,.08,z);
   // Small end markers suggest a district without boxing it in.
   for(const x of[zone.x-zone.w/2,zone.x+zone.w/2])emit(solid,.075,.025,2.5,'#83d0d9',x,.08,zone.z-zone.d/2+1.25);
  }else if(!zone.shape){
   const border=theme==='penthouse'?'#8f9fa7':theme==='oasis'?'#abbb8c':'#b9a88a';
   box(solid,zone.w,.018,.12,border,zone.x,.077,zone.z-zone.d/2,0);
  }
  if(zone.name)floorLabel(zone.name,zone.x,zone.z+zone.d/2-1.2,Math.min(zone.w-2,11),theme==='cyber'?'#b3cbd3':theme==='oasis'?'#4a664c':'#4e5f65');
 }
 if(theme==='oasis'){
  // Offset garden paths connect the timber islands rather than repeating a grid.
  panel(8,rz*2,0,0,.062,surface('concrete','#c2c5a3',1,9));
  panel(17,8,-12,3,.064,surface('wood','#c7af88',2,1));
  panel(17,8,12,-3,.064,surface('wood','#c7af88',2,1));
 }else if(theme==='penthouse'){
  panel(10,rz*2,0,0,.063,surface('concrete','#d8dcd8',1,8));
 }
 for(const [x,z] of theme==='oasis'?[[-37,29],[-24,28]]:theme==='penthouse'?[[19,28]]:[]){
  panel(2.7,4.5,x,z,.097,surface('rubber',theme==='oasis'?'#7f9382':'#9ba6a6'));
 }
 const contact=contactShadowMaterial();owned.add(contact);
 for(const o of map.obstacles){
  addContactShadow(solid,o,contact);
  const furniture=makeOfficeFurniture(o,{theme,wood,emit,owned});
  if(furniture)solid.add(furniture);
 }
 // Thin hazard paint only. No walls, glass partitions, rails or invisible edge barriers.
 for(let x=-rx+.5;x<rx;x++)for(const z of[-rz+.15,rz-.15])box(solid,.95,.025,.3,Math.floor(x+rx)%2?p.edge:'#63757b',x,.075,z,0);
 for(let z=-rz+.5;z<rz;z++)for(const x of[-rx+.15,rx-.15])box(solid,.3,.025,.95,Math.floor(z+rz)%2?p.edge:'#63757b',x,.075,z,0);
 root.add(staticBatch(solid));
 if(map.exteriorGlazing){exterior.push(...buildPenthouseGlazing(map,owned));for(const wall of exterior)root.add(wall.group)}
 const viewDirection=new T.Vector3();
 const sky=document.createElement('canvas');sky.width=2;sky.height=256;
 const ctx=sky.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);
 gradient.addColorStop(0,p.skyTop);gradient.addColorStop(1,p.skyBottom);ctx.fillStyle=gradient;ctx.fillRect(0,0,2,256);
 const background=new T.CanvasTexture(sky);background.colorSpace=T.SRGBColorSpace;
 return{
  root,background,fog:new T.Fog(p.fog,130,440),
  update(dt,reducedMotion=false,camera){
   if(camera&&exterior.length){camera.getWorldDirection(viewDirection);for(const wall of exterior)wall.group.visible=viewDirection[wall.axis]*wall.side>.04}
   if(reducedMotion)return;
   for(const car of animated.children){car.position.x+=dt*car.userData.speed;if(car.position.x>120)car.position.x=-120}
  },
  dispose(){
   background.dispose();const disposed=new Set();
   root.traverse(o=>{
    if(!o.isMesh)return;
    if(!disposed.has(o.geometry)&&!o.geometry.userData.shared){disposed.add(o.geometry);o.geometry.dispose()}
    if(o.material.userData?.owned&&!owned.has(o.material)){o.material.map?.dispose();o.material.dispose()}
   });
   for(const material of owned){material.map?.dispose();material.dispose()}
  }
 };
}
