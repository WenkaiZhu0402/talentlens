export const dimensions = ['教育背景','实习经历','项目质量','科研论文','奖项证书','岗位与可迁移能力'];
export type Resume = {id:string;name:string;text:string;images:string[];stage:string;note:string;demo?:boolean};
export type Insight = {title:string;count:number;sampleIds:string[];evidence:string;implication:string};
export type Learning = {summary:string;insights:Insight[];paths:string[];conflicts:string[];suggestedWeights:number[];sourceSignature:string;approved:boolean;demo?:boolean};
export type Item = {name:string;score:number|null;confidence:'充分'|'有限'|'不足';evidence:string;reason:string};
export type Report = {weights:number[];candidate:string;summary:string;items:Item[];strengths:string[];gaps:string[];unknowns:string[];transfer:{experience:string;ability:string;reason:string;verify:string}[];questions:string[];opening:string;pitch:string;objections:{concern:string;reply:string}[];hardChecks:{requirement:string;status:string;evidence:string}[];signature:string;created:string;demo?:boolean};
export type Role = {id:string;name:string;jd:string;requirements:string;hardRules:string;weights:number[];samples:Resume[];learning:Learning|null;version:number;candidate:Resume|null;report:Report|null;notes:string};
export const uid=()=>crypto.randomUUID();
export function newRole(name='新岗位'):Role{return {id:uid(),name,jd:'',requirements:'',hardRules:'',weights:[20,25,25,5,5,20],samples:[],learning:null,version:1,candidate:null,report:null,notes:''};}
export function sampleSignature(r:Role){return JSON.stringify([r.name,r.jd,r.requirements,r.hardRules,r.samples.map(s=>[s.id,s.text,s.images,s.stage,s.note])]);}
export function reportSignature(r:Role){return JSON.stringify([r.name,r.jd,r.requirements,r.hardRules,r.weights,r.learning,r.candidate,r.notes]);}
export function scores(items:Item[],weights:number[]){let earned=0,covered=0;items.forEach((v,i)=>{if(v.score!==null){earned+=v.score*weights[i];covered+=weights[i];}});return {score:covered?Math.round(earned/covered):null,coverage:covered,total:weights.reduce((a,b)=>a+b,0)};}
export function validateWeights(w:number[]){return w.length===6&&w.every(x=>Number.isFinite(x)&&x>=0&&x<=100)&&w.reduce((a,b)=>a+b,0)===100;}
