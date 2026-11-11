import * as T from 'three';
import {CHARACTERS,characterIndex} from './simulation.js';
import {box,ball,cyl,rod,torus,mesh,batchLocal} from './art.js';
export function makeRider(character){character=characterIndex(character);const root=new T.Group(),rig=new T.Group(),chair=new T.Group();root.add(rig,chair);
 const color=CHARACTERS[character].color,dark='#35364f',skin=character===3?'#9d95ac':color;
 cyl(chair,.13,.17,.66,'#aab7be',0,.63,0,.8);const wheels=[];
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod(chair,[0,.31,0],[Math.sin(a)*.66,.21,Math.cos(a)*.66],.065,'#b6c0c8',.75);const wheel=new T.Group();wheel.position.set(Math.sin(a)*.7,.19,Math.cos(a)*.7);wheel.rotation.y=a;chair.add(wheel);const roll=new T.Group();wheel.add(roll);wheel.userData.roll=roll;const tire=cyl(roll,.13,.13,.14,'#303644');tire.rotation.z=Math.PI/2;wheels.push(wheel)}
 box(chair,1.08,.23,1.03,dark,0,1,0,.14);box(chair,.95,.14,.93,'#55516c',0,1.12,0,.12);box(chair,.98,1.07,.23,dark,0,1.67,-.48,.13);box(chair,.85,.83,.12,'#5b5575',0,1.75,-.33,.1);
 for(const side of [-1,1]){rod(chair,[side*.52,1,.06],[side*.61,1.48,.06],.045,'#b4bac6',.7);box(chair,.18,.1,.62,dark,side*.6,1.49,.06,.04)}
 let head,eyes,tail;

 const body=ball(rig,.42,.51,.36,skin,0,1.58,.03);ball(rig,.3,.35,.12,character===2?'#cee8a0':'#fff1d5',0,1.55,.34);
 for(const s of [-1,1]){ball(rig,.18,.23,.19,skin,s*.26,1.14,.34);ball(rig,.2,.13,.3,character===1?'#f5b552':skin,s*.28,1.07,.52);rod(rig,[s*.34,1.77,.1],[s*.39,1.6,.61],.13,skin);ball(rig,.15,.14,.15,skin,s*.39,1.6,.62)}
 head=new T.Group();head.position.set(0,2.19,.14);rig.add(head);
 ball(head,.53,.48,.45,skin);
 if(character===0){for(const s of [-1,1]){const ear=mesh(head,new T.ConeGeometry(.235,.45,3),'#ff9a45',s*.35,.43,0);ear.rotation.z=-s*.2;const inner=mesh(head,new T.ConeGeometry(.12,.27,3),'#f6b6b2',s*.35,.44,.1);inner.rotation.z=-s*.2}for(const s of [-1,1]){ball(head,.21,.17,.14,'#fff1d5',s*.18,-.13,.4);for(let i=0;i<2;i++)rod(head,[s*.24,-.08-i*.07,.43],[s*.54,-.04-i*.13,.45],.012,'#704e40')}ball(head,.075,.05,.06,'#b56a62',0,-.08,.5);for(let i=0;i<3;i++){const stripe=ball(head,.045,.13,.025,'#cf7239',(i-1)*.14,.29,.395);stripe.rotation.z=(i-1)*-.3}}
 if(character===1){box(head,.58,.13,.38,'#ffc34e',0,-.14,.46,.1);ball(head,.13,.21,.16,skin,-.05,.45,-.02).rotation.z=-.5}
 if(character===2){for(const s of [-1,1])ball(head,.235,.25,.22,color,s*.32,.37,.1);ball(head,.3,.18,.1,'#cce8a1',0,-.2,.4);torus(head,.12,.012,'#537946',0,-.14,.5).scale.y=.5}
 if(character===3){for(const s of [-1,1]){ball(head,.22,.24,.12,'#77728f',s*.39,.38,0);ball(head,.12,.15,.04,'#dfccd8',s*.39,.38,.1);const mask=ball(head,.25,.19,.05,'#4c4b62',s*.22,.03,.395);mask.rotation.z=s*.25}ball(head,.29,.18,.14,'#f4eadf',0,-.16,.39);ball(head,.09,.065,.07,'#383945',0,-.11,.51)}
 eyes=[];for(const side of [-1,1]){const y=character===2?.39:.08,x=side*(character===2?.32:.215),z=character===2?.28:.405;const eye=new T.Group();eye.position.set(x,y,z);head.add(eye);ball(eye,.125,.155,.065,'#fffdf4');ball(eye,.065,.09,.04,'#28323c',-.008,-.01,.052);ball(eye,.026,.03,.02,'#fff',-.026,.025,.087);eyes.push(eye)}
 tail=new T.Group();tail.position.set(0,1.32,-.48);rig.add(tail);if(character===0||character===3){for(let i=0;i<6;i++)ball(tail,.16-i*.008,.17,.18,character===3?(i%2?'#494657':'#b8afbf'):(i>4?'#ffe6b7':color),Math.sin(i*.5)*.33,.05+i*.13,-i*.13)}
 const launcher=new T.Group();launcher.position.set(.43,1.64,.59);rig.add(launcher);box(launcher,.4,.32,.5,'#e86d48',0,0,0,.08);cyl(launcher,.14,.15,.12,'#263542',.2,0,-.04).rotation.z=Math.PI/2;const barrel=cyl(launcher,.21,.23,.4,'#34444e',0,0,.36,.3);barrel.rotation.x=Math.PI/2;torus(launcher,.21,.035,'#ffc84f',0,0,.58);box(launcher,.18,.11,.25,'#27343d',0,.22,-.02,.03);
 const ring=new T.Mesh(new T.RingGeometry(.75,.82,40),new T.MeshBasicMaterial({color,transparent:true,opacity:.65,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.075;root.add(ring);
 const shadow=new T.Mesh(new T.CircleGeometry(.72,24),new T.MeshBasicMaterial({color:'#3a4350',transparent:true,opacity:.12,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.066;root.add(shadow);
 batchLocal(chair,wheels,true);batchLocal(head,eyes,true);batchLocal(tail,[],true);batchLocal(launcher,[],true);batchLocal(rig,[chair,head,tail,launcher],true);
 const muzzle=new T.Mesh(new T.OctahedronGeometry(.25),new T.MeshBasicMaterial({color:'#ffda75'}));muzzle.position.z=.82;muzzle.visible=false;launcher.add(muzzle);const stars=new T.Group();stars.position.y=3.25;for(let j=0;j<3;j++){const star=new T.Mesh(new T.OctahedronGeometry(.12),new T.MeshBasicMaterial({color:'#ffce62'}));star.position.set(Math.sin(j*2.094)*.65,0,Math.cos(j*2.094)*.65);stars.add(star)}root.add(stars);stars.visible=false;return{root,rig,chair,head,eyes,wheels,tail,launcher,muzzle,stars,ring,shadow,character};
}

export function disposeRider(r){const geos=new Set(),materials=new Set();r.root.traverse(o=>{if(o.geometry&&!o.geometry.userData.shared&&!geos.has(o.geometry)){geos.add(o.geometry);o.geometry.dispose()}if((o.material?.isMeshBasicMaterial||o.material?.userData.owned)&&!materials.has(o.material)){materials.add(o.material);o.material.dispose()}})}
