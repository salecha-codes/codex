import * as T from 'three';
import {box,ball,cyl,rod,mat,staticBatch} from './art.js';

// Architecture is real geometry, batched by compatible material, with no remote
// assets or per-frame building animation. Colliders and props share the same plan.
export function campusProp(o){
 const root=new T.Group();root.position.set(o.x,0,o.z);root.userData.collider={...o};const {w,d,h}=o;
 if(o.type==='campusPlanter'){
  box(root,w,h,d,'#baad94',0,h/2,0,.04);box(root,w-.3,.06,d-.3,'#506342',0,h+.02,0,0);
  for(const x of[-2.2,0,2.2]){cyl(root,.13,.2,2.5,'#79604a',x,h+1.25,0);for(let i=0;i<3;i++)ball(root,1.25,1.35,1.05,['#567c4c','#6b8b54','#83a065'][i],x+Math.sin(i*2)*.4,h+2.4+i*.6,Math.cos(i*2)*.25)}
 }else if(o.type==='campusBench'){
  for(const x of[-w*.35,w*.35]){box(root,.23,.65,d,'#596760',x,.325,0,0);box(root,.23,h,.16,'#596760',x,h/2,-d*.38,0)}
  for(let i=0;i<4;i++)box(root,w,.13,.25,'#a8774c',0,.65,-d*.34+i*.3,.025);
  for(let i=0;i<3;i++)box(root,w,.14,.12,'#ad8054',0,.85+i*.16,-d*.4,.02);
 }else if(o.type==='campusKiosk'){
  box(root,w,h-.4,d,'#c9bb98',0,(h-.4)/2,0,.02);box(root,w+.5,.22,d+.5,'#995d46',0,h-.25,0,.02);
  box(root,w-.65,1.4,.06,'#34585d',0,1.65,d/2+.04,0);box(root,w+.2,.16,.7,'#e4d5b6',0,.95,d/2+.15,.02);
  for(const x of[-w/2+.25,w/2-.25])box(root,.25,h,.25,'#e2d6ba',x,h/2,d/2+.1,0);
 }else if(o.type==='campusSculpture'){
  box(root,w,.65,d,'#918c7b',0,.325,0,.025);const ring=new T.Mesh(new T.TorusGeometry(1.05,.18,6,24),mat('#b68a46',.4));ring.position.y=2.3;ring.rotation.set(.25,.45,.45);root.add(ring);rod(root,[-.7,.6,0],[.7,3.7,0],.16,'#6b7776',.4);
 }else return null;
 return root;
}
function terrace(root,width,y){
 const shape=new T.Shape();shape.moveTo(-width/2,7.5);shape.lineTo(width/2,7.5);
 for(let i=40;i>=0;i--){const x=-width/2+width*i/40;shape.lineTo(x,-(7.8+Math.sin((x/width+.5)*Math.PI*3)*1.25))}shape.closePath();
 const geo=new T.ExtrudeGeometry(shape,{depth:.38,bevelEnabled:false,curveSegments:1});geo.rotateX(-Math.PI/2);const mesh=new T.Mesh(geo,mat('#eee4cb'));mesh.position.y=y;mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);
}
export function buildCampusEnvironment(map){
 const root=new T.Group(),solid=new T.Group(),signs=new T.Group(),owned=new Set();root.add(signs);
 const p=map.palette,{x:rx,z:rz}=map.size;
 function label(parent,text,x,y,z,width,height=1.5,rotation=0,background='#eee4ce',ink='#294d62'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=background;c.fillRect(0,0,1024,128);c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';c.font='bold 64px Arial';const measured=c.measureText(text).width;if(measured>980)c.font=`bold ${Math.floor(64*980/measured)}px Arial`;c.fillText(text,512,68);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const material=new T.MeshBasicMaterial({map:texture,side:T.DoubleSide});material.userData.owned=true;owned.add(material);const mesh=new T.Mesh(new T.PlaneGeometry(width,height),material);mesh.position.set(x,y,z);mesh.rotation.y=rotation;parent.add(mesh);return mesh;
 }
 function tree(x,z,scale=1){
  cyl(solid,.28*scale,.45*scale,4.8*scale,'#7d654d',x,2.4*scale,z);
  for(let i=0;i<4;i++)ball(solid,2.25*scale,2.5*scale,2*scale,['#54794e','#6b8b53','#799b5f','#608553'][i],x+Math.sin(i*2.1)*scale,4.8*scale+i*.65*scale,z+Math.cos(i*2.1)*scale);
 }
 function academicWing(x,z,rotation,title){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;solid.add(g);
  box(g,64,15,13,'#aaa18c',0,-7.5,0,0);box(g,64,21,13,'#cdbfa2',0,10.5,0,0);box(g,65,.6,14,'#eee1bf',0,21.3,0,0);
  for(let floor=0;floor<4;floor++){
   box(g,64,.4,14,'#e9dcc0',0,1+floor*5.1,0,0);
   for(let col=0;col<15;col++){const px=-29.4+col*4.2;box(g,3.2,3.3,.14,col%3?'#70929a':'#496e7c',px,3.3+floor*5.1,6.61,0,.15);box(g,.15,3.4,.2,'#ded5bd',px,3.3+floor*5.1,6.73,0)}
  }
  for(const px of[-27,0,27])box(g,1.5,22,14,'#a56751',px,11,0,0);
  // Labels are added outside the batched mesh hierarchy, in world coordinates.
  const pos=new T.Vector3(0,22.1,7).applyAxisAngle(new T.Vector3(0,1,0),rotation).add(new T.Vector3(x,0,z));label(signs,title,pos.x,pos.y,pos.z,33,1.6,rotation);
 }
 // Playable raised courtyard: the clear painted boundary preserves Knockout rules.
 const paving=document.createElement('canvas');paving.width=paving.height=512;const pc=paving.getContext('2d');pc.fillStyle='#a9a28f';pc.fillRect(0,0,512,512);
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){pc.fillStyle=['#c7bea9','#c8bfaa','#c5bca8','#c9c0ab'][(row*3+col)%4];pc.fillRect(col*128+1,row*128+1,126,126)}
 const pavingTexture=new T.CanvasTexture(paving);pavingTexture.colorSpace=T.SRGBColorSpace;pavingTexture.wrapS=pavingTexture.wrapT=T.RepeatWrapping;pavingTexture.repeat.set(rx/8,rz/8);pavingTexture.anisotropy=4;
 const pavingMaterial=new T.MeshStandardMaterial({map:pavingTexture,roughness:.92});pavingMaterial.userData.owned=true;owned.add(pavingMaterial);
 box(solid,rx*2,.55,rz*2,'#a89a80',0,-.32,0,.025);const courtyard=box(solid,rx*2,.1,rz*2,p.floor,0,-.02,0,0);courtyard.material=pavingMaterial;
 box(solid,rx*2,9,rz*2,'#9c957f',0,-4.85,0,0);box(solid,300,.3,260,'#849c71',0,-15,0,0);
 box(solid,13,.015,rz*2-.5,'#ded4bd',0,.055,0,0);box(solid,rx*2-.5,.015,12,'#ded4bd',0,.056,0,0);
 const medallion=new T.Mesh(new T.RingGeometry(4.8,5.1,48),mat('#9f8a5f'));medallion.rotation.x=-Math.PI/2;medallion.position.y=.077;solid.add(medallion);
 for(const s of[-1,1]){
  for(const t of[-1,1]){box(solid,17,.018,13,'#8ba36b',s*46,.065,t*29,0);for(let j=0;j<4;j++)ball(solid,.8,.35,.8,'#5d844c',s*46+(j-1.5)*3.5,.25,t*34)}
  for(let x=-rx+1;x<rx;x+=2)box(solid,1.8,.025,.35,(x+rx)%4===1?'#d7b76d':'#687669',x,.073,s*(rz-.2),0);
  for(let z=-rz+1;z<rz;z+=2)box(solid,.35,.025,1.8,(z+rz)%4===1?'#d7b76d':'#687669',s*(rx-.2),.074,z,0);
 }
 for(const o of map.obstacles){const model=campusProp(o);if(model)solid.add(model)}
 // B. S. Narayan Platinum Jubilee Block: undulating cream terraces, terracotta
 // vertical cores, deep blue glazing and a shaded entrance portico.
 const main=new T.Group();main.position.z=-62;solid.add(main);box(main,82,15,14,'#aaa18c',0,-7.5,0,0);box(main,82,25,14,'#c8bca0',0,12.5,0,0);
 for(let floor=0;floor<5;floor++){
  for(let col=0;col<19;col++){const x=-38.7+col*4.3;box(main,3.8,3.6,.18,col%4===0?'#91abb1':'#52798a',x,3+floor*4.8,7.15,0,.18);box(main,.13,3.65,.23,'#e0d9c1',x,3+floor*4.8,7.28,0)}
  terrace(main,85,1+floor*4.8);
 }
 terrace(main,86,25.25);
 for(const x of[-27,27]){box(main,4.8,26,16.8,'#a85f49',x,13,0,0);box(main,2.5,23,.12,'#8f4f3d',x,13,8.5,0)}
 for(const x of[-10,-5,5,10]){box(main,.75,5.4,.75,'#eee1c3',x,2.7,10.4,.03);box(main,1.1,.25,1.1,'#c7b994',x,.13,10.4,.025)}
 box(main,24,.4,5,'#dfd1ae',0,5.5,9.4,0);box(main,15,4.6,.15,'#385969',0,2.4,7.2,0,.15);
 for(let i=0;i<3;i++)box(main,27-i*1.6,.14,3.7-i*.6,'#c5b89e',0,.08+i*.14,10.7,0);
 label(signs,'B. S. NARAYAN PLATINUM JUBILEE BLOCK',0,26.5,-53.6,66,1.7);
 label(signs,'B.M.S. COLLEGE OF ENGINEERING',0,5.9,-48.8,25,1.1);
 academicWing(-75,-7,Math.PI/2,'ACADEMIC BLOCK');academicWing(75,-7,-Math.PI/2,'LIBRARY & LEARNING CENTRE');
 // Campus gate and shaded avenue beyond the south edge.
 for(const x of[-13,13]){box(solid,2.5,7.8,3,'#aa6f54',x,3.9,57,0);box(solid,3.2,.5,3.7,'#e4d5b5',x,8,57,0)}
 box(solid,29,1.8,2.7,'#e8d9b8',0,7.5,57,0);label(signs,'BMSCE  ·  BASAVANAGUDI, BENGALURU',0,7.5,55.55,27,1.5);
 box(solid,20,.15,30,'#a7a49a',0,-.1,68,0);
 for(const s of[-1,1])for(let i=0;i<7;i++)tree(s*(53+(i%2)*7),-45+i*16,.9+(i%3)*.12);
 for(const s of[-1,1])for(let i=0;i<3;i++)tree(s*(23+i*13),53,.9);
 for(const s of[-1,1])for(let i=0;i<6;i++){const x=s*34,z=-36+i*14;cyl(solid,.055,.07,4.3,'#526b65',x,2.15,z);box(solid,.7,.18,.7,'#e5d7ad',x,4.35,z,.025)}
 label(signs,'BMSCE  /  CAMPUS CLASH',0,.08,35,24,3).rotation.x=-Math.PI/2;
 root.add(staticBatch(solid,true));
 const sky=document.createElement('canvas');sky.width=2;sky.height=256;const ctx=sky.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,p.skyTop);gradient.addColorStop(1,p.skyBottom);ctx.fillStyle=gradient;ctx.fillRect(0,0,2,256);const background=new T.CanvasTexture(sky);background.colorSpace=T.SRGBColorSpace;
 return {root,background,fog:new T.Fog(p.fog,160,340),update(){},dispose(){background.dispose();const geos=new Set();root.traverse(o=>{if(o.geometry&&!o.geometry.userData.shared&&!geos.has(o.geometry)){geos.add(o.geometry);o.geometry.dispose()}});for(const m of owned){m.map?.dispose();m.dispose()}}};
}
