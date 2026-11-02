import {createServer} from 'node:http';
import fs from 'node:fs/promises';import path from 'node:path';
import {createHandler} from '../api/game.js';import {createDevDatabase} from '../server/dev-database.js';
const port=Number(process.env.PORT||3090),folder=path.resolve('dist');
const productionLike=process.env.ROOM_STORAGE||process.env.DATABASE_URL||process.env.POSTGRES_URL;
const db=productionLike?null:createDevDatabase('work/dev.sqlite');
const api=createHandler(db?{database:db,env:{ROOM_STORAGE:'postgres'}}:{});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://'+req.headers.host);
 if(url.pathname.startsWith('/game-api/')||url.pathname.startsWith('/api/')){req.headers['x-forwarded-proto']='http';return api(req,res)}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
 const name=url.pathname==='/'||url.pathname.startsWith('/c/')?'/index.html':decodeURIComponent(url.pathname);
 const filename=path.resolve(folder,'.'+name);
 if(!filename.startsWith(folder+path.sep)){res.writeHead(404);return res.end('Not found')}
 try{const bytes=await fs.readFile(filename);res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes)}catch{res.writeHead(404);res.end('Not found')}
});
server.listen(port,'0.0.0.0',()=>console.log(`Office Chair Rumble: http://127.0.0.1:${port} (${db?'local persistent room database':'configured room backend'})`));
for(const signal of['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{db?.close();process.exit(0)}));
