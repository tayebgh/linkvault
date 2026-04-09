import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'LinkVault'
const appDesc = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Open-source web link sharing library'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linkvault.app'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: `${appName} — ${appDesc}`, template: `%s | ${appName}` },
  description: appDesc,
  keywords: ['links', 'bookmarks', 'web library', 'resources', 'tools', 'open source'],
  authors: [{ name: appName }],
  creator: appName,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: appName,
    title: `${appName} — ${appDesc}`,
    description: appDesc,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: appName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appName} — ${appDesc}`,
    description: appDesc,
    images: ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="bottom-right" theme="dark" richColors />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
