import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'DS的设计工作台',
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
        <div className="flex flex-col md:flex-row h-screen bg-gemini-bg">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-gemini-bg">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
