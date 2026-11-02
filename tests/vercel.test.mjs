import {test} from 'node:test';import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {handleRoomRequest,DEFAULT_ROOM_BACKEND} from '../server/rooms.js';
import {nodeRequest} from '../api/game.js';
import {api} from '../worker/api.js';
import {createDevDatabase} from '../server/dev-database.js';
import {createMatch} from '../src/simulation.js';

function req(path,body={},token,extra={}){return new Request('https://game.vercel.app/game-api/'+path,{method:'POST',headers:{Origin:'https://game.vercel.app','Content-Type':'application/json',...(token?{'X-Room-Token':token}:{}),...extra},body:JSON.stringify(body)})}
test('shared-room deployment forwards only JSON and room credentials, rewriting the upstream Origin',async()=>{
 const db=createDevDatabase(),calls=[];
 const fetchImpl=async(url,options)=>{calls.push({url:String(url),options});return api(new Request(url,options),{DB:db})};
 const call=async(path,body,token)=>{const res=await handleRoomRequest(req(path,body,token,{Cookie:'private=do-not-forward','OAI-Sites-Authorization':'private-site-token'}),{env:{},fetchImpl});return{status:res.status,...await res.json()}};
 const host=await call('rooms',{name:'Bandit',character:3,settings:{humanSlots:4,botCount:0,mapId:'penthouse-open',modeId:'rooftop'}});assert.equal(host.status,200);
 const guests=await Promise.all([1,2,3].map(i=>call('rooms/'+host.code+'/join',{name:'Friend '+i,character:i})));assert.deepEqual(guests.map(g=>g.slot).sort(),[1,2,3]);
 assert.equal((await call('rooms/'+host.code+'/join',{})).status,409);
 const state=createMatch({mapId:'penthouse-open',modeId:'rooftop',characters:[3,1,2,0]});
 assert.equal((await call('rooms/'+host.code+'/sync',{state},host.token)).status,200);
 const sync=await call('rooms/'+host.code+'/sync',{input:{x:1,z:0}},guests[0].token);assert.equal(sync.state.players[0].character,3);assert.equal(sync.members.length,4);
 assert.ok(sync.members.every(m=>!('token_hash'in m)&&!('token'in m)));
 assert.equal((await call('rooms/'+host.code+'/settings',{settings:{humanSlots:4}},guests[0].token)).status,403);
 for(const{url,options}of calls){assert.ok(url.startsWith(DEFAULT_ROOM_BACKEND+'/game-api/'));assert.equal(options.headers.get('Origin'),DEFAULT_ROOM_BACKEND);assert.equal(options.headers.get('Cookie'),null);assert.equal(options.headers.get('OAI-Sites-Authorization'),null);assert.equal(options.redirect,'manual')}
 db.close();
});
test('proxy rejects cross-origin and arbitrary routes, excessive bodies and non-JSON upstream pages',async()=>{
 let calls=0;const fetchImpl=async()=>{calls++;return new Response('<html>Edit site</html>',{headers:{'Content-Type':'text/html','Set-Cookie':'private=value'}})};
 assert.equal((await handleRoomRequest(req('rooms',{},null,{Origin:'https://other.example'}),{fetchImpl})).status,403);
 assert.equal((await handleRoomRequest(req('../signin'),{fetchImpl})).status,404);
 assert.equal((await handleRoomRequest(req('rooms',{name:'x'.repeat(55000)}),{fetchImpl})).status,400);
 const response=await handleRoomRequest(req('rooms'),{env:{},fetchImpl});assert.equal(response.status,502);assert.equal(response.headers.get('Set-Cookie'),null);assert.ok(!(await response.text()).includes('<html>'));assert.equal(calls,1);
});
test('the native Vercel Node request adapter supports raw and parsed bodies and rewritten routes',async()=>{
 const input=Readable.from([Buffer.from('{"character":3}')]);input.method='POST';input.url='/api/game?route=rooms';input.headers={host:'custom.example','x-forwarded-proto':'https',origin:'https://custom.example','content-type':'application/json'};
 let request=await nodeRequest(input);assert.equal(request.url,'https://custom.example/api/game?route=rooms');assert.deepEqual(await request.json(),{character:3});
 const parsed=Readable.from([]);parsed.method='POST';parsed.url='/api/game';parsed.query={route:'rooms/ABCDEF/join'};parsed.body={name:'Friend'};parsed.headers={host:'custom.example','x-forwarded-proto':'https',origin:'https://custom.example'};
 request=await nodeRequest(parsed);assert.equal(new URL(request.url).searchParams.get('route'),'rooms/ABCDEF/join');assert.deepEqual(await request.json(),{name:'Friend'});
});
test('independent storage errors do not silently join the shared room service',async()=>{
 let called=false;const r=await handleRoomRequest(req('rooms'),{env:{ROOM_STORAGE:'postgres'},fetchImpl:async()=>{called=true}});assert.equal(r.status,503);assert.equal(called,false);
});
