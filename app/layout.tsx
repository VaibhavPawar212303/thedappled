import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-providers'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SITE_URL } from '@/lib/seo'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'The Dappled (TheDappled) – E-Learning Platform for Developers',
    template: '%s | TheDappled',
  },
  description:
    'The Dappled (TheDappled) is an e-learning platform for developers: step-by-step courses, books and articles, plus a free C compiler visualizer that shows the stack and heap as your code runs.',
  applicationName: 'TheDappled',
  keywords: ['TheDappled', 'The Dappled', 'learn programming', 'developer courses', 'C memory visualizer', 'stack and heap'],
  openGraph: {
    type: 'website',
    siteName: 'TheDappled',
    locale: 'en_US',
  },
  twitter: {
    images: ['/opengraph-image'],
    card: 'summary_large_image',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'TheDappled',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
      },
      sameAs: [
        'https://www.instagram.com/thedappled_/',
        'https://github.com/VaibhavPawar212303',
        'https://c-architech-compiler.vercel.app',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'TheDappled',
      alternateName: ['The Dappled', 'Dappled', 'thedappled.com'],
      url: SITE_URL,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <NextTopLoader color="#2563eb" showSpinner={false} height={3} />
            <ToastProvider />
            <main className="h-full">
              {children}
            </main>
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}