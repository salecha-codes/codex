import * as T from 'three';
import {ball,cyl,rod,torus} from './art.js';
import {furnitureBox as box,furnitureMaterial,fabric,finishFurniture,curvedTube,upholsteredSeam,displayMaterial,leaf} from './furniture-surfaces.js';

const INK='#35434c', STEEL='#83969d', DARK='#26353e', PAPER='#e7e4d8';

export function makeOfficeFurniture(o,context){
 const {theme,wood,emit,owned}=context;
 const root=new T.Group();root.position.set(o.x,.075,o.z);root.name=o.type;
 const orient=['dualDesk','workbench','communal','conference','officeSofa','coffeeBar','bookcase','smallTable','dumbbells'];
 let {w,d}=o;
 if(orient.includes(o.type)&&d>w){[w,d]=[d,w];root.rotation.y=Math.PI/2}
 const metal=(a,b,r=.065,c=STEEL)=>rod(root,a,b,r,c,.4);
 const slab=(width,height,depth,x,y,z,material=wood)=>{
  const m=box(root,width,height,depth,'#ffffff',x,y,z,.035);m.material=material;return m;
 };
 function plant(x,z,scale=1,y=0){
  const points=[new T.Vector2(.28*scale,0),new T.Vector2(.3*scale,.05*scale),new T.Vector2(.42*scale,.62*scale),new T.Vector2(.45*scale,.65*scale),new T.Vector2(.4*scale,.69*scale),new T.Vector2(.37*scale,.61*scale),new T.Vector2(.33*scale,.12*scale)];
  const pot=new T.Mesh(new T.LatheGeometry(points,24),furnitureMaterial('ceramic',theme==='loft'?'#a47a57':'#c8c6b4'));pot.position.set(x,y,z);pot.castShadow=pot.receiveShadow=true;root.add(pot);
  cyl(root,.36*scale,.36*scale,.025,'#54493c',x,y+.62*scale,z);
  for(let i=0;i<12;i++){
   const a=i*2.4,reach=.38*scale,base=[x,y+.62*scale,z],tip=[x+Math.cos(a)*reach,y+(1.12+i%4*.12)*scale,z+Math.sin(a)*reach];
   rod(root,base,tip,.012*scale,'#647347');
   leaf(root,tip,[Math.cos(a),.3+i%3*.2,Math.sin(a)],.52*scale,.29*scale,['#405e39','#617a49','#7c925e'][i%3]);
  }
 }
 function seat(x,z,angle=0){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;root.add(g);
  fabric(box(g,1.12,.25,1.1,DARK,0,.9,.04,.13),'#505b62');
  const back=fabric(box(g,1.08,1.04,.16,INK,0,1.52,-.47,.13),'#434c54','mesh');
  back.rotation.x=-.12;
  curvedTube(g,[[-.52,1.03,-.47],[-.55,1.7,-.56],[-.42,2.01,-.55],[.42,2.01,-.55],[.55,1.7,-.56],[.52,1.03,-.47]],.035,INK,'paint');
  for(const side of[-1,1]){
   curvedTube(g,[[side*.43,.78,-.25],[side*.64,1.18,-.2],[side*.64,1.28,.3]],.045,INK,'paint');
   box(g,.19,.1,.62,DARK,side*.64,1.3,.1,.06);
  }
  cyl(g,.12,.12,.43,INK,0,.55,0);cyl(g,.065,.065,.38,STEEL,0,.39,0,.85);
  for(let i=0;i<5;i++){
   const a=i*Math.PI*2/5,xx=Math.cos(a)*.64,zz=Math.sin(a)*.64;
   curvedTube(g,[[0,.32,0],[xx*.55,.24,zz*.55],[xx,.18,zz]],.055,STEEL);
   for(const side of[-1,1]){
    const wheel=cyl(g,.105,.105,.075,DARK,xx+side*.055,.115,zz);wheel.rotation.z=Math.PI/2;
   }
  }
 }
 function monitor(x,z,side=1,keyboard=true){
  const g=new T.Group();g.position.set(x,0,z);if(side<0)g.rotation.y=Math.PI;root.add(g);
  box(g,1.28,.76,.1,INK,0,1.98,0,.04);
  const lcd=emit(g,1.13,.62,.025,'#ffffff',0,1.98,.06);lcd.material=displayMaterial();
  box(g,.045,.025,.015,'#ced5d4',.49,1.64,.07,.008);
  box(g,.06,.22,.07,STEEL,0,1.52,0,.01);
  box(g,.48,.035,.32,INK,0,1.43,0,.01);
  if(keyboard){box(g,.76,.04,.28,'#d5dad7',0,1.44,.65,.015);
  for(let row=0;row<3;row++)for(let k=0;k<10;k++)box(g,.05,.009,.055,'#5d6b74',-.32+k*.071,1.466,.57+row*.075,.005);
  box(g,.15,.045,.22,'#637b87',.61,1.44,.65,.03);}
 }
 function cup(x,z,y=1.49){
  const body=cyl(root,.115,.09,.23,'#ede5d3',x,y+.1,z);body.material=furnitureMaterial('ceramic','#ded7c8');cyl(root,.086,.086,.013,'#695044',x,y+.22,z);const handle=torus(root,.06,.02,'#ded7c8',x+.13,y+.12,z);handle.material=furnitureMaterial('ceramic','#ded7c8');
 }
 function tabletop(width,depth=2.8,height=1.35){
  slab(width,.17,depth,0,height,0);
  for(const x of[-width/2+.45,width/2-.45]){
   for(const z of[-depth/2+.25,depth/2-.25])box(root,.13,height,.13,theme==='loft'?DARK:STEEL,x,height/2,z,.015);
   box(root,.14,.12,depth-.3,DARK,x,.13,0,.01);
  }
  metal([-width/2+.45,.5,0],[width/2-.45,.5,0],.04);
  for(const side of[-1,1]){
   box(root,width-.6,.18,.08,INK,0,height-.18,side*(depth/2-.2),.025,.4);
   for(const x of[-width/2+.5,width/2-.5]){box(root,.3,.3,.035,STEEL,x,height-.22,side*(depth/2-.1),.025,.7);const screw=cyl(root,.035,.035,.045,STEEL,x,height-.2,side*(depth/2-.08),.8);screw.rotation.x=Math.PI/2;}
  }
 }
 function dumbbell(x,y,z,width=.7){
  metal([x-width/2,y,z],[x+width/2,y,z],.055);
  for(const side of[-1,1]){
   const m=cyl(root,.2,.2,.16,DARK,x+side*width*.35,y,z);m.rotation.z=Math.PI/2;
   const cap=cyl(root,.09,.09,.19,STEEL,x+side*width*.36,y,z);cap.rotation.z=Math.PI/2;
  }
 }
 switch(o.type){
  case 'singleDesk':{tabletop(w,d,1.35);monitor(0,-.18);cup(w*.32,.35,1.5);plant(-w*.33,-.2,.28,1.45);break;}
  case 'dualDesk':case 'workbench':case 'communal':case 'conference':case 'techTable':{
   const width=w-.5,depth=o.type==='conference'?Math.min(3.3,d-2.3):Math.min(3,d-2.2);
   tabletop(width,depth);
   const n=Math.max(1,Math.floor(width/(o.type==='dualDesk'?4.8:o.type==='conference'?2.5:3)));
   for(let i=0;i<n;i++){
    const x=(i-(n-1)/2)*(width/(n+.15));
    for(const side of[-1,1]){
     if(o.type==='dualDesk'){
      monitor(x-.71,side*.3,side,false);monitor(x+.71,side*.3,side,false);
      box(root,.9,.04,.3,'#59666d',x,1.45,side*.95,.02);
      for(let row=0;row<3;row++)for(let k=0;k<11;k++)box(root,.05,.012,.055,'#b0b8bb',x-.38+k*.075,1.477,side*(.85+row*.075),.005);
     }else if(o.type==='workbench'||o.type==='techTable')monitor(x,side*.3,side);
     else{
      // Open laptops and notebooks on communal and meeting tables.
      box(root,.8,.035,.55,INK,x,1.46,side*.7,.015);
      const screen=box(root,.8,.52,.045,INK,x,1.7,side*.4,.02);screen.rotation.x=side*-.16;
      emit(root,.67,.36,.018,'#96b2ba',x,1.73,side*.43);
      box(root,.42,.025,.55,PAPER,x+.85,1.47,side*.7,.005);
     }
     seat(x,side*(d/2-.55),side>0?Math.PI:0);
    }
    cup(x+1,0);
   }
   plant(-width/2+.65,0,.42,1.45);
   if(theme==='cyber')emit(root,width-.2,.035,.035,'#73cfda',0,1.3,depth/2);
   break;
  }
  case 'picnic':{
   tabletop(w-1,d-3);
   for(const side of[-1,1]){
    slab(w-1,.2,.75,0,.77,side*(d/2-.6));
    for(const x of[-w*.33,w*.33]){
     metal([x,.1,-d/2+.5],[x,1.3,-.5],.09,DARK);
     metal([x,.1,d/2-.5],[x,1.3,.5],.09,DARK);
    }
   }
   plant(0,0,.45,1.45);cup(-3,.5);cup(3,-.5);break;
  }
  case 'pingpong':{
   const surface=theme==='cyber'?'#427f9d':theme==='oasis'?'#568c80':'#426e87';
   const top=box(root,w,.17,d,surface,0,1.4,0,.055);top.material=furnitureMaterial('paint',surface);
   for(const side of[-1,1]){box(root,w-.3,.18,.09,INK,0,1.23,side*(d/2-.12),.025);box(root,.09,.18,d-.3,INK,side*(w/2-.12),1.23,0,.025);}
   box(root,w,.04,.055,PAPER,0,1.51,-d/2+.09,0);box(root,w,.04,.055,PAPER,0,1.51,d/2-.09,0);
   for(const x of[-w/2+.08,w/2-.08])box(root,.055,.04,d,PAPER,x,1.51,0,0);
   box(root,w,.025,.04,PAPER,0,1.51,0,0);
   for(const x of[-w*.32,w*.32])for(const z of[-d*.34,d*.34]){
    box(root,.13,1.12,.13,INK,x,.71,z,.025,.4);const wheel=cyl(root,.12,.12,.095,DARK,x,.12,z);wheel.rotation.z=Math.PI/2;
   }
   for(const side of[-1,1]){metal([-w*.32,.35,side*d*.34],[w*.32,1.1,side*d*.34],.035);metal([w*.32,.35,side*d*.34],[-w*.32,1.1,side*d*.34],.035);}
   // Model the open mesh net: it is visibly a table-tennis table from either camera.
   for(const z of[-d/2-.1,d/2+.1])metal([0,1.45,z],[0,2.03,z],.035);
   for(let y=1.53;y<=2.02;y+=.12)box(root,.022,.018,d+.2,'#dee4df',0,y,0,0);
   for(let z=-d/2;z<=d/2;z+=.25)box(root,.023,.48,.018,INK,0,1.76,z,0);
   box(root,.035,.04,d+.25,PAPER,0,2.04,0,0);
   for(const [x,z,color]of[[-w*.35,.65,'#bf6b57'],[w*.35,-.65,'#667786']]){
    const paddle=cyl(root,.27,.27,.045,color,x,1.54,z);slab(.11,.055,.38,x,1.55,z+.32);paddle.rotation.y=.3;
   }
   ball(root,.095,.095,.095,'#f2e7c2',w*.25,1.61,.3);break;
  }
  case 'pool':{
   slab(w,.55,d,0,1.13,0);
   fabric(box(root,w-.7,.06,d-.7,'#4f7962',0,1.45,0,.02),'#3f6954');
   for(const side of[-1,1]){
    slab(w,.23,.32,0,1.5,side*(d/2-.15));slab(.32,.23,d,side*(w/2-.15),1.5,0);
    for(const x of[-w*.34,w*.34]){
     const profile=[[.16,.03],[.18,.08],[.12,.2],[.11,.65],[.2,.82],[.22,1.03]].map(([r,y])=>new T.Vector2(r,y));
     const leg=new T.Mesh(new T.LatheGeometry(profile,24),furnitureMaterial('wood','#715036'));leg.position.set(x,0,side*d*.32);leg.castShadow=leg.receiveShadow=true;root.add(leg);
     const foot=cyl(root,.19,.19,.08,STEEL,x,.07,side*d*.32,.8);foot.material=furnitureMaterial('brushed','#a59a80');
    }
   }
   for(const x of[-w/2+.35,0,w/2-.35])for(const z of[-d/2+.35,d/2-.35]){cyl(root,.19,.19,.035,DARK,x,1.64,z);const lip=torus(root,.19,.035,'#6c5546',x,1.66,z);lip.rotation.x=Math.PI/2;lip.material=furnitureMaterial('leather','#665040');}
   const colors=['#d4b96a','#eee5cb','#7a9ba7','#bd7762','#c4b2cd','#8d7b65'];
   for(let i=0;i<6;i++)ball(root,.13,.13,.13,colors[i],(i%3)*.4-.3,1.61,Math.floor(i/3)*.4-.2);
   ball(root,.13,.13,.13,PAPER,-w*.27,1.61,.5);
   rod(root,[-w*.4,1.68,d*.35],[w*.3,1.68,d*.35],.04,'#d7bc8e');break;
  }
  case 'foosball':{
   slab(w,.55,d,0,1.1,0);box(root,w-.45,.07,d-.45,'#6c9481',0,1.42,0,.02);
   for(const side of[-1,1]){slab(w,.3,.2,0,1.5,side*d/2);slab(.2,.3,d,side*w/2,1.5,0)}
   for(let i=0;i<6;i++){
    const x=(i-2.5)*(w/7);metal([x,1.65,-d/2-.4],[x,1.65,d/2+.4],.035);
    for(const z of[-d*.25,0,d*.25]){box(root,.18,.32,.16,i%2?'#c17e77':'#7fb4c4',x,1.59,z,.02);ball(root,.11,.11,.11,PAPER,x,1.83,z)}
   }
   for(const x of[-w*.35,w*.35])for(const z of[-d*.32,d*.32])box(root,.16,1,.16,DARK,x,.5,z,.02);break;
  }
  case 'treadmill':{
   for(const x of[-w/2+.3,w/2-.3])for(const z of[-d*.36,d*.36])cyl(root,.19,.22,.18,DARK,x,.11,z);
   box(root,w,.34,d,DARK,0,.34,0,.16);
   fabric(box(root,w-.62,.07,d-1.35,'#465057',0,.54,.35,.04),'#394247','rubber');
   for(const side of[-1,1]){
    box(root,.29,.18,d-.4,'#9ba4aa',side*(w/2-.17),.58,0,.09);
    curvedTube(root,[[side*(w/2-.26),.47,-d*.17],[side*(w/2-.26),1.5,-d*.34],[side*(w/2-.26),2.46,-d*.34]],.11,STEEL,'paint');
    curvedTube(root,[[side*(w/2-.26),2.2,-d*.34],[side*(w/2-.2),1.96,-d*.1],[side*(w/2-.2),1.92,d*.1]],.095,DARK,'rubber');
   }
   box(root,w-.45,.55,1.1,'#4c5961',0,.78,-d*.35,.2);
   const dashboard=new T.Group();dashboard.position.set(0,2.3,-d*.34);dashboard.rotation.x=-.22;root.add(dashboard);
   box(dashboard,w-.05,.63,.34,INK,0,0,0,.15);
   const screen=emit(dashboard,1.17,.4,.025,'#ffffff',0,.035,.185);screen.material=displayMaterial('fitness');
   for(const side of[-1,1]){cyl(dashboard,.2,.2,.055,DARK,side*(w/2-.35),.14,.21);box(dashboard,.12,.07,.025,side<0?'#b96b5a':'#9baa85',side*.7,-.2,.185,.015)}
   box(root,.16,.11,.06,'#c47760',0,1.97,-d*.34+.25,.03);
   const roller=cyl(root,.16,.16,w-.35,STEEL,0,.39,d*.43,.8);roller.rotation.z=Math.PI/2;
   break;
  }
  case 'exerciseBike':{
   for(const z of[-1.7,1.7])metal([-1,.16,z],[1,.16,z],.1,DARK);
   metal([0,.16,1.7],[0,1.8,.3],.11);metal([0,.16,-1.7],[0,1.8,.3],.11);
   metal([0,1.8,.3],[0,1.15,-1],.11);
   const flywheel=cyl(root,.64,.64,.26,'#536773',0,.8,-.9);flywheel.rotation.z=Math.PI/2;
   const ring=torus(root,.53,.06,STEEL,.15,.8,-.9);ring.rotation.y=Math.PI/2;
   box(root,.85,.15,.6,DARK,0,1.95,.4,.1);
   metal([0,1,-1],[0,2.1,-1.6],.08);metal([-.8,2.1,-1.6],[.8,2.1,-1.6],.08,DARK);
   metal([-.65,.65,.1],[.65,.65,.1],.08);box(root,.5,.12,.3,DARK,-.68,.65,.1,.02);box(root,.5,.12,.3,DARK,.68,.65,.1,.02);break;
  }
  case 'dumbbells':{
   for(const x of[-w/2+.3,w/2-.3]){metal([x,.1,-.8],[x,1.45,0],.09,DARK);metal([x,.1,.8],[x,1.45,0],.09,DARK)}
   for(const y of[.6,1.2]){
    box(root,w,.12,1.45,'#53636a',0,y,0,.03);
    for(let x=-w/2+.7;x<w/2;x+=1.2)dumbbell(x,y+.28,0,.85);
   }break;
  }
  case 'weightBench':{
   fabric(box(root,1.4,.3,3.7,'#4b5255',0,.9,.7,.14),'#454d51','leather');
   upholsteredSeam(root,1.29,3.58,0,1.02,.7,'#87908e');
   for(const z of[-.5,2]){metal([0,.15,z],[0,.85,z],.1);metal([-.8,.15,z],[.8,.15,z],.08)}
   for(const x of[-1.3,1.3]){metal([x,.12,-1.5],[x,2.25,-1.5],.09,DARK);box(root,.4,.12,.3,STEEL,x,2.23,-1.5,.015)}
   metal([-2,2.37,-1.5],[2,2.37,-1.5],.07);
   for(const side of[-1,1])for(let i=0;i<2;i++){
    const plate=cyl(root,.42-i*.06,.42-i*.06,.14,INK,side*(1.4+i*.17),2.37,-1.5);plate.rotation.z=Math.PI/2;
   }break;
  }
  case 'loungeChair':{
   const color='#456e91';
   for(const x of[-.82,.82])for(const z of[-.78,.78]){const leg=cyl(root,.07,.1,.34,STEEL,x,.2,z,.8);leg.material=furnitureMaterial('brushed','#8c979d');}
   fabric(box(root,2.2,.42,2.25,color,0,.61,0,.19),color);
   fabric(box(root,1.67,.35,1.67,color,0,.96,.18,.17),color);
   const back=fabric(box(root,2.12,1.1,.38,color,0,1.38,-.92,.18),color);back.rotation.x=-.12;
   for(const x of[-1.01,1.01])fabric(box(root,.31,.78,2.2,color,x,.99,0,.14),color);
   upholsteredSeam(root,1.54,1.53,0,1.09,.18,'#879fb3');break;
  }
  case 'officeSofa':{
   const color=theme==='penthouse-open'?'#858f97':theme==='loft'?'#8a6246':theme==='oasis'?'#7e8d68':theme==='cyber'?'#796483':'#7c929e';
   const covering=theme==='loft'?'leather':'fabric';
   for(const x of[-w/2+.5,w/2-.5])for(const z of[-d/2+.45,d/2-.45]){
    const foot=cyl(root,.085,.11,.38,'#655a4b',x,.21,z);foot.material=furnitureMaterial('wood','#77634b');
   }
   fabric(box(root,w,.47,d,color,0,.62,0,.2),color,covering);
   fabric(box(root,w-.1,1.18,.38,color,0,1.17,-d/2+.22,.17),color,covering);
   for(const x of[-w/2+.24,w/2-.24])fabric(box(root,.48,.86,d,color,x,.98,0,.2),color,covering);
   const span=(w-1.05)/3;
   for(let i=0;i<3;i++){
    const x=(i-1)*span;
    fabric(box(root,span-.055,.35,d-.75,color,x,1.01,.18,.17),color,covering);
    upholsteredSeam(root,span-.11,d-.86,x,1.14,.18,theme==='loft'?'#ab8970':'#a3afa9');
    const back=fabric(box(root,span-.06,1.05,.43,color,x,1.51,-d/2+.54,.19),color,covering);back.rotation.x=-.13;
   }
   const pillow=fabric(box(root,.78,.8,.26,'#b9b49b',-w*.3,1.4,-d*.13,.13),'#beb69f');pillow.rotation.set(.12,0,.27);
   break;
  }
  case 'smallTable':case 'techTableSmall':{tabletop(w,d,1);box(root,.7,.03,.6,PAPER,-.4,1.13,0,.01);cup(.7,.1,1.15);break}
  case 'roundOttoman':{cyl(root,w/2,w/2,.65,theme==='oasis'?'#bac8a2':'#a6a5b0',0,.4,0);break}
  case 'cafeTable':{
   const top=cyl(root,1.2,1.2,.14,'#ffffff',0,1.2,0);top.material=wood;
   cyl(root,.12,.12,1.08,STEEL,0,.6,0);cyl(root,.65,.65,.08,INK,0,.12,0);
   for(const side of[-1,1])seat(side*1.35,side*.25,side>0?-Math.PI/2:Math.PI/2);
   cup(.35,.25,1.31);plant(-.4,-.3,.3,1.3);break;
  }
  case 'coffeeBar':{
   box(root,w,1.3,d,theme==='loft'?'#886344':'#d0cbb7',0,.7,0,.05);slab(w+.2,.16,d+.15,0,1.44,0);
   for(let x=-w/2+1;x<w/2;x+=1.6){box(root,.65,.06,.04,INK,x,.9,d/2+.025,.01);cup(x,d*.22,1.56)}
   box(root,2,1.2,1.25,INK,-w*.2,2.07,-.25,.07);box(root,1.7,.18,1.1,STEEL,-w*.2,1.6,-.1,.02);
   emit(root,.7,.22,.04,'#a9c5bc',-w*.2,2.23,.4);metal([-w*.2,2.07,.45],[-w*.2,1.9,.65],.06);
   cyl(root,.4,.4,.7,STEEL,w*.28,1.9,-.25);plant(w/2-.6,0,.5,1.55);break;
  }
  case 'bookcase':{
   slab(w,.13,d,0,.12,0);slab(w,.13,d,0,o.h,0);
   // Low open shelving; no tall backs or dividers around the play area.
   for(const x of[-w/2+.08,0,w/2-.08])slab(.16,o.h,d,x,o.h/2,0);
   for(let level=0;level<3;level++){
    const y=.35+level*.72;slab(w,.09,d,0,y,0);
    for(let i=0;i<Math.floor(w/.38)-1;i++){
     const colors=['#899888','#a7b4b6','#b99f76','#947a6d'];
     box(root,.24,.44,.65,colors[i%4],-w/2+.45+i*.37,y+.27,.2,.01);
    }
   }plant(w*.3,0,.42,o.h+.1);break;
  }
  case 'cueRack':{
   slab(w,.16,d,0,.2,0);slab(w,.14,d,0,1.7,0);
   for(let z=-d/2+.8;z<d/2;z+=1.05)rod(root,[0,.2,z],[0,2.4,z],.045,'#c9ae7c');break;
  }
  case 'serverBank':{
   box(root,w,o.h,d,'#344753',0,o.h/2,0,.05);
   for(const side of[-1,1]){
    box(root,w-.3,o.h-.25,.06,'#263945',0,o.h/2,side*(d/2+.035),.02);
    for(let y=.3;y<o.h-.2;y+=.35){
     box(root,w-.55,.12,.03,'#617783',0,y,side*(d/2+.08),.01);
     emit(root,.12,.06,.04,'#8cc8c7',w*.3,y,side*(d/2+.11));
    }
   }break;
  }
  case 'arcadeBank':{
   const n=Math.floor(w/2.15);
   for(let i=0;i<n;i++){
    const x=(i-(n-1)/2)*2.15;
    const profile=new T.Shape();profile.moveTo(-1.05,.05);profile.lineTo(.85,.05);profile.lineTo(.85,1.05);profile.lineTo(1.2,1.45);profile.lineTo(.8,1.63);profile.lineTo(.6,2.6);profile.lineTo(.9,2.95);profile.lineTo(.9,3.3);profile.lineTo(-1.05,3.3);profile.closePath();
    const geo=new T.ExtrudeGeometry(profile,{depth:1.75,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});
    const cabinet=new T.Mesh(geo,furnitureMaterial('paint','#354454'));cabinet.rotation.y=-Math.PI/2;cabinet.position.x=x+.875;cabinet.castShadow=cabinet.receiveShadow=true;root.add(cabinet);
    const screen=emit(root,1.51,.88,.04,'#ffffff',x,2.23,.68);screen.material=displayMaterial('arcade');
    box(root,1.8,.13,.7,'#796b85',x,1.48,.92,.045);
    emit(root,1.55,.16,.04,'#bbc4cb',x,3.12,.94);
    cyl(root,.06,.06,.2,DARK,x-.42,1.65,1.03);ball(root,.1,.1,.1,'#ac816b',x-.42,1.8,1.03);
    for(let j=0;j<3;j++)cyl(root,.075,.075,.05,'#91adba',x+.1+j*.22,1.57,1.03);
    box(root,.8,.6,.025,INK,x,.58,.9,.05);box(root,.18,.045,.03,STEEL,x,.65,.92,.01);
   }break;
  }
  case 'gardenBed':{
   box(root,w,.65,d,theme==='loft'?'#987655':'#c4bda2',0,.35,0,.08);
   box(root,w-.25,.045,d-.25,'#647650',0,.7,0,.01);
   const length=Math.max(w,d),n=Math.max(2,Math.floor(length/1.5));
   for(let i=0;i<n;i++){const t=(i-(n-1)/2)*(length/n);plant(w>d?t:0,w>d?0:t,.65,.73)}break;
  }
  case 'officeTree':{
   const profile=[new T.Vector2(.71,0),new T.Vector2(.76,.08),new T.Vector2(.99,.96),new T.Vector2(1.03,1.05),new T.Vector2(.94,1.1),new T.Vector2(.9,.98),new T.Vector2(.82,.2)];
   const pot=new T.Mesh(new T.LatheGeometry(profile,32),furnitureMaterial('ceramic',theme==='loft'?'#997b5b':'#c9c7b5'));pot.position.y=.04;pot.castShadow=pot.receiveShadow=true;root.add(pot);
   cyl(root,.89,.89,.025,'#544c3b',0,1.02,0);
   const trunk=rod(root,[0,1,0],[.05,4.35,0],.085,'#807050');trunk.material=furnitureMaterial('wood','#78674a');
   for(let i=0;i<16;i++){
    const a=i*2.4,y=2.5+(i%5)*.38,r=.5+(i%3)*.27,x=Math.cos(a)*r,z=Math.sin(a)*r;
    rod(root,[.03,y-.6,0],[x,y,z],.025,'#7a714e');
    for(let j=0;j<6;j++){
     const b=a+j*.9,xx=x+Math.cos(b)*.25,zz=z+Math.sin(b)*.25;
     leaf(root,[xx,y+j%2*.11,zz],[Math.cos(b),.15+(j%3)*.22,Math.sin(b)],.52+(j%3)*.12,.28+(j%2)*.1,['#3c603c','#567644','#738b55'][j%3]);
    }
   }break;
  }
  case 'objective':return null;
  default:throw new Error('Missing rooftop furniture renderer: '+o.type);
 }
 finishFurniture(root,wood,theme);
 return root;
}
