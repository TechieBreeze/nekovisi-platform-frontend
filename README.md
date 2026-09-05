# Nekovisi · 集训队综合平台 — 前端

东华大学 ACM 集训队综合管理平台的前端 MVP。**当前范围**:登录 + 赛事管理后台(`/admin/contests/*`)。

> 平台主仓库:见 workspace 根 `D:/agent-workspace/Claude Code/ContestHelper/CLAUDE.md`。
> 后端:`nekovisi-platform-backend/`(Spring Boot 3.3.5,端口 8080)。

---

## 技术栈

- **Vite 8** + **React 19** + **TypeScript 6**(strict mode)
- **Tailwind CSS v4** + **shadcn/ui**(radix-nova 预设)
- **Axios** + **TanStack Query 5**(server state)
- **Zustand 5**(client state,token + user)
- **React Hook Form + Zod 4**(表单)
- **React Router 7**(路由)
- **dayjs**(日期;后端 `OffsetDateTime` ↔ 表单 `datetime-local`)

## 启动 5 步

```bash
# 1. 装依赖
pnpm install

# 2. 配置环境变量(可选,默认连 localhost:8080)
cp .env.example .env.local
# 编辑 .env.local 改 VITE_API_BASE_URL

# 3. 确认后端在 8080 跑通
cd ../nekovisi-platform-backend
docker compose --env-file .env.docker up -d --build backend

# 4. 起前端 dev server
cd ../nekovisi-platform-frontend
pnpm dev
# → http://127.0.0.1:5173

# 5. 用 admin/admin123 登录(MVP 默认账户,见后端 seed)
```

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | 后端 API 根地址 |

`.env.local` 已 gitignore。生产部署用 `docker build --build-arg VITE_API_BASE_URL=...` 注入。

## 目录结构

```
src/
├── main.tsx             入口;Provider 链 + hydrate auth
├── App.tsx              路由表
├── styles/              全局 CSS + 设计 token
├── shared/              跨模块类型 / 工具
├── platform/            横切能力(auth / api / layout / ErrorBoundary)
└── modules/
    ├── auth/            登录
    └── contest/         赛事管理(MVP 唯一业务模块)
```

详细约定见 [CLAUDE.md](./CLAUDE.md)。

## 与后端集成的 5 个要点

1. **CORS** — 后端 SecurityConfig 默认允许 `http://localhost:*` 和 `http://127.0.0.1:*`,
   Vite 默认 5173 直接通;生产部署换 nginx 反代时收紧 origin 白名单。
2. **JWT** — localStorage 存 `accessToken` / `refreshToken`,请求拦截器自动挂 `Authorization: Bearer`。
3. **响应信封** — `ApiResponse<T>`(`@JsonInclude(NON_NULL)`),拦截器自动解 `data` 字段,失败 throw `ApiError`。
4. **分页** — 后端 `page` 从 1 开始,`size` clamp 到 [1, 100];前端照搬。
5. **错误码** — `ApiError.code` 严格对齐后端 `BusinessException` 系列(见 `src/shared/types/error.ts`)。

## 路由分流

```
/login                                  公开
/admin (RequireRole SUPER_ADMIN)
  ├─ /contests                          列表 + 筛选 + 分页
  ├─ /contests/new                      创建
  ├─ /contests/:id                      详情 + 状态机
  └─ /contests/:id/edit                 编辑
```

## Docker

```bash
# 构建(用 build-arg 注入 API 地址)
docker build -f Dockerfile.frontend \
  -t nekovisi/nekovisi-frontend:latest \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  .

# 运行(non-root 用户 nekovisi,nginx 监听 8080)
docker run -d -p 8080:8080 --name nekovisi-frontend nekovisi/nekovisi-frontend:latest
```

镜像内部:npm install → vite build → nginx:alpine serve;`/healthz` 健康检查可用。

## 安全债(MVP 接受,生产前必改)

- [ ] localStorage JWT → httpOnly cookie + SameSite=Lax
- [ ] 加 CSP / SRI(nginx 层)
- [ ] Refresh token 过期检测 + 自动续签
- [ ] 后端 RBAC 上线后,移除 MVP 硬编码 `SUPER_ADMIN`

## 排错

遇到任何坑(类型报错、运行时崩、CSS 不渲染、CORS …)请:

1. 在 `docs/troubleshooting/YYYY-MM-DD-<slug>.md` 落一份记录
2. 触发关键词:踩坑 / 报错 / bug / fix / 修复 / 问题 / 复盘 / postmortem / troubleshoot
3. 模板见 `docs/troubleshooting/README.md`,完整流程走 `.claude/skills/nekovisi-troubleshooting/SKILL.md`

## 许可证

暂未确定(项目内部使用)。
