import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {MAPS} from '../src/maps.js';
import {makeOfficeFurniture} from '../src/office-furniture.js';

const roofs=MAPS.filter(m=>m.interior);
test('new rooftop themes retain the established city scenery and contain different furnished plans',()=>{
 const plans=new Set();
 for(const roof of roofs){
  const previous=MAPS.find(m=>m.id===roof.surroundings);
  assert.equal(roof.citySeed,previous.seed);
  for(const key of['skyTop','skyBottom','fog','sun','ambient','ground'])assert.equal(roof.palette[key],previous.palette[key]);
  // Compare placement independently from colors, names and prop types.
  plans.add(JSON.stringify(roof.obstacles.map(({x,z,w,d})=>[x,z,w,d])));
  if(!roof.combatClearance)assert.ok(roof.obstacles.some(o=>o.type==='pingpong'||o.type==='pool'));
  if(!roof.combatClearance)assert.ok(roof.obstacles.some(o=>['treadmill','exerciseBike','weightBench'].includes(o.type)));
  assert.ok(roof.obstacles.some(o=>['workbench','communal','dualDesk'].includes(o.type)));
  assert.ok(roof.obstacles.every(o=>!['wall','glassDivider','partition','roofAccess'].includes(o.type)));
 }
 assert.equal(plans.size,roofs.length);
});
test('every physical rooftop prop has a visible model, with its base grounded on the roof',()=>{
 const wood=new T.MeshStandardMaterial({color:'#c5ab81'});
 const emit=(root,w,h,d,color,x,y,z)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),wood);mesh.position.set(x,y,z);root.add(mesh);return mesh};
 for(const roof of roofs)for(const obstacle of roof.obstacles){
  const model=makeOfficeFurniture(obstacle,{theme:roof.id,wood,emit,owned:new Set()});
  assert.ok(model,roof.id+'/'+obstacle.type);
  model.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(model);
  assert.ok(!bounds.isEmpty(),roof.id+'/'+obstacle.type+' must be rendered');
  assert.ok(bounds.min.y>=-.1&&bounds.min.y<.3,roof.id+'/'+obstacle.type+' should sit on the roof');
  assert.ok(bounds.max.y<6,roof.id+'/'+obstacle.type+' should not enclose the arena');
 }
});

test('the open penthouse keeps its entire combat rectangle clear in every mode',async()=>{
 const {getArena,MODES,createObjective,modeLayout,objectiveTask}=await import('../src/modes.js');
 const {createMatch,step}=await import('../src/simulation.js');
 const {normalizeSettings}=await import('../src/room-settings.js');
 const map=MAPS.find(m=>m.id==='penthouse-open'),clear=map.combatClearance;
 assert.equal(normalizeSettings({mapId:map.id}).mapId,map.id);
 for(const mode of MODES){
  for(const o of getArena(map.id,mode.id).obstacles){
   assert.ok(Math.abs(o.x)-o.w/2>clear.x||Math.abs(o.z)-o.d/2>clear.z,mode.id+'/'+o.type+' must remain on the perimeter');
  }
 }
 const table=createObjective(map.id,'boardroom').table;
 assert.ok(Math.abs(table.z)-1.5>clear.z,'the movable objective starts outside the empty center');
 const s=createMatch({mapId:map.id,modeId:'coffee',humans:[0,1,2,3]}),corner=modeLayout(map.id,'coffee').coffee;
 s.countdown=0;Object.assign(s.players[0],corner,{spawn:0});
 const task=objectiveTask(s,s.players[0]);assert.ok(Math.hypot(task.x-corner.x,task.z-corner.z)<7);
 for(let i=0;i<245;i++)step(s);
 assert.ok(s.objective.scores[0]>0,'the perimeter coffee station must still score');
});
