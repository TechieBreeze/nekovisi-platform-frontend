import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

/**
 * 全局事件桥 — 监听 `nekovisi:auth:cleared`(401 handler 派发),
 * 提示用户并把页面踢回登录页。
 *
 * 为什么不直接 navigate?
 *   queryClient 在 platform 层,不应依赖 react-router。
 *   解耦方式:queryClient 派发自定义 DOM 事件,Router 层在这里订阅。
 */
export default function AuthEventBridge() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => {
      toast.warning('登录已过期,请重新登录')
      navigate('/login', { replace: true })
    }
    window.addEventListener('nekovisi:auth:cleared', handler)
    return () => window.removeEventListener('nekovisi:auth:cleared', handler)
  }, [navigate])

  return null
}
