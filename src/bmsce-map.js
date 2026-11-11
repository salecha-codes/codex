// An original, playable interpretation of BMSCE's Basavanagudi campus.
// References: https://www.bmsce.ac.in/ and the B. S. Narayan Platinum Jubilee Block.
export const BMSCE_MAP={
 id:'bmsce',name:'BMSCE · Bengaluru Campus',tag:'BASAVANAGUDI · CAMPUS CLASH',short:'College courtyard',
 description:'BMSCE-inspired academic blocks, curved cream terraces, red pillars and a leafy Bengaluru courtyard. An original game layout.',
 campus:true,size:{x:60,z:44},spawns:[[-16,22],[16,-22],[-28,-7],[28,7]],seed:1946,
 objectiveLayout:{coffee:{x:0,z:0},printers:[{x:-27,z:-21},{x:27,z:21},{x:0,z:-31}],banks:[{x:-27,z:21},{x:27,z:-21},{x:0,z:30}]},
 palette:{floor:'#c6bda8',tile:'#a5a18f',lane:'#ded3ba',edge:'#d3a24e',wall:'#a3947a',accent:'#537f82',desk:'#ad7d52',skyTop:'#80b7ce',skyBottom:'#e6e4cd',fog:'#c6d4ca',sun:'#ffe3b1',ambient:'#d8e9ec',ground:'#789478'},
 lighting:{ambient:'#d8e9ec',sun:'#ffe8bf',ambientIntensity:1.65,sunIntensity:2.25},
 obstacles:[
  ...[-1,1].flatMap(s=>[-1,1].map(t=>({type:'campusPlanter',x:s*29,z:t*18,w:8,d:4,h:.75}))),
  ...[-1,1].flatMap(s=>[-1,1].map(t=>({type:'campusBench',x:s*18,z:t*9,w:5.8,d:1.5,h:1.25}))),
  ...[-1,1].map(s=>({type:'campusKiosk',x:s*44,z:0,w:6,d:5,h:3.1})),
  {type:'campusSculpture',x:0,z:-28,w:3.2,d:3.2,h:3.8}
 ]
};
