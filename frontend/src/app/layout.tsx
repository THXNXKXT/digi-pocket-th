import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import MobileLayout from '@/components/layout/MobileLayout'
import DesktopHeader from '@/components/layout/DesktopHeader'

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Digi-Pocket Thailand',
  description: 'แพลตฟอร์ม API ตลาดดิจิทัลที่ครบครันสำหรับระบบอีคอมเมิร์ซของประเทศไทย',
  keywords: ['digital marketplace', 'e-commerce', 'thailand', 'digital wallet'],
  authors: [{ name: 'Digi-Pocket Thailand Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Digi-Pocket Thailand',
    description: 'แพลตฟอร์ม API ตลาดดิจิทัลที่ครบครันสำหรับระบบอีคอมเมิร์ซของประเทศไทย',
    type: 'website',
    locale: 'th_TH',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="h-full">
      <body className={`${kanit.className} h-full antialiased bg-gray-50`}>
        <Providers>
          <div className="flex flex-col h-full">
            <DesktopHeader />
            <MobileLayout>
              {children}
            </MobileLayout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
