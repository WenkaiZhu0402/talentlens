import {allowed} from '../../../lib/access';
export const runtime='nodejs';
export const maxDuration=120;
import {z} from 'zod';
import {instructions,learningJSON,reportJSON,learningSchema,reportSchema} from '../../../lib/analysis';
import {dimensions,validateWeights} from '../../../lib/domain';
const resume=z.object({id:z.string().max(100),name:z.string().max(300),text:z.string().max(100000),images:z.array(z.string().max(5000000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/)).max(15),stage:z.string().max(30),note:z.string().max(10000),demo:z.boolean().optional()});
const input=z.object({mode:z.enum(['learn','evaluate']),role:z.object({name:z.string().max(300),jd:z.string().max(30000),requirements:z.string().max(20000),hardRules:z.string().max(10000),weights:z.array(z.number()).length(6),samples:z.array(resume).max(30),learning:z.any().nullable(),candidate:resume.nullable(),notes:z.string().max(20000)})});
export async function POST(req:Request){
const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'来源不匹配'},{status:403});
const e=process.env;if(!e.OPENAI_API_KEY||!e.OPENAI_MODEL)return Response.json({error:'AI 尚未连接。可先体验示例，真实简历不会生成模拟分数。可导出分析任务在当前 ChatGPT 对话完成，再导入结果。'},{status:503});
if(!e.ANALYSIS_PASSWORD)return Response.json({error:'服务端尚未配置分析访问密码，自动分析未启用。'},{status:503});
if(!allowed(req))return Response.json({error:'请在模型与数据设置中输入独立访问密码，解锁自动分析。'},{status:401});
try{
if(Number(req.headers.get('content-length')||0)>4000000)return Response.json({error:'本次材料超过4MB，请减少扫描页或样本数量，或使用对话任务导出。'},{status:413});
const raw=await req.text();if(raw.length>4000000)return Response.json({error:'本次材料过大。'},{status:413});
const {mode,role}=input.parse(JSON.parse(raw));if(!validateWeights(role.weights))throw new Error('六项权重之和必须为100。');
if(!role.jd.trim())throw new Error('请先填写岗位 JD。');
if(mode==='learn'&&!role.samples.length)throw new Error('请先上传合格样本。');
if(mode==='evaluate'&&!role.candidate)throw new Error('请先上传候选人简历。');
if(role.samples.some(s=>s.demo)||role.candidate?.demo)throw new Error('真实分析不能混入虚构示例；请新建岗位并上传真实材料。');
const docs=mode==='learn'?role.samples:[role.candidate!];
const base={task:mode==='learn'?'提炼合格样本共性与权重建议':'评估候选人并生成电话问题及沟通话术',name:role.name,jd:role.jd,requirements:role.requirements,hardRules:role.hardRules,weights:role.weights,learning:mode==='evaluate'&&role.learning?.approved?role.learning:null,notes:role.notes};
const content:any[]=[{type:'input_text',text:JSON.stringify(base)}];
for(const d of docs){content.push({type:'input_text',text:JSON.stringify({id:d.id,name:d.name,text:d.text,stage:d.stage,note:d.note})});for(let i=0;i<d.images.length;i++){content.push({type:'input_text',text:`以下图片属于样本 ${d.id}，图片 ${i+1}。`},{type:'input_image',image_url:d.images[i],detail:'high'});}}
const result=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${e.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:e.OPENAI_MODEL,store:false,instructions,input:[{role:'user',content}],max_output_tokens:6500,text:{format:{type:'json_schema',name:mode==='learn'?'learning':'evaluation',strict:true,schema:mode==='learn'?learningJSON:reportJSON}}}),signal:AbortSignal.timeout(110000)});
if(!result.ok){return Response.json({error:result.status===429?'模型额度或请求频率受限，请稍后重试。':`模型请求失败（${result.status}），请检查服务端模型配置。`},{status:502});}
const payload:any=await result.json();if(payload.status!=='completed')throw new Error('模型未完成分析，请重试或减少材料。');
const txt=payload.output?.flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('');const parsed=JSON.parse(txt||'{}');
const data=mode==='learn'?learningSchema.parse(parsed):reportSchema.parse(parsed);
if(mode==='learn'){const l=learningSchema.parse(data);if(!validateWeights(l.suggestedWeights))throw new Error('模型权重未通过校验，请重试。');for(const item of l.insights){if(new Set(item.sampleIds).size!==item.count||item.sampleIds.some(id=>!role.samples.some(s=>s.id===id)))throw new Error('样本引用校验失败，请重试。');}}
else {const r=reportSchema.parse(data);if(r.items.some((v,i)=>v.name!==dimensions[i]))throw new Error('评分维度校验失败，请重试。');}
return Response.json({data},{headers:{'Cache-Control':'no-store'}});
}catch(err){const message=err instanceof z.ZodError?'材料或模型输出格式不完整，请检查后重试。':err instanceof Error?err.message:'分析失败，请重试。';return Response.json({error:message},{status:400});}
}
