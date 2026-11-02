import fs from 'node:fs/promises';
import {build} from 'esbuild';
await fs.rm('dist',{recursive:true,force:true});await fs.mkdir('dist',{recursive:true});
await fs.cp('public','dist',{recursive:true});
await build({entryPoints:['src/app.js'],bundle:true,minify:true,format:'esm',target:'es2022',outfile:'dist/app.js',legalComments:'eof'});
console.log('Vercel static game built in dist/. Room requests are served by api/game.js.');
