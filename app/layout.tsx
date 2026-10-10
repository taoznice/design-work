import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project Showcase',
  description: 'A personal portfolio for experience design, AI tools, and digital product practice.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      style={{
        '--font-body': "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, sans-serif",
        '--font-display': "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, sans-serif",
      } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  )
}
