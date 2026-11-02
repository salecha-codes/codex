import * as T from 'three';

// Directional rendered character artwork over the existing 3D chair; no fake mesh claim.
const main=new T.Texture(),reactions=new T.Texture();
for(const texture of[main,reactions]){texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.anisotropy=4}
let loading;
export function preloadBossAssets(){
 if(typeof document==='undefined')return Promise.resolve();
 if(!loading){const loader=new T.TextureLoader();loading=Promise.all([
  loader.loadAsync('/characters/boss-turnaround.webp?v=15').then(t=>{main.image=t.image;main.needsUpdate=true;t.dispose()}),
  loader.loadAsync('/characters/boss-comeback.webp?v=15').then(t=>{reactions.image=t.image;reactions.needsUpdate=true;t.dispose()})
 ]).catch(error=>{loading=null;throw new Error('The Boss artwork could not load. '+error.message)})}
 return loading;
}
export const BOSS_VIEWS=['FRONT','FRONT ¾','RIGHT SIDE','REAR ¾','BACK','REAR ¾','LEFT SIDE','FRONT ¾'];
export function bossViewIndex(relativeYaw){return((Math.round(-relativeYaw/(Math.PI/4))%8)+8)%8}
export function bossComebackPose(seconds){return seconds<.75?0:seconds<1.65?1:seconds<2.75?2:seconds<3.35?3:-1}
export function bossComebackCaption(seconds){return seconds<.75?'WHO AUTHORISED THAT EXIT?':seconds<1.65?'NOT A SCRATCH ON THE SUIT.':seconds<2.75?'BACK ON THE CLOCK.':seconds<3.35?'YOU. MY OFFICE. NOW.':'THE BOSS IS BACK IN HIS CHAIR.'}
export function makeBoss(rig){
 if(typeof document!=='undefined')preloadBossAssets().catch(error=>console.error(error));
 const billboard=new T.Group();billboard.name='The Boss · directional artwork';rig.add(billboard);
 const geometry=new T.PlaneGeometry(3.2,3.2),baseUV=geometry.attributes.uv.array.slice();
 const material=new T.MeshBasicMaterial({map:main,transparent:true,alphaTest:.045,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 material.userData.owned=true;
 const mesh=new T.Mesh(geometry,material);mesh.position.set(0,1.65,.1);mesh.renderOrder=2;billboard.add(mesh);
 const head=new T.Group(),tail=new T.Group();head.position.set(0,2.8,.1);rig.add(head,tail);
 return{head,tail,eyes:[],boss:{billboard,mesh,baseUV,frame:-1,sheet:'',relativeYaw:0}};
}
function setFrame(boss,index,sheet){
 if(boss.frame===index&&boss.sheet===sheet)return;
 boss.frame=index;boss.sheet=sheet;
 const action=sheet==='reaction',cols=4,rows=action?1:2,col=index%4,row=Math.floor(index/4),uv=boss.mesh.geometry.attributes.uv;
 // A small transparent inset prevents adjacent atlas cells bleeding at distance.
 for(let i=0;i<uv.count;i++){
  const u=boss.baseUV[i*2],v=boss.baseUV[i*2+1],inset=.003;
  uv.setXY(i,(col+inset+u*(1-inset*2))/cols,1-(row+inset+(1-v)*(1-inset*2))/rows);
 }
 uv.needsUpdate=true;boss.mesh.material.map=action?reactions:main;boss.mesh.material.needsUpdate=true;
 boss.mesh.scale.x=action?.75:1;
}
const position=new T.Vector3(),cameraPosition=new T.Vector3(),direction=new T.Vector3(),rotation=new T.Quaternion(),euler=new T.Euler(0,0,0,'YXZ');
export function updateBossView(r,camera,clock=0,{pose=-1,reducedMotion=false}={}){
 if(!r.boss)return;
 r.root.updateWorldMatrix(true,true);r.root.getWorldPosition(position);camera.getWorldPosition(cameraPosition);
 if(camera.isOrthographicCamera){camera.getWorldDirection(direction);cameraPosition.copy(position).addScaledVector(direction,-10)}
 const yaw=Math.atan2(cameraPosition.x-position.x,cameraPosition.z-position.z);
 r.rig.getWorldQuaternion(rotation);euler.setFromQuaternion(rotation,'YXZ');
 const relative=yaw-euler.y;r.boss.relativeYaw=relative;
 r.boss.billboard.rotation.y=relative;
 r.boss.mesh.position.z=Math.cos(relative)>=-.03?.7:.1;
 r.boss.mesh.position.y=1.65+(reducedMotion?0:Math.sin(clock*1.8)*.009);
 setFrame(r.boss,pose>=0?pose:bossViewIndex(relative),pose>=0?'reaction':'turnaround');
}
