import {test} from 'node:test';import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {createRoomDatabase,postgresSql} from '../server/postgres.js';
import {api} from '../worker/api.js';import {createMatch} from '../src/simulation.js';

test('Postgres SQL conversion preserves literals and binds values rather than interpolating them',()=>{
 assert.equal(postgresSql("SELECT character, `room` FROM members WHERE name = ? AND signal = '?' -- ?\nAND room = ?"),"SELECT \"character\", \"room\" FROM members WHERE name = $1 AND signal = '?' -- ?\nAND room = $2");
 assert.equal(postgresSql("SELECT 'it''s ?' /* ? */ WHERE id=?"),"SELECT 'it''s ?' /* ? */ WHERE id=$1");
});
test('real Postgres engine stores and relays eight arenas, five characters, room capacity and all team objectives',async()=>{
 const pg=new PGlite();await pg.waitReady;
 const executor={query:(sql,params)=>pg.query(sql,params),transaction:queries=>pg.transaction(async tx=>{const results=[];for(const q of queries)results.push(await tx.query(q.sql,q.params));return results})};
 const db=createRoomDatabase(executor),env={DB:db};
 const request=async(path,body={},token)=>{const response=await api(new Request('https://game.example/game-api/rooms'+path,{method:'POST',headers:{Origin:'https://game.example','Content-Type':'application/json',...(token?{'X-Room-Token':token}:{})},body:JSON.stringify(body)}),env);return{status:response.status,...await response.json()}};
 try{
  const host=await request('',{character:4,name:'Modi ji',settings:{mapId:'penthouse-open',humanSlots:4,botCount:0}});assert.equal(host.status,200);
  const friends=[];for(let i=1;i<=3;i++)friends.push(await request('/'+host.code+'/join',{character:i,name:'Friend '+i}));assert.deepEqual(friends.map(p=>p.slot),[1,2,3]);
  assert.equal((await request('/'+host.code+'/join')).status,409);
  for(const modeId of['rooftop','boardroom','coffee','expense','rumble']){
   const state=createMatch({mapId:'penthouse-open',modeId,characters:[4,0,1,2]});
   assert.equal((await request('/'+host.code+'/sync',{state},host.token)).status,200,modeId);
   const pull=await request('/'+host.code+'/sync',{input:{fire:true}},friends[0].token);assert.deepEqual(pull.state,state);assert.equal(pull.members[0].character,4);assert.equal(typeof pull.members[0].lastSeen,'number');assert.ok(pull.members.every(m=>!('token_hash'in m)));
  }
  assert.equal((await request('/'+host.code+'/sync',{state:createMatch()},friends[0].token)).status,403);
  assert.equal((await request('/'+host.code+'/settings',{settings:{humanSlots:1}},host.token)).status,409);
  assert.equal((await request('/'+host.code+'/settings',{settings:{humanSlots:4,mapId:'loft',modeId:'coffee',duration:300}},host.token)).status,200);
  const other=await request('',{name:"O'Brien ?",settings:{humanSlots:2}});assert.equal(other.status,200);
  assert.equal((await request('/'+other.code+'/sync',{},friends[0].token)).status,401);
  assert.equal((await request('/'+host.code+'/leave',{},host.token)).status,200);
  assert.equal((await request('/'+host.code+'/sync',{},friends[0].token)).status,404);
  assert.equal((await pg.query('SELECT COUNT(*)::int AS n FROM members WHERE room=$1',[host.code])).rows[0].n,0);
 }finally{await pg.close()}
});
