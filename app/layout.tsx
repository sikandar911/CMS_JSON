import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import LayoutWrapper from '@/components/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dynamic Blog Site',
  description: 'A modern blog platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* add top padding so fixed header doesn't overlap page content */}
        <LayoutWrapper>
          <div className="pt-20">{children}</div>
        </LayoutWrapper>
      </body>
    </html>
  )
}