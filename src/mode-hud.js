import {getMode,modeLayout,objectiveTask,TEAMS} from './modes.js';
export function objectiveStatus(s,p){const mode=getMode(s.modeId);if(!mode.team)return null;const task=objectiveTask(s,p),o=s.objective,next=24-Math.floor(s.elapsed%24);let detail=task.detail,progress=0;
 if(s.modeId==='boardroom'){detail=o.reset>0?'New table in '+Math.ceil(o.reset)+'…':'Rocket or ram the table · friendly fire off';if(o.reset>0)progress=1-o.reset/2.2}
 if(s.modeId==='coffee'){detail=o.contested?'CONTESTED · push rivals out to brew':o.control===p.team?'BREWING FOR YOUR TEAM · stay in the zone':o.control>=0?'RIVALS ARE BREWING · take the coffee corner':'Drive into the glowing circle. Your team brews automatically.';progress=o.brew[p.team]/2}
 if(s.modeId==='expense'){detail=p.deposit>0?'BANKING · hold still in the ring':p.carry+' / 8 receipts · next bank in '+next+'s';progress=p.deposit/1.5}
 return{...task,detail,progress:Math.max(0,Math.min(1,progress)),distance:Math.round(Math.hypot(p.x-task.x,p.z-task.z))}
}
export function drawObjectives(ctx,s,px,pz,sx,sz){if(!s.objective)return;const l=modeLayout(s.mapId,s.modeId),o=s.objective;const dot=(p,color,r=7,text='')=>{ctx.fillStyle=color;ctx.strokeStyle='#fff8e4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(p.x),pz(p.z),r,0,Math.PI*2);ctx.fill();ctx.stroke();if(text){ctx.fillStyle='#29394a';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText(text,px(p.x),pz(p.z)+3)}};
 if(s.modeId==='boardroom'){for(let i=0;i<2;i++){const g=l.goals[i];ctx.fillStyle=TEAMS[i].color;ctx.fillRect(px(g.x)-4,pz(-9),8,18*sz)}dot(o.table,'#eec45e',7,'T')}
 if(s.modeId==='coffee'){const color=o.contested?'#df8b6a':o.control>=0?TEAMS[o.control].color:'#e1b64e';dot(l.coffee,color,12,'☕')}
 if(s.modeId==='expense'){for(const p of l.printers)dot(p,'#b0c8b7',4);dot(l.banks[o.phase%3],'#edc36b',8,'$')}
}
export function teamResult(s,myId){const winner=s.objective.winner,myTeam=s.players[myId].team,mode=getMode(s.modeId);return{title:winner<0?'Nobody clocks out ahead.':winner===myTeam?'Your team owns the office.':TEAMS[winner].name+' takes the shift.',subtitle:s.objective.scores[0]+' — '+s.objective.scores[1]+' '+mode.unit+' · '+mode.name+(s.overtime?' · overtime':''),winner}}
