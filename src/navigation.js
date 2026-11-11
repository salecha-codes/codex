function blocked(a,b,obstacles,pad=1.05){return obstacles.some(o=>{let lo=0,hi=1;for(const[v,d,min,max]of[[a.x,b.x-a.x,o.x-o.w/2-pad,o.x+o.w/2+pad],[a.z,b.z-a.z,o.z-o.d/2-pad,o.z+o.d/2+pad]]){if(Math.abs(d)<1e-9){if(v<min||v>max)return false}else{let t1=(min-v)/d,t2=(max-v)/d;if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)return false}}return hi>=0&&lo<=1})}
const grids=new WeakMap();
function grid(arena){
 if(grids.has(arena))return grids.get(arena);
 const spacing=4,minX=-arena.size.x+2,minZ=-arena.size.z+2,nx=Math.floor((arena.size.x*2-4)/spacing)+1,nz=Math.floor((arena.size.z*2-4)/spacing)+1;
 const points=Array.from({length:nx*nz},(_,k)=>({x:minX+k%nx*spacing,z:minZ+Math.floor(k/nx)*spacing}));
 const free=points.map(q=>arena.obstacles.every(o=>Math.abs(q.x-o.x)>o.w/2+1.1||Math.abs(q.z-o.z)>o.d/2+1.1)),edges=new Map();
 const neighbors=k=>{if(edges.has(k))return edges.get(k);const result=[],x=k%nx,z=Math.floor(k/nx);for(const[dx,dz]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){const ax=x+dx,az=z+dz,n=az*nx+ax;if(ax>=0&&az>=0&&ax<nx&&az<nz&&free[n]&&!blocked(points[k],points[n],arena.obstacles))result.push([n,spacing*Math.hypot(dx,dz)])}edges.set(k,result);return result};
 const nearest=q=>{let best=-1,d=Infinity;for(let k=0;k<points.length;k++){if(!free[k])continue;const v=points[k],n=(q.x-v.x)**2+(q.z-v.z)**2;if(n<d){d=n;best=k}}return best};
 const result={points,nearest,neighbors};grids.set(arena,result);return result;
}
class Queue{
 constructor(){this.items=[];this.serial=0}
 less(a,b){return a.priority<b.priority||a.priority===b.priority&&a.order<b.order}
 push(key,priority){const a=this.items,v={key,priority,order:this.serial++};let i=a.length;a.push(v);while(i){const p=(i-1)>>1;if(!this.less(v,a[p]))break;a[i]=a[p];i=p}a[i]=v}
 pop(){const a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&this.less(a[c+1],a[c]))c++;if(!this.less(a[c],last))break;a[i]=a[c];i=c}a[i]=last}return first.key}
}
export function nextWaypoint(p,goal,arena,tick){
 const target={x:Math.max(-arena.size.x+2,Math.min(arena.size.x-2,goal.x)),z:Math.max(-arena.size.z+2,Math.min(arena.size.z-2,goal.z))};
 if(!blocked(p,target,arena.obstacles)){p.nav=null;return target}
 if(p.nav&&tick-p.nav.tick<90&&Math.hypot(p.nav.gx-target.x,p.nav.gz-target.z)<5){while(p.nav.points.length>1&&Math.hypot(p.x-p.nav.points[0].x,p.z-p.nav.points[0].z)<2.8)p.nav.points.shift();return p.nav.points[0]||target}
 const {points,nearest,neighbors}=grid(arena),start=nearest(p),end=nearest(target);if(start<0||end<0)return target;
 const cost=new Map([[start,0]]),parent=new Map(),open=new Queue(),seen=new Set(),heuristic=k=>Math.hypot(points[k].x-target.x,points[k].z-target.z);open.push(start,heuristic(start));let reached=-1;
 while(open.items.length){const current=open.pop();if(current===end){reached=current;break}if(seen.has(current))continue;seen.add(current);for(const[k,d]of neighbors(current)){if(seen.has(k))continue;const next=cost.get(current)+d;if(next<(cost.get(k)??Infinity)){cost.set(k,next);parent.set(k,current);open.push(k,next+heuristic(k))}}}
 const path=[];if(reached>=0){for(let k=reached;k!==undefined;k=parent.get(k)){path.push(points[k]);if(k===start)break}path.reverse();if(path.length>1)path.shift()}
 p.nav={tick,gx:target.x,gz:target.z,points:path};return path[0]||target;
}
