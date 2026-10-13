import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'TalentLens · 招聘洞察工作台',description:'从经历看见能力，让每一次招聘判断都有依据。'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>;}
