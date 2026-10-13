import {z} from 'zod';
import {Role} from './domain';
import {learningSchema,reportSchema} from './analysis';
const resume=z.object({id:z.string(),name:z.string(),text:z.string(),images:z.array(z.string().regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/)).max(15),stage:z.string(),note:z.string(),demo:z.boolean().optional()});
const learning=learningSchema.extend({sourceSignature:z.string(),approved:z.boolean(),demo:z.boolean().optional()});
const report=reportSchema.extend({weights:z.array(z.number().min(0).max(100)).length(6),signature:z.string(),created:z.string(),demo:z.boolean().optional()});
const role=z.object({id:z.string(),name:z.string(),jd:z.string(),requirements:z.string(),hardRules:z.string(),weights:z.array(z.number().min(0).max(100)).length(6),samples:z.array(resume).max(30),learning:learning.nullable(),version:z.number().int().min(1),candidate:resume.nullable(),report:report.nullable(),notes:z.string()});
export function parseBackup(value:unknown):Role[]{const r=z.object({version:z.literal(1),roles:z.array(role).min(1).max(100)}).safeParse(value);if(!r.success)throw new Error('备份格式不正确，请使用“导出全部岗位与材料备份”生成的文件。');return r.data.roles;}
