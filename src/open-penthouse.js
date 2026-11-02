// A perimeter-only layout: the protected combat rectangle is 82 × 54 world units.
const prop=(type,x,z,w,d,h=1.6)=>({type,x,z,w,d,h});
export const OPEN_PENTHOUSE={
 id:'penthouse-open',name:'Urban Penthouse · Open Floor',tag:'FLOOR 70 · OPEN COMBAT',short:'Perimeter-only penthouse',
 description:'A vast, clear combat floor in grey and steel-blue carpet. Dual-monitor desks line the edges; a quiet lounge overlooks the city.',
 interior:'penthouse-open',surroundings:'skyline',lighting:{sun:'#fff2df',ambient:'#d4e7f4',sunIntensity:2.35,ambientIntensity:1.65},floorStyle:'geometric-carpet',exteriorGlazing:true,
 size:{x:54,z:40},combatClearance:{x:41,z:27},
 objectiveLayout:{coffee:{x:45,z:28},printers:[{x:-47,z:-18},{x:47,z:26},{x:0,z:-35}],banks:[{x:-47,z:17},{x:47,z:-22},{x:0,z:31}],tableHome:{x:0,z:-29.5}},
 spawns:[[-19,8],[19,-8],[-8,19],[8,-19]],
 palette:{floor:'#c9d0d5',tile:'#aab9c5',wall:'#8f9fa9',accent:'#d5ad45',desk:'#c7ab82'},
 zones:[
  {name:'',x:-49,z:0,w:8,d:67,surface:'carpet',color:'#8199ae'},
  {name:'',x:0,z:-35,w:88,d:8,surface:'carpet',color:'#8199ae'},
  {name:'',x:48,z:0,w:9,d:29,surface:'modern-rug',color:'#9daebc'}
 ],
 obstacles:[
  prop('dualDesk',-49,-20,5.4,12),prop('dualDesk',-49,0,5.4,12),prop('dualDesk',-49,20,5.4,12),
  prop('dualDesk',-30,-35,12,5.4),prop('dualDesk',-10,-35,12,5.4),
  prop('dualDesk',10,-35,12,5.4),prop('dualDesk',30,-35,12,5.4),
  prop('officeSofa',49,0,2.7,7.4,1.8),
  prop('loungeChair',46,-8,2.4,2.6,1.8),prop('loungeChair',46,8,2.4,2.6,1.8),
  prop('smallTable',44.1,0,3,4,1.1),prop('bookcase',51.8,0,1.4,22,2.1),
  ...[[-50,-36],[-50,35],[50,-35],[50,35],[-41,-35],[41,-35],[49,-18],[49,18]]
   .map(([x,z])=>prop('officeTree',x,z,2.8,2.8,5))
 ]
};
