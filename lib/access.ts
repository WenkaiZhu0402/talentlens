import {createHmac,timingSafeEqual} from 'node:crypto';
export const COOKIE='talentlens_access';
const lifetime=60*60*12;
function sign(value:string,key:string){return createHmac('sha256',key).update(value).digest('base64url');}
function equal(a:string,b:string){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb);}
export function checkPassword(value:string,secret:string){return equal(sign(value,secret),sign(secret,secret));}
export function issueSession(secret:string,now=Date.now()){const expires=String(Math.floor(now/1000)+lifetime);return `${expires}.${sign(expires,secret)}`;}
export function verifySession(value:string,secret:string,now=Date.now()){const [expires,signature,...extra]=value.split('.');if(extra.length||!signature||!/^\d+$/.test(expires))return false;const exp=Number(expires),sec=Math.floor(now/1000);return exp>sec&&exp<=sec+lifetime&&equal(signature,sign(expires,secret));}
export function allowed(request:Request){const secret=process.env.ANALYSIS_PASSWORD;if(!secret)return false;const raw=request.headers.get('cookie')||'';const value=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';return verifySession(value,secret);}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
