import {cp,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const root=path.dirname(require.resolve('pdfjs-dist/package.json'));
await mkdir('public',{recursive:true});
await cp(path.join(root,'build/pdf.worker.min.mjs'),'public/pdf.worker.min.mjs');
await cp(path.join(root,'cmaps'),'public/cmaps',{recursive:true});
await cp(path.join(root,'standard_fonts'),'public/standard_fonts',{recursive:true});
