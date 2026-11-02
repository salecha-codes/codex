import {api as localRoomApi} from '../worker/api.js';

export const DEFAULT_ROOM_BACKEND='https://office-chair-rumble.salechamahendra7.chatgpt.site';
const routePattern=/^(?:health|rooms(?:\/[A-Z]{6}(?:\/(?:join|sync|signal|leave|settings))?)?)$/;
export const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

export function resolveRoomRoute(url){
 const parsed=new URL(url),path=parsed.pathname;
 if(path.startsWith('/game-api/'))return path.slice('/game-api/'.length);
 if(path.startsWith('/api/rooms'))return path.slice('/api/'.length);
 if(path==='/api/health')return 'health';
 if(path==='/api/game')return parsed.searchParams.get('route')||'';
 return '';
}
function backendOrigin(value){
 const url=new URL(value);
 if(url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname))throw new Error('Invalid room backend');
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if(url.protocol!=='https:'&&!(local&&url.protocol==='http:'))throw new Error('Room backend must use HTTPS');
 return url.origin;
}

// All browser requests remain same-origin; room tokens never go into URLs or logs.
export async function handleRoomRequest(request,{env=process.env,fetchImpl=fetch,database}={}){
 const route=resolveRoomRoute(request.url);
 if(!routePattern.test(route))return json({error:'Not found'},404);
 if(request.method!=='POST'&&!(request.method==='GET'&&route==='health'))return json({error:'Method not allowed'},405);
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return json({error:'Use this game’s own page to join.'},403);
 let body;
 if(request.method==='POST'){
  const declared=Number(request.headers.get('content-length')||0);if(declared>55000)return json({error:'Request too large'},400);
  body=await request.text();if(new TextEncoder().encode(body).byteLength>55000)return json({error:'Request too large'},400);
  try{const value=JSON.parse(body||'{}');if(!value||typeof value!=='object'||Array.isArray(value))throw Error();body=JSON.stringify(value)}catch{return json({error:'Invalid request'},400)}
 }
 const token=request.headers.get('x-room-token')||request.headers.get('authorization')?.replace(/^Bearer /,'');
 if(token&&token.length>150)return json({error:'Invalid room token'},401);
 const storage=env.ROOM_STORAGE||(env.DATABASE_URL||env.POSTGRES_URL?'postgres':'shared');
 if(!['shared','postgres'].includes(storage))return json({error:'Room storage is not configured correctly. Solo and local play still work.'},503);
 try{
  if(storage==='postgres'||database){
   const db=database||(await import('./postgres.js')).getRoomDatabase(env.DATABASE_URL||env.POSTGRES_URL);
   const headers=new Headers();if(origin)headers.set('Origin',origin);if(token)headers.set('X-Room-Token',token);if(body!==undefined)headers.set('Content-Type','application/json');
   return await localRoomApi(new Request(new URL('/game-api/'+route,request.url),{method:request.method,headers,...(body!==undefined?{body}:{})}),{DB:db});
  }
  const upstream=backendOrigin(env.ROOM_BACKEND_URL||DEFAULT_ROOM_BACKEND),headers=new Headers({'Accept':'application/json'});
  // The Vercel function is the upstream API client. Do not forward browser cookies,
  // platform sign-in headers, or arbitrary request/response headers to the room service.
  if(token)headers.set('X-Room-Token',token);
  if(body!==undefined){headers.set('Content-Type','application/json');headers.set('Origin',upstream)}
  const response=await fetchImpl(new URL('/game-api/'+route,upstream),{method:request.method,headers,...(body!==undefined?{body}:{}),redirect:'manual',signal:AbortSignal.timeout(10000)});
  if(!response.headers.get('content-type')?.toLowerCase().includes('application/json'))return json({error:'The room service is unavailable. Please try again.'},502);
  const text=await response.text();if(text.length>262144)return json({error:'Unexpected room response'},502);
  try{JSON.parse(text)}catch{return json({error:'Unexpected room response'},502)}
  return new Response(text,{status:response.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch(error){
  console.warn('Room service unavailable:',error?.name||'Error');
  return json({error:'The room service is unavailable. Solo and local play still work. Please try again.'},503);
 }
}
