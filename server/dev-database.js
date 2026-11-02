// Local preview only. Production functions use the shared room service or Postgres.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,mkdirSync} from 'node:fs';
export function createDevDatabase(path=':memory:'){
 if(path!==':memory:')mkdirSync('work',{recursive:true});
 const sqlite=new DatabaseSync(path);sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
 for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort()){
  if(!sqlite.prepare('SELECT name FROM local_migrations WHERE name=?').get(file)){
   sqlite.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));sqlite.prepare('INSERT INTO local_migrations VALUES (?)').run(file);
  }
 }
 return{prepare(sql){let args=[];return{bind(...values){args=values;return this},async first(){return sqlite.prepare(sql).get(...args)||null},async all(){return{results:sqlite.prepare(sql).all(...args)}},execute(){return sqlite.prepare(sql).run(...args)},async run(){return this.execute()}}},async batch(statements){sqlite.exec('BEGIN');try{const results=statements.map(s=>s.execute());sqlite.exec('COMMIT');return results}catch(error){sqlite.exec('ROLLBACK');throw error}},close(){sqlite.close()}};
}
