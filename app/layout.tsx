// Root layout: wraps every page. Loads the fonts, sets default SEO tags, and shows the Navbar,
// Google Analytics (only after the visitor accepts) and the cookie banner that asks them.
//
// Fonts: every font here is a Google Font under the SIL Open Font License, so it's free for a business
// website. Don't add trial or "personal use" fonts: the live cafe site is commercial use.

import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans, Kaushan_Script, Manrope, Teko } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import CookieBanner from '@/components/layout/CookieBanner'
import { buildPageMetadata, jsonLdScript, seoConfig, siteStructuredData } from '@/lib/seo'

// Brush-script font for the "#ILoveNambita" headline (use the `font-script` class).
const brushScript = Kaushan_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

// DM Sans: the body text font across the site (Tailwind `font-sans` and every paragraph).
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const ncSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nc-serif',
})

const teko = Teko({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-teko',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#111111',
}

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  // The tab icon comes from app/icon.png and the phone home-screen icon from app/apple-icon.png
  // (black logo on brand yellow). Next.js finds them by file name.
  ...buildPageMetadata({
    title: 'Nambita Cafe | Wings, Wors Rolls & Coffee in Durban',
    description:
      'Crispy wings, juicy wors rolls, golden chips and ice-cold smoothies. Order online and collect at Nambita Cafe in KwaMashu or Waterloo, Durban.',
    path: '/',
    keywords: [
      'cafe Durban',
      'cafe near me',
      'wings and chips Durban',
      'wors roll Durban',
      'food KwaMashu',
      'food Waterloo Durban',
      'iced coffee Durban',
      'smoothies Durban',
      'order online collect Durban',
      'nambita cafe menu',
    ],
  }),
  applicationName: 'Nambita Cafe',
  category: 'restaurant',
  // Lets Google show large image previews and full text snippets in search results.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { telephone: false },
  // Proves to Google Search Console that we own the site (adds <meta name="google-site-verification">).
  verification: {
    google: 'Hi5dylKxiOW-NIyKCVa1cCYM8q-2Q2oQBpjBtyFzIrU',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" suppressHydrationWarning className={`${manrope.variable} ${ncSerif.variable} ${brushScript.variable} ${dmSans.variable} ${teko.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Tells Google and Bing about the business and each branch (built in lib/seo.ts). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(siteStructuredData())} />
        <div className="relative pb-[96px] lg:pb-0">
          <Navbar />
          {children}
        </div>
        {/* Visitor stats (public pages on the live site only, after the visitor accepts). See components/layout/GoogleAnalytics.tsx. */}
        <GoogleAnalytics />
        <CookieBanner />
      </body>
    </html>
  )
}
