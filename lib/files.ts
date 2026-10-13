import {Resume,uid} from './domain';
const dataUrl=(f:Blob)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('文件读取失败'));r.readAsDataURL(f);});
export async function parseResume(file:File):Promise<Resume>{
if(file.size>8*1024*1024)throw new Error(file.name+' 超过 8MB，请压缩后上传。');
const out:Resume={id:uid(),name:file.name,text:'',images:[],stage:'终面',note:''};
const ext=file.name.split('.').pop()?.toLowerCase();
if(['png','jpg','jpeg','webp'].includes(ext||'')){out.images=[await dataUrl(file)];out.note='图片已保存；文字识别需要连接 AI。';}
else if(ext==='docx'){const mammoth=await import('mammoth');const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});out.text=result.value;if(!out.text.trim())throw new Error('Word 中未提取到文字，请使用 PDF 或截图。');if(result.messages.length)out.note='已提取文字，请检查预览是否完整。';}
else if(ext==='pdf'){const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';const task=pdfjs.getDocument({data:await file.arrayBuffer(),cMapUrl:'/cmaps/',cMapPacked:true,standardFontDataUrl:'/standard_fonts/'});const doc=await task.promise;
try{if(doc.numPages>15)throw new Error('单份 PDF 最多 15 页，请拆分后上传。');for(let p=1;p<=doc.numPages;p++){const page=await doc.getPage(p);const content=await page.getTextContent();const txt=content.items.map((x:any)=>'str'in x?x.str:'').join(' ');out.text+=`\n[第 ${p} 页]\n${txt}\n`;if(txt.trim().length<40){const vp=page.getViewport({scale:1.4});const canvas=document.createElement('canvas');canvas.width=vp.width;canvas.height=vp.height;await page.render({canvas,viewport:vp}).promise;out.images.push(canvas.toDataURL('image/jpeg',0.8));}}}finally{await task.destroy();}if(out.images.length)out.note='包含扫描页；扫描页识别需要连接 AI。';}
else if(ext==='txt')out.text=await file.text();
else if(ext==='doc')throw new Error('旧版 .doc 请先另存为 .docx 或 PDF。');
else throw new Error('支持 PDF、DOCX、PNG、JPG、WEBP 和 TXT。');
return out;}
