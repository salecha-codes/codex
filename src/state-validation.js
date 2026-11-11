import {CHARACTERS} from './simulation.js';
import {MAPS} from './maps.js';
import {getMode,validObjectiveState} from './modes.js';
const number=(v,min=-1e7,max=1e7)=>Number.isFinite(v)&&v>=min&&v<=max;
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const text=(v,max)=>typeof v==='string'&&v.length<=max;
const playerNumbers=['vx','vz','angle','score','kos','falls','carry','deposit','fireCd','boostCd','fireFlash','hitFlash','fall','spawn','lastHit','lastHitTick','knock','stress','distance'];
const eventTypes=new Set(['spawn','out','explosion','boost','fire','bump','overtime','end','objective-score','goal','station','receipt']);
export function validMatchState(s){
 if(!s||typeof s!=='object'||s.version!==6||!MAPS.some(m=>m.id===s.mapId)||!validObjectiveState(s))return false;
 if(!integer(s.tick,0,1e9)||!number(s.time,0,301)||!number(s.duration,1,300)||s.time>Math.max(getMode(s.modeId).duration,s.duration)+1||!number(s.countdown,0,3)||!number(s.elapsed,0,10000)||typeof s.ended!=='boolean'||typeof s.overtime!=='boolean'||!integer(s.serial,0,1e9)||!integer(s.rocketId,0,1e9)||(s.roundId!==undefined&&!text(s.roundId,80)))return false;
 if(!Array.isArray(s.players)||s.players.length!==4||!s.players.every((p,i)=>p&&p.id===i&&integer(p.character,0,CHARACTERS.length-1)&&text(p.name,16)&&typeof p.bot==='boolean'&&typeof p.active==='boolean'&&p.team===(getMode(s.modeId).team?i%2:-1)&&number(p.x,-100,100)&&number(p.z,-100,100)&&number(p.health,0,100)&&text(p.fallReason,16)&&playerNumbers.every(k=>number(p[k]))))return false;
 if(!s.players[0].active)return false;
 if(!Array.isArray(s.rockets)||s.rockets.length>16||!s.rockets.every(r=>r&&integer(r.id,0,1e9)&&integer(r.owner,0,3)&&['x','z','y','vx','vz','angle','age','life'].every(k=>number(r[k]))))return false;
 if(!Array.isArray(s.events)||s.events.length>30||!s.events.every(e=>e&&integer(e.id,0,1e9)&&eventTypes.has(e.type)&&Object.entries(e).every(([k,v])=>k==='type'||(k==='reason'||k==='what'?text(v,24):k==='hits'?Array.isArray(v)&&v.length<=4&&v.every(n=>integer(n,0,3)):number(v)))))return false;
 for(const e of s.events){
  if(['spawn','out','explosion','boost','fire','receipt'].includes(e.type)&&(!integer(e.player,0,3)||!number(e.x)||!number(e.z)))return false;
  if(e.type==='out'&&(!integer(e.attacker,-1,3)||!['rocket','fall'].includes(e.reason)))return false;
  if(['goal','objective-score'].includes(e.type)&&!integer(e.team,0,1))return false;
 }
 if(s.roundStartsAt!==undefined&&!number(s.roundStartsAt,0,Number.MAX_SAFE_INTEGER))return false;
 if(s.roundPhase!==undefined&&!['loading','playing'].includes(s.roundPhase))return false;
 if(s.roundEpoch!==undefined&&!integer(s.roundEpoch,0,Number.MAX_SAFE_INTEGER))return false;
 if(s.syncSequence!==undefined&&!integer(s.syncSequence,0,Number.MAX_SAFE_INTEGER))return false;
 const o=s.objective;
 if(s.modeId==='boardroom'&&!integer(o.table.lastTeam,-1,1))return false;
 if(s.modeId==='expense'&&(!integer(o.nextReceipt,0,1e9)||!o.receipts.every(r=>integer(r.id,0,1e9)&&number(r.cool,0,100)&&typeof r.dropped==='boolean'&&(r.dropped?number(r.life,0,12):number(r.homeX,-100,100)&&number(r.homeZ,-100,100)))))return false;
 return true;
}
// Bot routes are host-only and must not inflate every relay/direct snapshot.
export function matchSnapshot(state){return {...state,players:state.players.map(({nav,...player})=>player)}};
