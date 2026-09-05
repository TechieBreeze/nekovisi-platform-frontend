/**
 * 4 角色 RBAC — 1:1 镜像后端 `Role` 枚举。
 *
 * MVP 阶段 AuthController 给每个登录用户硬编码 SUPER_ADMIN;
 * 真正的角色绑定等后端 RBAC 完善后启用。
 *
 * 角色层级:SUPER_ADMIN > TEAM_LEADER > MEMBER > GUEST
 * `hasAtLeastRole` 用这个层级做"至少需要某个角色"的判断。
 */
export type Role = 'SUPER_ADMIN' | 'TEAM_LEADER' | 'MEMBER' | 'GUEST'

const ROLE_RANK: Record<Role, number> = {
  GUEST: 0,
  MEMBER: 1,
  TEAM_LEADER: 2,
  SUPER_ADMIN: 3,
}

/**
 * `actual` 是否"至少达到" `required` 等级。admin 路由默认 required = SUPER_ADMIN。
 */
export function hasAtLeastRole(actual: Role | undefined, required: Role): boolean {
  if (!actual) return false
  return ROLE_RANK[actual] >= ROLE_RANK[required]
}

/**
 * 角色显示名(中文)。后端目前没有 Role 字典表,前端自己维护一份。
 */
export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: '超级管理员',
  TEAM_LEADER: '队长',
  MEMBER: '队员',
  GUEST: '访客',
}
