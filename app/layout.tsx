import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'CostRadar — Are you overpaying for AI tools?',
    template: '%s | CostRadar',
  },
  description:
    'Free audit for startup teams. Enter your AI tools and plans — get an instant breakdown of where you\'re overspending and how much you could save.',
  openGraph: {
    type: 'website',
    siteName: 'CostRadar',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
