# Nekovisi 前端 — Claude 项目指南

> 这是 `nekovisi-platform-frontend` 仓库的 Claude 速览文件。
> 工作区根 `D:/agent-workspace/Claude Code/ContestHelper/CLAUDE.md` 是更高层级的总指南,
> 本文件只谈本仓库内部的约定。

---

## 0. ⚠️ Git 操作规约(最高优先级)

> **这一节优先级高于本文件其他任何章节。** Claude 在本项目里执行 git 操作必须严格遵守。

### 0.1 铁律:未经用户明确同意,不得 commit 或 push

- ❌ **禁止**:`git commit` / `git push` 在用户没有就这次具体操作明确说"提交"/"推送"/"commit"/"push"/"OK"或等价肯定之前执行
- ❌ **禁止**:把"用户让我开始做某任务"理解为"用户授权我 commit 该任务的产物"
- ✅ **必须**:每次 commit / push 之前,先用一句话陈述"我打算 commit 哪些文件、commit message 是什么",等用户点头
- ✅ **可豁免**:用户在同一回合明确说"提交并推送"/"提交这条"/"push 上去"等动词指令,只对该次操作生效;下一次操作仍需再次确认

### 0.2 Commit 命名规范(Conventional Commits)

格式:`<type>(<scope>): <subject>`。`<scope>` 可选,小写模块名。
允许的 type:feat | fix | refactor | docs | test | chore | perf | ci。
`<subject>` 祈使句、现在时、首字母不大写、末尾无句号、≤ 50 字符。

**示例**:
```
feat(contest): add contest admin CRUD pages
fix(auth): hydrate auth before rendering routes
docs: add CLAUDE.md
chore: bump tailwind to 4.3.3
```

### 0.3 原子性 — 一个 commit 只做一件事

不要把无关改动塞进来。如果改动跨越多个逻辑主题,**分多个 commit**,即使它们在同一轮工作里完成。

### 0.4 不要做的事

- ❌ 不要在 commit message 加 `Co-Authored-By:` 归属(用户全局关了)
- ❌ 不要 force push 到默认分支
- ❌ 不要 amend 已经 push 过的 commit
- ❌ 不要把 `dist/`、`node_modules/`、`.env.local`、`*.log` 提交进去(`.gitignore` 已管)

---

## 1. 仓库范围

| 项 | 值 |
|---|---|
| 中文名 | 东华大学ACM集训队综合平台 — 前端 |
| 仓库 | https://github.com/TechieBreeze/nekovisi-platform-frontend |
| 技术栈 | Vite 8 + React 19 + TypeScript 6 + Tailwind CSS v4 + shadcn/ui |
| 状态 | MVP — 仅登录 + 赛事管理后台(`/admin/*`) |
| 后端依赖 | `nekovisi-platform-backend/`(同 workspace,Spring Boot 3.3.5) |

## 2. 目录布局

```
src/
├── main.tsx                   入口;Provider 链 + hydrate auth
├── App.tsx                    路由表 + ErrorBoundary + Toaster
├── styles/                    tokens.css + globals.css
├── shared/                    跨模块共享
│   ├── types/                 api / role / error
│   └── utils/                 duration / datetime
├── platform/                  横切能力(无业务语义)
│   ├── auth/                  store / useAuth / RequireAuth / RequireRole / authApi
│   ├── api/                   client (Axios) / errors / queryClient
│   ├── components/            ErrorBoundary
│   └── layout/                AdminLayout / Sidebar / Topbar
└── modules/
    ├── auth/                  登录
    │   ├── pages/LoginPage.tsx
    │   ├── components/LoginForm.tsx
    │   └── schemas/loginSchema.ts
    └── contest/               赛事管理(本仓库唯一业务模块)
        ├── api/contests.ts
        ├── hooks/useContests.ts
        ├── schemas/contestSchema.ts
        ├── types/contest.ts
        ├── components/        ContestTable / ContestForm / ContestStatusBadge
        │                       ContestStatusActions / DurationField
        └── pages/             ContestListPage / ContestCreatePage
                                ContestDetailPage / ContestEditPage
```

## 3. 与后端契约

| 项 | 值 |
|---|---|
| API 基础 URL | `VITE_API_BASE_URL`(默认 `http://localhost:8080`) |
| 鉴权 | `Authorization: Bearer <accessToken>`,token 存 localStorage |
| 响应信封 | `{ success, code, message, data?, requestId? }`,`@JsonInclude(NON_NULL)` |
| 分页 | `{ items, total, page, size }`,**page 从 1 开始**,size clamp [1, 100] |
| 错误码 | `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `CONFLICT` / `INVALID_STATE_TRANSITION` / `VALIDATION_ERROR` / `BAD_REQUEST` / `INTERNAL_ERROR` |
| 角色 | MVP 后端硬编码 `SUPER_ADMIN`;前端 `RequireRole` 守卫留壳 |

**关键设计**:
- Duration 字段统一存 `Long seconds`,DTO 用 ISO-8601 字符串(`PT5H`)
- JSONB 字段(medalConfigJson / exportFieldsJson)按字符串原文展示,前端不解析编辑
- 状态机 7 态:`PLANNING → READY → RUNNING → FROZEN → ENDED → ARCHIVING → ARCHIVED`
- 非法状态转移后端抛 `INVALID_STATE_TRANSITION`(409),前端 `canTransitTo` 预校验减少 409

## 4. 启动

```bash
# 安装依赖
pnpm install

# 起 dev server(5173)
pnpm dev

# 生产构建
pnpm build

# 类型检查
pnpm tsc --noEmit --pretty false

# Docker 构建 + 启动
docker build -f Dockerfile.frontend -t nekovisi/nekovisi-frontend:latest \
  --build-arg VITE_API_BASE_URL=https://api.example.com .
docker run -d -p 8080:8080 nekovisi/nekovisi-frontend:latest
```

环境变量:复制 `.env.example` 为 `.env.local` 后修改。`.env.local` 已 gitignore。

## 5. 已知安全债(MVP 接受)

- localStorage 存 JWT — XSS 偷 token 风险;生产换 httpOnly cookie
- 无 refresh 过期检测 — refresh 失败时才被踢回登录
- 无 CSP / SRI — 生产部署时由 nginx 注入

## 6. 排错

**任何踩坑必写 troubleshooting** → `.claude/skills/nekovisi-troubleshooting/SKILL.md` 有完整流程。

模板:`docs/troubleshooting/README.md`。

---

最后更新:2026-09-05(MVP v0.1.0 首次落地)
