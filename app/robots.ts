// Publishes /robots.txt: tells search engines (Google, Bing, …) what they may crawl and where the sitemap is.
// The staff pages aren't listed here (that would advertise their addresses); they hide themselves
// with a "noindex" tag in their own layout.tsx instead.

import type { MetadataRoute } from 'next'
import { seoConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Server code, not pages.
      disallow: '/api/',
    },
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
    host: seoConfig.siteUrl,
  }
}
