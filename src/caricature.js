import * as T from 'three';
import {ball,box,cyl,rod,mat,batchLocal} from './art.js';
const SKIN='#d99c78',CREAM='#fff2d9',HAIR='#ece9df',VEST='#386b7d';
function stroke(root,points,r,color){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,20,r,6,false),mat(color));root.add(mesh);return mesh}
export function makeCaricature(rig){
 ball(rig,.43,.47,.31,CREAM,0,1.56,.04);box(rig,.69,.73,.51,VEST,0,1.65,.045,.12);box(rig,.08,.71,.04,'#497c8c',0,1.66,.314,.02);
 for(let i=0;i<4;i++)ball(rig,.025,.025,.016,'#e8bd70',.035,1.91-i*.14,.348);
 for(const side of[-1,1]){const lapel=box(rig,.12,.46,.035,'#5b8895',side*.14,1.88,.323,.04);lapel.rotation.z=side*.27;ball(rig,.17,.27,.17,CREAM,side*.22,1.16,.28);ball(rig,.19,.09,.3,'#6c5243',side*.24,.99,.44)}
 cyl(rig,.15,.17,.22,SKIN,0,2.03,.04);box(rig,.28,.16,.13,CREAM,0,2,.15,.04);
 const head=new T.Group();head.position.set(0,2.43,.12);rig.add(head);ball(head,.53,.59,.45,SKIN,0,.01,0);ball(head,.34,.24,.3,'#d89573',0,-.28,.14);
 for(const side of[-1,1]){ball(head,.1,.18,.095,SKIN,side*.51,-.015,.03);ball(head,.044,.09,.03,'#be805f',side*.56,-.015,.08);ball(head,.11,.34,.16,HAIR,side*.43,.22,-.08);ball(head,.22,.16,.055,'#e3ad89',side*.24,-.13,.395)}
 for(let i=0;i<7;i++){const a=(i-3)*.24;const tuft=ball(head,.16,.17,.18,i%2?'#f2eee3':'#dadbd5',Math.sin(a)*.44,.44+Math.cos(a)*.12,-.11+Math.cos(a)*.08);tuft.rotation.z=-a*.35}
 // Original sculpted beard: a broad cheek line and rounded taper, with fine directional strands.
 ball(head,.4,.26,.23,HAIR,0,-.32,.28);ball(head,.31,.28,.19,'#e5e4dc',0,-.49,.29);ball(head,.18,.16,.13,'#f4efe1',0,-.68,.3);
 for(const side of[-1,1])ball(head,.11,.26,.11,HAIR,side*.36,-.18,.28);
 for(let i=-3;i<=3;i++)stroke(head,[[i*.075,-.31,.492],[i*.067,-.49,.477],[i*.035,-.65,.403]],.006,i%2?'#c9cdc8':'#faf4e8');
 const mouth=new T.Group();mouth.position.set(0,-.29,.505);head.add(mouth);ball(mouth,.1,.023,.014,'#805343');
 for(const side of[-1,1]){const moustache=ball(head,.17,.06,.075,'#f6f0e4',side*.12,-.21,.488);moustache.rotation.z=side*.18}
 ball(head,.09,.15,.12,'#e5aa84',0,-.035,.445);ball(head,.105,.08,.09,'#e3a07b',0,-.105,.51);
 const eyes=[],brows=[];for(const side of[-1,1]){const eye=new T.Group();eye.position.set(side*.215,.075,.418);head.add(eye);ball(eye,.108,.075,.039,'#fff8e9');ball(eye,.045,.053,.025,'#38453d',0,-.005,.032);ball(eye,.02,.03,.015,'#172b2c',0,-.005,.051);ball(eye,.012,.014,.01,'#ffffff',-.015,.015,.061);eyes.push(eye);const brow=new T.Group();brow.position.set(side*.215,.215,.419);head.add(brow);const line=ball(brow,.145,.036,.035,'#f4eee4');line.rotation.z=-side*.09;brows.push(brow)}
 for(let i=0;i<2;i++)stroke(head,[[-.17,.29+i*.065,.404],[0,.31+i*.065,.425],[.17,.29+i*.065,.404]],.006,'#bf8a6b');
 const glasses=new T.Group();glasses.position.set(0,.075,.482);head.add(glasses);
 for(const side of[-1,1]){const rim=new T.Group();rim.position.x=side*.215;glasses.add(rim);const pts=[[-.145,-.07,0],[-.15,.055,0],[-.12,.092,0],[.12,.092,0],[.15,.055,0],[.145,-.07,0],[.11,-.09,0],[-.11,-.09,0]].map(p=>new T.Vector3(...p));const curve=new T.CatmullRomCurve3(pts,true);const ring=new T.Mesh(new T.TubeGeometry(curve,40,.009,6,true),mat('#66645b',.65));rim.add(ring);rod(glasses,[side*.36,.035,0],[side*.5,.04,-.37],.009,'#77756b',.5)}rod(glasses,[-.065,.025,0],[.065,.025,0],.009,'#77756b',.5);
 const arms=[];for(const side of[-1,1]){const arm=new T.Group();arm.position.set(side*.37,1.84,.05);rig.add(arm);rod(arm,[side*.01,0,0],[side*.055,-.2,.24],.105,CREAM);rod(arm,[side*.055,-.2,.24],[side*.02,-.18,.45],.09,CREAM);box(arm,.19,.12,.12,'#e6e4d4',side*.02,-.18,.38,.035);ball(arm,.105,.09,.11,SKIN,side*.02,-.18,.48);for(let i=0;i<3;i++)ball(arm,.025,.06,.035,'#e2a780',side*.02+(i-1)*.048,-.21,.55);batchLocal(arm);arms.push(arm)}
 const tail=new T.Group();rig.add(tail);
 return{head,eyes,tail,expression:{glasses,brows,mouth,arms,glassesHome:glasses.position.clone()}};
}
export function animateCaricature(r,p,clock,reducedMotion=false){if(!r.expression)return;const e=r.expression,gesture=reducedMotion?0:Math.sin(clock*1.8+r.character)*.025;for(let i=0;i<2;i++){e.brows[i].rotation.z=(i?1:-1)*(p.hitFlash>0?.24:gesture);e.arms[i].rotation.x=reducedMotion?0:-p.fireFlash*.5;e.arms[i].rotation.z=(i?1:-1)*gesture}e.mouth.scale.y=p.hitFlash>0?2.3:1;e.glasses.position.copy(e.glassesHome)}
