import {handleRoomRequest,json} from '../server/rooms.js';

export async function nodeRequest(req){
 const protocol=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();
 const host=req.headers.host||'localhost';const url=new URL(req.url,protocol+'://'+host);
 // Vercel supplies rewritten query parameters even on request adapters that retain
 // the original URL; keep both the native and local HTTP server paths supported.
 if(url.pathname==='/api/game'&&!url.searchParams.has('route')&&req.query?.route)url.searchParams.set('route',String(req.query.route));
 let body;
 if(!['GET','HEAD'].includes(req.method)){
  if(req.body!==undefined)body=Buffer.isBuffer(req.body)?req.body:typeof req.body==='string'?req.body:JSON.stringify(req.body);
  else{const chunks=[];let size=0;for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>55000)throw new RangeError('Request too large');chunks.push(bytes)}body=Buffer.concat(chunks)}
  if(Buffer.byteLength(body)>55000)throw new RangeError('Request too large');
 }
 const headers=new Headers();for(const key of['origin','content-type','content-length','x-room-token','authorization']){const value=req.headers[key];if(value)headers.set(key,Array.isArray(value)?value[0]:value)}
 return new Request(url,{method:req.method,headers,...(body!==undefined?{body}:{})});
}
export function createHandler(options={}){return async function handler(req,res){
 let response;
 try{response=await handleRoomRequest(await nodeRequest(req),options)}catch(error){response=json({error:error instanceof RangeError?'Request too large':'Invalid request'},400)}
 res.statusCode=response.status;for(const[key,value]of response.headers)res.setHeader(key,value);
 res.end(Buffer.from(await response.arrayBuffer()));
}}
export default createHandler();
