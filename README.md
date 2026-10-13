# TalentLens · 招聘洞察工作台

基于岗位要求与合格简历样本的招聘分析工具。使用 Codex 开发，标准 Next.js 项目，可部署到 Vercel。页面不要求登录 ChatGPT。

> 部署状态：待关联 GitHub 仓库和 Vercel 工作空间。部署后将下方占位文字替换为 Vercel 返回的正式网址。
>
> 在线使用：**待部署**

## 功能

- 多岗位 JD、业务偏好、硬性条件及六维权重管理。
- PDF、DOCX、PNG/JPG/WEBP、TXT 简历导入；扫描页通过模型视觉读取。
- 合格简历库与共性提炼；人工确认后应用标准。
- 教育、实习、项目、论文、奖项、可迁移能力六维评分；展示依据、未知项和硬性条件。
- 电话核实问题、建联和岗位沟通话术。
- IndexedDB 本地保存，JSON 备份导入导出；同名 ID 恢复时创建副本，保留现有岗位。
- 明确标注的虚构 Demo；无模型配置时真实材料不会获得伪造评分。

## 一次性部署

1. 在自己的 GitHub 账户新建 `talentlens` 仓库（建议 Private），初始化 README。
2. 上传本目录的全部项目文件，包含 `package.json`、`package-lock.json`、`app`、`lib`、`scripts`、`public` 等。不要上传真实简历、密钥或 node_modules。
3. Vercel 中选择 **Add New → Project**，导入该 GitHub 仓库。
4. Framework 使用 **Next.js**；Root Directory 使用仓库根目录；安装命令 `npm ci`，构建命令 `npm run build`。
5. 无需环境变量即可部署示例及手动任务流程。部署成功后，将 production URL 放到此 README 和 GitHub 仓库 About 的 Website。
6. 若正式网址仍要求 Vercel 登录，检查项目 Deployment Protection，按自己的公开访问意图允许生产网址访问；不需要 ChatGPT 登录。

如果 Vercel 连接返回 `403 forbidden`，说明当前连接无权访问所选工作空间。需在账户侧检查应用授权和工作空间范围，或由账户所有者直接在 Vercel Dashboard 导入仓库。更换代码无法解决此权限问题。

## 可选：启用自动 AI 分析

在 Vercel 项目的环境变量设置中配置以下服务端变量，然后重新部署：

| 变量 | 用途 |
| --- | --- |
| `OPENAI_API_KEY` | 有权调用所选模型的 API 密钥 |
| `OPENAI_MODEL` | 支持 Responses API、图像输入和严格 JSON Schema 的模型 ID |
| `ANALYSIS_PASSWORD` | 自设的强随机分析访问密码，建议至少 24 字符 |

不要把密钥或密码提交到 GitHub，不要加 `NEXT_PUBLIC_` 前缀。本仓库仅包含无值的 `.env.example`。

自动分析就绪后，在网页“模型与数据设置”输入独立访问密码，解锁 12 小时的分析权限。页面本身始终可打开。密钥只在服务端使用；访问密码通过 HttpOnly、SameSite cookie 建立会话。当前未配置真实凭据，也未验证实时模型调用。

本版本没有接入 ChatGPT 套餐额度授权，独立模型服务费用由所配置的服务决定。个人密码保护不替代正式多用户系统；扩大使用范围前应增加持久限流、账户管理和预算控制。

## 无需 API 的对话分析流程

新建岗位 → 填 JD → 上传合格样本 → 导出样本学习任务 JSON → 发给现有 ChatGPT 对话并要求按指定格式生成结果 JSON → 导入结果并确认共性 → 上传候选人 → 导出评估任务 → 导入评估结果。

导入结果会校验 SHA-256 材料指纹、字段格式、样本引用和权重。如修改了材料，应重新导出任务。任务中的图片以 base64 保存；如对话无法读取，应同时提供原图，不能忽略图片评分。

## 从旧站迁移个人数据

在旧站“模型与数据设置”导出全部岗位备份；在新站同一位置选择“导入旧站备份”。数据默认按网站域名保存在自己的浏览器，不会随部署自动同步，不进入 GitHub 仓库。

## 本地开发与验证

需要 Node.js 22.13 或更新版本。

```bash
npm ci
npm run dev
```

首次开发前执行 `node scripts/copy-pdf-assets.mjs` 以准备 PDF worker 与字体；生产 `npm run build` 会自动执行。

```bash
npm run typecheck
npm test
npm run build
npm start
```

API 路由：`GET /api/status`、`POST /api/session`、`DELETE /api/session`、`POST /api/analyze`。

## 范围与限制

- 旧版 `.doc` 需另存为 DOCX 或 PDF；单文件 ≤8MB，PDF ≤15页。
- 每个岗位最多30份合格样本；自动 API 请求控制在4MB内，较大材料可使用对话任务导出。
- 缺少信息返回“待确认”，综合分按已有证据维度归一化，并展示覆盖权重；分数不是录用概率。
- 院校排名、公司规模、期刊等级和奖项等级未接外部核验服务，未知项应保留待核实。
- 自动分析接口已实现，但生产权限、真实凭据和完整浏览器/真实模型端到端验证尚待完成。
