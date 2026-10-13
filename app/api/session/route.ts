import {COOKIE,issueSession,checkPassword,sameOrigin} from '../../../lib/access';
export const runtime='nodejs';
export async function POST(request:Request){
if(!sameOrigin(request))return Response.json({error:'来源不匹配'},{status:403});
const secret=process.env.ANALYSIS_PASSWORD;
if(!secret)return Response.json({error:'当前未配置自动分析访问密码。示例和对话分析功能可直接使用。'},{status:503});
try{const raw=await request.text();if(raw.length>4096)throw new Error('invalid');const data=JSON.parse(raw);if(typeof data.password!=='string'||!checkPassword(data.password,secret))return Response.json({error:'访问密码不正确。'},{status:401});const secure=new URL(request.url).protocol==='https:'?'; Secure':'';return Response.json({ok:true},{headers:{'Set-Cookie':`${COOKIE}=${issueSession(secret)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${secure}`,'Cache-Control':'no-store'}});}catch{return Response.json({error:'请求格式不正确。'},{status:400});}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return Response.json({error:'来源不匹配'},{status:403});return Response.json({ok:true},{headers:{'Set-Cookie':`${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`}});}
