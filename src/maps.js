import {OFFICE_MAPS} from './office-maps.js';
const prop=(type,x,z,w,d,h=2)=>({type,x,z,w,d,h});
function pod(x,z){return[prop('partition',x,z,7,.5,2.1),prop('desk',x-3,z-3,3,1.8,1.5),prop('desk',x+3,z-3,3,1.8,1.5),prop('cabinet',x+5,z,1.5,1.4,1.9)]}
const skyline=[...pod(-24,-16),...pod(24,16),...pod(-25,18),...pod(25,-18),...pod(-24,0),...pod(24,0),...pod(0,27),...pod(0,-27),prop('copier',-10,-5,2,1.8,1.8),prop('copier',10,5,2,1.8,1.8),prop('sofa',-6,19,6,1.7,1.3),prop('sofa',6,-19,6,1.7,1.3),prop('hvac',-39,-26,5,3,2.5),prop('hvac',39,26,5,3,2.5),prop('whiteboard',-9,27,5,.8,2.2),prop('whiteboard',9,-27,5,.8,2.2)];
const executive=[...pod(-30,-24),...pod(30,24),...pod(-30,24),...pod(30,-24),prop('table',0,-17,12,3.5,1.5),prop('table',0,17,12,3.5,1.5),prop('partition',-18,0,3,14,2.1),prop('partition',18,0,3,14,2.1),prop('sofa',-32,4,7,2,1.3),prop('sofa',32,-4,7,2,1.3),prop('copier',-10,0,2,2,1.8),prop('copier',10,0,2,2,1.8),prop('hvac',-42,-31,5,4,2.5),prop('hvac',42,31,5,4,2.5),prop('whiteboard',-8,-28,6,.8,2.2),prop('whiteboard',8,28,6,.8,2.2),...[-12,12].flatMap(x=>[-30,30].map(z=>prop('desk',x,z,3,1.8,1.5)))];
const overtime=[...pod(-32,-21),...pod(32,21),...pod(-32,23),...pod(32,-23),...pod(-11,-30),...pod(11,30),prop('server',-26,-7,6,2,2.5),prop('server',26,7,6,2,2.5),prop('cabinet',0,-24,9,2,1.6),prop('cabinet',0,24,9,2,1.6),prop('table',-38,-5,7,3,1.4),prop('table',38,5,7,3,1.4),prop('sofa',-12,15,6,1.7,1.3),prop('sofa',12,-15,6,1.7,1.3),prop('hvac',-46,32,5,3,2.5),prop('hvac',46,-32,5,3,2.5)];
export const MAPS=[
{id:'skyline',name:'Skyline HQ',tag:'FLOOR 41 · GOLDEN HOUR',short:'Open-plan rooftop',description:'Cubicle islands, copier corners and a wide meeting lane, forty-one floors above the city.',size:{x:48,z:36},spawns:[[-18,5],[18,-5],[-4,21],[4,-21]],obstacles:skyline,palette:{floor:'#e8d9bd',tile:'#caba9e',lane:'#d2c7b2',edge:'#eab953',wall:'#9dafa8',accent:'#82b3a6',desk:'#cca16d',skyTop:'#8fbed9',skyBottom:'#f9dab5',fog:'#c9d5d3',sun:'#ffe0ab',ambient:'#c8dfef',ground:'#8a9792'},seed:73},
{id:'garden',name:'Executive Terrace',tag:'FLOOR 58 · THE BOARDROOM',short:'Executive rooftop',description:'Long conference tables, frosted dividers and executive desks with a vertigo-inducing view.',size:{x:50,z:40},spawns:[[-24,5],[24,-5],[-4,25],[4,-25]],obstacles:executive,palette:{floor:'#d6d9d2',tile:'#bbc3bd',lane:'#c1c9c4',edge:'#ddb66b',wall:'#66898a',accent:'#497c7c',desk:'#a77b54',skyTop:'#87b1c9',skyBottom:'#e9d9bd',fog:'#b6c6c8',sun:'#ffe4c3',ambient:'#cde2e6',ground:'#7e8b91'},seed:119},
{id:'neon',name:'Overtime Annex',tag:'FLOOR 36 · NIGHT SHIFT',short:'After-hours rooftop',description:'Server cabinets, glowing monitors and late-night workstations above a warm window-lit skyline.',size:{x:56,z:42},spawns:[[-22,2],[22,-2],[-2,29],[2,-29]],obstacles:overtime,palette:{floor:'#68717c',tile:'#596571',lane:'#56616c',edge:'#e3b368',wall:'#657b86',accent:'#8ebbbd',desk:'#b68f68',skyTop:'#242f49',skyBottom:'#897d8d',fog:'#596578',sun:'#f5dcc0',ambient:'#c7d8eb',ground:'#343c4c'},seed:247}
];
const PREVIEW={...MAPS[0],id:'preview',name:'The Original Rooftop',size:{x:21,z:15},spawns:[[-9,4],[9,-4],[-3,9],[3,-9]],obstacles:[...pod(-11,-7),...pod(11,7),prop('copier',-3,-5,2,1.8,1.8),prop('sofa',3,7,5,1.7,1.3),prop('desk',9,-7,3,1.8,1.5),prop('desk',-9,7,3,1.8,1.5)]};
for(const map of [...MAPS,PREVIEW])for(const side of[-1,1])map.obstacles.push(prop('roofAccess',side*(map.size.x-7),side*(map.size.z-4),9,3,3.4));
// The early, compact rooftop remains the Knockout layout on Skyline HQ.
export const CLASSIC_ROOFTOP={...PREVIEW,id:'skyline',name:'Classic Rooftop',tag:'THE ORIGINAL · SMALL ROOF',obstacles:[...PREVIEW.obstacles]};
for(const map of OFFICE_MAPS){
 const previous=MAPS.find(m=>m.id===map.surroundings);
 // Retain the established skyline, weather, light and traffic around each roof.
 map.citySeed=previous.seed;
 for(const key of ['skyTop','skyBottom','fog','sun','ambient','ground'])map.palette[key]=previous.palette[key];
 map.palette.lane=map.palette.floor;map.palette.edge=map.palette.accent;
}
MAPS.push(...OFFICE_MAPS);
export function getMap(id){if(id==='preview')return PREVIEW;return MAPS.find(m=>m.id===id)||MAPS[0]}
export const DEFAULT_MAP=MAPS[0];
