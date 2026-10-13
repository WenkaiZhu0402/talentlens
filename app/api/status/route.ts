import {allowed} from '../../../lib/access';
export const runtime='nodejs';
export async function GET(request:Request){const configured=!!(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL&&process.env.ANALYSIS_PASSWORD);return Response.json({connected:configured,model:configured?process.env.OPENAI_MODEL:null,unlocked:configured&&allowed(request)},{headers:{'Cache-Control':'no-store'}});}
