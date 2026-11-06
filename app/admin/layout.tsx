import { notFound } from 'next/navigation'
import AdminShell from './shell'

/**
 * 管理后台仅本地可用：线上（Vercel）访问 /admin 一律 404
 * CMS 的内容保存在仓库文件里，本地编辑 → 推送 → 线上自动更新
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (process.env.VERCEL) notFound()

  return <AdminShell>{children}</AdminShell>
}
