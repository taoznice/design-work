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
    <html lang="en" style={{ '--font-body': "'Inter', sans-serif", '--font-display': "'Instrument Serif', serif" } as React.CSSProperties}>
      <body>{children}</body>
    </html>
  )
}
