import {neon} from '@neondatabase/serverless';

export const schema=[
 `CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, created_at BIGINT NOT NULL, expires_at BIGINT NOT NULL, state TEXT NOT NULL DEFAULT '{}', updated_at BIGINT NOT NULL, settings TEXT NOT NULL DEFAULT '{}')`,
 `CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, room TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE, slot INTEGER NOT NULL CHECK(slot BETWEEN 0 AND 3), token_hash TEXT NOT NULL, name TEXT NOT NULL, "character" INTEGER NOT NULL, input TEXT NOT NULL DEFAULT '{}', signal TEXT NOT NULL DEFAULT '{}', last_seen BIGINT NOT NULL, UNIQUE(room,slot))`,
 `CREATE INDEX IF NOT EXISTS room_member ON members(room)`,
 `CREATE INDEX IF NOT EXISTS room_expiry ON rooms(expires_at)`
];

// Compile the small shared API's bound SQLite-style statements to Postgres without
// changing quoted strings, comments or identifiers. Values remain bound parameters.
export function postgresSql(sql){
 let result='',index=0,i=0;
 while(i<sql.length){
  const c=sql[i];
  if(c==="'"||c==='"'||c==='`'){
   const quote=c;result+=quote==='`'?'"':quote;i++;
   while(i<sql.length){const ch=sql[i++];if(ch===quote){if(sql[i]===quote){result+=quote+quote;i++;continue}result+=quote==='`'?'"':quote;break}result+=ch}
  }else if(c==='-'&&sql[i+1]==='-'){
   const end=sql.indexOf('\n',i);if(end<0){result+=sql.slice(i);break}result+=sql.slice(i,end+1);i=end+1;
  }else if(c==='/'&&sql[i+1]==='*'){
   const end=sql.indexOf('*/',i+2);if(end<0)throw Error('Unclosed SQL comment');result+=sql.slice(i,end+2);i=end+2;
  }else if(c==='?'){result+='$'+(++index);i++}
  else if(/[A-Za-z_]/.test(c)){
   let end=i+1;while(end<sql.length&&/[A-Za-z_0-9]/.test(sql[end]))end++;
   const word=sql.slice(i,end);result+=word.toLowerCase()==='character'?'"character"':word;i=end;
  }else{result+=c;i++}
 }
 return result;
}
const numeric=new Set(['created_at','expires_at','updated_at','last_seen','slot','character']);
function rows(value){return(Array.isArray(value)?value:value.rows||[]).map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,numeric.has(key)&&typeof value==='string'&&Number.isSafeInteger(Number(value))?Number(value):value])))}
export function createRoomDatabase(executor){
 let initialized;
 const ready=()=>initialized||(initialized=executor.transaction([{sql:'SELECT pg_advisory_xact_lock(1935764137)',params:[]},...schema.map(sql=>({sql,params:[]}))]).catch(error=>{initialized=null;throw error}));
 const safe=async callback=>{try{return await callback()}catch(error){throw new Error(error?.code==='23505'?'UNIQUE room membership conflict':'Room database query failed')}};
 return{
  prepare(sql){let params=[];const statement={get sql(){return postgresSql(sql)},get params(){return params},bind(...values){params=values;return this},async first(){await ready();return(rows(await safe(()=>executor.query(this.sql,params))))[0]||null},async all(){await ready();return{results:rows(await safe(()=>executor.query(this.sql,params)))}},async run(){
   await ready();let value;
   if(/^\s*INSERT INTO members\b/i.test(this.sql)){
    // Serialize allocations for this room. The capacity subquery then executes
    // with a fresh READ COMMITTED snapshot after a competing join has committed.
    const result=await safe(()=>executor.transaction([{sql:'SELECT code FROM rooms WHERE code = $1 FOR UPDATE',params:[params[1]]},{sql:this.sql,params}]));value=result[1];
   }else value=await safe(()=>executor.query(this.sql,params));
   return{success:true,results:rows(value)};
  }};return statement},
  async batch(statements){await ready();const result=await safe(()=>executor.transaction(statements.map(s=>({sql:s.sql,params:s.params}))));return result.map(r=>({success:true,results:rows(r)}))}
 };
}
const databases=new Map();
export function getRoomDatabase(url){
 if(!url)throw Error('DATABASE_URL is required for independent room storage');
 if(!databases.has(url)){
  const sql=neon(url);
  databases.set(url,createRoomDatabase({query:(query,params)=>sql.query(query,params),transaction:queries=>sql.transaction(queries.map(q=>sql.query(q.sql,q.params)))}));
 }
 return databases.get(url);
}
