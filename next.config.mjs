import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

// Content-Security-Policy: the list of places the browser may load scripts, styles, images, etc. from.
// Almost everything this site loads comes from itself ('self'). Fonts are bundled by next/font, Yoco payment
// happens on Yoco's own page, and Resend is only called from the server. The one outside site is Google
// Analytics (components/layout/GoogleAnalytics.tsx), which needs the Google addresses below.
// 'unsafe-inline' is needed because Next.js adds small inline scripts; 'unsafe-eval' is only for `npm run dev`.
const googleAnalytics = {
  script: 'https://*.googletagmanager.com',
  connect: 'https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com',
  img: 'https://*.google-analytics.com https://*.googletagmanager.com',
}

const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${googleAnalytics.script};
  connect-src 'self' ${googleAnalytics.connect};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: ${googleAnalytics.img};
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, ' ')
  .trim()

// Sent with every page and API response.
const securityHeaders = [
  // Nobody may show this site inside a frame on their own site (stops "clickjacking").
  { key: 'X-Frame-Options', value: 'DENY' },
  // Browsers must trust the file type we send instead of guessing (stops files being run as code).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Other sites only see "nambitacafe.co.za" when a customer clicks a link, not the full page address.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Turn off phone/computer features the site never uses. Location stays on for the /map "Share Location" button.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()' },
  // REPORT-ONLY for now: the browser doesn't block anything, it only prints a warning in the console
  // when something breaks the policy. Once checkout has been tested with no warnings, change the key
  // to 'Content-Security-Policy' to switch it on for real.
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/Images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/Video/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/Icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
}

export default nextConfig
