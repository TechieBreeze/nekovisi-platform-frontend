/**
 * Token 桥 — 解开 client.ts ↔ authStore.ts 的循环依赖。
 *
 * - `client.ts` 在请求拦截器里调用 `getAccessToken()` 拿当前 token
 * - `authStore.ts` 在 `setAuth` / `clearAuth` 里调用 `setAccessTokenGetter()`
 *   把读 token 的函数挂到这里
 *
 * 初始值是 null(没登录)。authStore hydrate 之后才会被赋值。
 * 这种"可插拔 getter"模式比直接 import authStore 干净,因为前者会形成
 * authStore ↔ client ↔ authStore 的循环引用。
 */

let getter: () => string | null = () => null

export function setAccessTokenGetter(fn: () => string | null): void {
  getter = fn
}

export function getAccessToken(): string | null {
  return getter()
}
