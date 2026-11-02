import * as T from 'three';
import {DEFAULT_MAP} from './maps.js';
export class CameraRig{
 constructor(){this.overhead=new T.OrthographicCamera(-20,20,20,-20,.1,500);this.chase=new T.PerspectiveCamera(62,1,.12,450);this.menu=new T.OrthographicCamera(-28,28,18,-18,.1,500);this.active=this.overhead;this.follow=new T.Vector3();this.look=new T.Vector3();this.yaw=0;this.key='';this.ready=false;this.map=DEFAULT_MAP;this.setMap(DEFAULT_MAP)}
 setMap(map){this.map=map;this.resize()}
 resize(){const aspect=innerWidth/innerHeight,m=this.map.size,height=Math.max((m.x*.415+m.z*.54)*2+9,((m.x*.795+m.z*.607)*2+9)/aspect);this.overhead.left=-height*aspect/2;this.overhead.right=height*aspect/2;this.overhead.top=height/2;this.overhead.bottom=-height/2;this.overhead.position.set(29,43,38);this.overhead.lookAt(0,.6,0);this.overhead.updateProjectionMatrix();const menuHeight=aspect<1?37/aspect:Math.max(34,56/aspect);this.menu.left=-menuHeight*aspect/2;this.menu.right=menuHeight*aspect/2;this.menu.top=menuHeight/2;this.menu.bottom=-menuHeight/2;this.menu.position.set(23,32,30);this.menu.lookAt(0,.6,0);this.menu.updateProjectionMatrix();const shift=new T.Vector3(aspect<1?0:-menuHeight*aspect*.13,aspect<1?-menuHeight*.19:0,0).applyQuaternion(this.menu.quaternion);this.menu.position.add(shift);this.menu.updateMatrixWorld();this.chase.aspect=aspect;this.chase.fov=aspect<1?75:62;this.chase.updateProjectionMatrix();this.reset()}
 reset(){this.ready=false;this.key=''}
 update(players,dt,{menu=false,view='chase',localPlayer=0,countdown=0,ended=false,winner=0,reducedMotion=false}={}){const effective=menu?'menu':view,key=effective+':'+ended,changed=this.key!==key;this.key=key;
  if(effective==='overhead'){this.active=this.overhead;return this.active}this.active=this.chase;const focus=ended&&!players[winner]?.fall?winner:localPlayer,p=players[menu?0:focus]||players[0],pos=new T.Vector3(p.x,0,p.z);
  if(effective==='menu'){this.active=this.menu;return this.active}
  if(changed){this.chase.clearViewOffset();this.chase.updateProjectionMatrix()}if(changed||!this.ready||this.follow.distanceTo(pos)>18){this.follow.copy(pos);this.yaw=p.angle;this.ready=true;this.snap=true}else{this.follow.lerp(pos,1-Math.exp(-14*dt));const delta=Math.atan2(Math.sin(p.angle-this.yaw),Math.cos(p.angle-this.yaw));this.yaw+=delta*(1-Math.exp(-7*dt))}
  const intro=!reducedMotion?Math.max(0,Math.min(1,countdown/3)):0,direction=new T.Vector3(Math.sin(this.yaw),0,Math.cos(this.yaw)),speed=Math.min(22,Math.hypot(p.vx,p.vz)),distance=10+speed*.065+intro*4;const target=this.follow.clone().addScaledVector(direction,2.5);target.y=1.55;const desired=this.follow.clone().addScaledVector(direction,-distance);desired.y=6.5+speed*.025+intro*2.5;
  // Props are deliberately below the viewing ray; preserve a stable distance around cover.
  if(this.snap){this.chase.position.copy(desired);this.look.copy(target);this.snap=false}else{this.chase.position.lerp(desired,1-Math.exp(-10*dt));this.look.lerp(target,1-Math.exp(-13*dt))}this.chase.lookAt(this.look);this.chase.updateMatrixWorld();return this.active;
 }
 get basis(){const right=new T.Vector3(1,0,0).applyQuaternion(this.active.quaternion),up=new T.Vector3(0,0,-1).applyQuaternion(this.active.quaternion);up.y=0;up.normalize();return{right:{x:right.x,z:right.z},up:{x:up.x,z:up.z}}}
}
