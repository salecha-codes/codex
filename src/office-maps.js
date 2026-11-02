import {OPEN_PENTHOUSE} from './open-penthouse.js';
// Hand-authored rooftop plans. Dimensions are collision footprints, not floor decals.
const item=(type,x,z,w,d,h=1.6)=>({type,x,z,w,d,h});
const zone=(name,x,z,w,d,surface,color)=>({name,x,z,w,d,surface,color});
const desk=(x,z,w=8,d=5.4)=>item('workbench',x,z,w,d);
const tree=(x,z)=>item('officeTree',x,z,2.8,2.8,5);
const planter=(x,z,w,d)=>item('gardenBed',x,z,w,d,1);
const sofa=(x,z,w=7,d=3)=>item('officeSofa',x,z,w,d);
const cafe=(x,z)=>item('cafeTable',x,z,3.4,3.4,1.4);
const plantRow=(points)=>points.map(([x,z])=>tree(x,z));

export const OFFICE_MAPS=[
 {
  id:'penthouse',name:'Urban Skyline Penthouse',tag:'FLOOR 62 · WORK / PLAY',short:'Executive rooftop',
  description:'A blue-carpet work studio, open boardroom, table-tennis club and a separate rooftop gym.',
  interior:'penthouse',surroundings:'skyline',size:{x:48,z:36},spawns:[[-11,5],[11,-5],[-4,17],[4,-17]],
  palette:{floor:'#d0d4d2',tile:'#b9c2c7',wall:'#809297',accent:'#587f99',desk:'#c29d74'},
  zones:[
   zone('WORK STUDIO',-29,-12,32,41,'carpet','#718aa2'),
   zone('BOARDROOM',28,-23,31,19,'carpet','#8094a6'),
   zone('THE PING-PONG CLUB',-28,23,32,20,'sport','#a5b9c2'),
   zone('ROOFTOP FITNESS',29,22,30,22,'rubber','#53636b'),
   zone('COFFEE BREAK',0,-28,18,11,'wood','#c7ad86')
  ],
  obstacles:[
   desk(-37,-26,9),desk(-21,-26,9),desk(-37,-13,9),desk(-21,-13,9),desk(-34,0,12),
   item('conference',29,-24,18,6),cafe(19,-12),cafe(39,-12),
   item('bookcase',-44,-12,2,10,2.5),item('coffeeBar',0,-30,9,2.8,1.8),
   item('pingpong',-29,23,10,6,1.7),sofa(-40,21,3,8),item('roundOttoman',-17,28,2,2,.6),
   item('treadmill',20,19,3,7,2.4),item('treadmill',26,19,3,7,2.4),
   item('dumbbells',37,16,8,2.6,1.8),item('weightBench',35,27,4.6,6,2.5),
   planter(-11,-25,2,9),planter(12,29,2.2,9),
   ...plantRow([[-44,-31],[-13,-32],[44,-31],[44,31],[-44,31],[12,12],[43,7]])
  ]
 },
 {
  id:'oasis',name:'Biophilic Oasis',tag:'FLOOR 28 · GARDEN CAMPUS',short:'Garden rooftop',
  description:'Staggered oak decks, a garden commons, picnic meetings, a wellness deck and a leafy games corner.',
  interior:'oasis',surroundings:'garden',size:{x:46,z:38},spawns:[[-11,5],[11,-5],[-3,16],[3,-16]],
  palette:{floor:'#92a875',tile:'#859766',wall:'#9ba98b',accent:'#4d795b',desk:'#c6ab7c'},
  zones:[
   {...zone('PICNIC MEETINGS',-29,-23,27,23,'wood','#bba578'),shape:'rounded'},
   {...zone('GARDEN WORKSPACE',18,-28,13,12,'wood','#cfb68b'),shape:'rounded'},
   {...zone('',34,-22,13,12,'wood','#cfb68b'),shape:'rounded'},
   {...zone('',18,-15,13,11,'wood','#cfb68b'),shape:'rounded'},
   {...zone('',35,-9,13,10,'wood','#cfb68b'),shape:'rounded'},
   {...zone('WELLNESS DECK',-31,23,24,23,'wood','#bba27b'),shape:'rounded'},
   {...zone('PLAY GARDEN',25,25,37,22,'grass','#8dA672'),shape:'ellipse'},
   {...zone('GARDEN COMMONS',-8,-13,11,10,'grass','#7e965e'),shape:'ellipse'}
  ],
  obstacles:[
   item('picnic',-29,-25,13,6),cafe(-18,-14),cafe(-39,-12),
   desk(18,-28,7),desk(34,-22,7),desk(18,-15,7),desk(35,-9,7),
   planter(27,-33,12,2),planter(8,-20,2,10),planter(-15,23,2,12),planter(-8,-23,2.5,8),planter(12,10,8,2.5),planter(10,33,2.5,6),
   item('exerciseBike',-37,21,3.6,5.4,2.3),item('exerciseBike',-29,21,3.6,5.4,2.3),
   item('dumbbells',-31,31,9,2.4,1.8),
   item('pingpong',24,22,10,6,1.7),sofa(39,25,3,9),sofa(28,33,9,3),cafe(38,15),
   item('coffeeBar',0,-32,8,2.8,1.8),
   ...plantRow([[-40,-32],[-18,-33],[-12,-15],[-8,-17],[11,10],[41,8],[-41,1],[-41,33],[-21,11],[9,34],[42,34],[41,4],[7,-33]])
  ]
 },
 {
  id:'cyber',name:'Neo-Cyber Tech Arena',tag:'FLOOR 09 · NIGHT OWLS',short:'Tech club rooftop',
  description:'An L-shaped developer lab, server courtyard, neon gaming lounge, table tennis and a training deck.',
  interior:'cyber',surroundings:'neon',size:{x:48,z:36},spawns:[[-11,5],[11,-5],[-4,17],[4,-17]],
  palette:{floor:'#536170',tile:'#425262',wall:'#687f8b',accent:'#64cad7',desk:'#8a9ca6'},
  zones:[
   zone('DEVELOPER LAB',-28,-22,33,21,'carpet','#3d4e69'),
   zone('LAB ANNEX',-36,-2,16,17,'carpet','#3d4e69'),
   zone('SERVER COURTYARD',28,-23,30,20,'rubber','#374450'),
   zone('AFTER HOURS',-27,23,35,21,'carpet','#685580'),
   zone('NEON TABLE TENNIS',27,23,31,20,'sport','#465b75'),
   zone('FITNESS / REBOOT',0,-28,16,12,'rubber','#354652')
  ],
  obstacles:[
   desk(-37,-25,8),desk(-24,-25,8),desk(-14,-16,7),desk(-36,-12,6,8),desk(-36,1,6,8),
   item('serverBank',20,-27,4,8,3),item('serverBank',31,-27,4,8,3),item('serverBank',40,-19,4,9,3),
   item('techTable',24,-15,9,4,1.6),
   item('arcadeBank',-36,27,9,3.5,3.4),item('foosball',-20,21,7,4.8,1.6),
   sofa(-18,31,10,3),item('coffeeBar',-42,15,3,7,1.8),
   item('pingpong',29,23,11,6.5,1.7),sofa(41,26,3,9),
   item('exerciseBike',-4,-28,3.6,5.4,2.3),item('weightBench',4,-28,4.6,6,2.5),
   ...plantRow([[-44,-31],[44,-31],[44,31],[-44,31],[-13,12],[13,-32]])
  ]
 },
 {
  id:'loft',name:'Vintage Industrial Loft',tag:'FLOOR 04 · THE MAKERS’ ROOF',short:'Creative studio rooftop',
  description:'Long communal worktables, rug-covered meeting spots, a billiards club, café and free-weight corner.',
  interior:'loft',surroundings:'skyline',size:{x:50,z:34},spawns:[[-11,5],[11,-5],[-4,16],[4,-16]],
  palette:{floor:'#c3bcae',tile:'#aaa598',wall:'#978877',accent:'#9d6749',desk:'#956747'},
  zones:[
   zone('THE LONG TABLES',-29,-19,35,26,'wood','#9e8265'),
   zone('CLIENT MEETINGS',27,-23,33,16,'rug','#a16e55'),
   zone('BILLIARDS CLUB',-32,22,29,18,'rug','#906452'),
   zone('COFFEE & IDEAS',0,25,24,13,'wood','#ae8d65'),
   zone('FREE WEIGHTS',33,22,26,19,'rubber','#74716b')
  ],
  obstacles:[
   item('communal',-29,-25,25,5.4),item('communal',-29,-12,25,5.4),
   item('bookcase',-46,-18,2,15,2.5),item('conference',28,-23,19,6),
   sofa(19,-12,7,3),item('smallTable',29,-11,4,2.8,1.2),sofa(39,-11,7,3),
   item('pool',-32,23,11,6,1.6),item('cueRack',-44,21,2,8,2.5),
   item('coffeeBar',-7,29,8,2.8,1.8),cafe(4,25),cafe(13,28),
   item('dumbbells',30,15,9,2.4,1.8),item('weightBench',28,26,4.6,6,2.5),item('treadmill',40,25,3,7,2.4),
   item('pingpong',28,3,9,5.5,1.7),
   ...plantRow([[-45,-30],[45,-29],[-44,30],[45,30],[-16,16],[17,15]])
  ]
 }
];

// Match equipment to the rider's physical scale; keep each section and prop position.
for(const map of OFFICE_MAPS)for(const o of map.obstacles){
 if(o.type==='pingpong'){o.w=6.2;o.d=3.5}
 if(o.type==='pool'){o.w=6.8;o.d=3.8}
 if(o.type==='foosball'){o.w=3.8;o.d=2.6}
 if(o.type==='treadmill'){o.w=2.15;o.d=4.8}
 if(o.type==='exerciseBike'){o.w=2.6;o.d=4}
 if(o.type==='officeSofa'){o.w*=.82;o.d*=.82}
}

OFFICE_MAPS.push(OPEN_PENTHOUSE);
