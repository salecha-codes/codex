import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,step} from '../src/simulation.js';
import {MAPS} from '../src/maps.js';
import {MODES} from '../src/modes.js';
import {validMatchState,matchSnapshot} from '../src/state-validation.js';
test('complete snapshots validate across maps, modes, bots and active projectiles',()=>{
 for(const map of MAPS)for(const mode of MODES){const state=createMatch({mapId:map.id,modeId:mode.id,humans:[]});state.countdown=0;for(let i=0;i<180;i++)step(state);assert.equal(validMatchState(matchSnapshot(state)),true,map.id+':'+mode.id)}
});
test('rejects executable scores and incomplete or malformed state before rendering',()=>{
 for(const change of [s=>s.players[0].score='<img src=x onerror=alert(1)>',s=>delete s.events,s=>delete s.players[0].angle,s=>s.players[1].id=0,s=>s.players[0].vx=Infinity,s=>s.players[0].name={},s=>s.players.forEach(p=>p.active=false),s=>s.players[0].team=1,s=>s.events=[{id:1,type:'out',player:99,attacker:-1,reason:'fall',x:0,z:0}],s=>s.events=[{id:1,type:'out',player:'<img>'}],s=>s.rockets=[{id:1,owner:0,x:0,z:0,y:1}]]){const state=createMatch();change(state);assert.equal(validMatchState(state),false)}
});
test('snapshots omit bot route caches without modifying the host simulation',()=>{const state=createMatch();state.players[0].nav={points:[{x:1,z:2}]};const snapshot=matchSnapshot(state);assert.equal(snapshot.players[0].nav,undefined);assert.equal(state.players[0].nav.points.length,1);assert.equal(validMatchState(snapshot),true)});
