import {test} from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {bossViewIndex,bossComebackPose,updateBossView} from '../src/boss.js';
import {makeRider,disposeRider} from '../src/riders.js';import {animateChair} from '../src/rider-motion.js';
import {ComebackScene} from '../src/comeback.js';
test('Boss views wrap safely and each local actor owns its UV state',()=>{
 for(let i=0;i<8;i++)assert.equal(bossViewIndex(-i*Math.PI/4),i);
 assert.equal(bossViewIndex(Math.PI*2),0);
 const a=makeRider(5),b=makeRider(5),camera=new T.PerspectiveCamera();camera.position.set(0,2,8);camera.lookAt(0,1.5,0);
 b.root.rotation.y=Math.PI;updateBossView(a,camera);updateBossView(b,camera);
 assert.equal(a.boss.frame,0);assert.equal(b.boss.frame,4);assert.notEqual(a.boss.mesh.geometry,b.boss.mesh.geometry);
 const saved=Array.from(b.boss.mesh.geometry.attributes.uv.array);a.root.rotation.y=Math.PI/2;updateBossView(a,camera);
 assert.equal(a.boss.frame,2);assert.deepEqual(Array.from(b.boss.mesh.geometry.attributes.uv.array),saved);
 for(const r of[a,b]){for(let i=0;i<90;i++)animateChair(r,{vx:15,vz:8,angle:.5,fall:0,fireFlash:.2},1/60);r.root.updateMatrixWorld(true);assert.ok(new T.Box3().setFromObject(r.chair,true).min.y>=.054);disposeRider(r)}
});
test('Boss comeback uses the four approved poses and seats the actor again at the end',()=>{
 assert.deepEqual([.2,1,2,3,3.8].map(bossComebackPose),[0,1,2,3,-1]);
 const scene=new ComebackScene();scene.setCharacter(5);scene.pose(1.2);assert.equal(scene.actor.chair.visible,false);assert.equal(scene.actor.boss.pose,1);
 scene.pose(3.9);assert.equal(scene.actor.chair.visible,true);assert.equal(scene.actor.boss.pose,-1);assert.ok(Math.abs(scene.actor.chair.position.x)<.01);
 scene.poseBoss(1,true,true,Math.PI);assert.equal(scene.actor.chair.visible,true);assert.equal(scene.actor.root.rotation.y,Math.PI);assert.equal(scene.actor.boss.pose,-1);
 disposeRider(scene.actor);
});
