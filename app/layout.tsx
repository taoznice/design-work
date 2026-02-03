import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: '工作台',
  description: '设计管理工作台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex flex-col sm:flex-row h-screen bg-gemini-bg">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-gemini-bg pb-20 sm:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
