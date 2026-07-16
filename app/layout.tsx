import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const _playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

const _notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: '나의 독서 노트',
  description: '읽은 책을 기록하고, 별점을 매기고, 메모를 남기는 개인 독서 노트',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f0e8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body className={`antialiased font-sans ${_playfair.variable} ${_notoSansKr.variable}`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
