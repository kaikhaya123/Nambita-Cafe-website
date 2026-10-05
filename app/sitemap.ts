// Publishes the public customer pages at /sitemap.xml so Google and Bing can find them all.
// Staff pages and checkout are left out on purpose: they're hidden from search engines.

import type { MetadataRoute } from 'next'
import { menuImageUrls, seoConfig } from '@/lib/seo'

// The date of the last deploy: tells search engines the pages may have changed since their last visit.
const lastModified = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${seoConfig.siteUrl}${path}`
  const ogImage = url(seoConfig.ogImage)

  return [
    { url: url(''), lastModified, changeFrequency: 'weekly', priority: 1, images: [ogImage] },
    // The menu photos are listed here too, so they can show up in Google Images.
    { url: url('/menu'), lastModified, changeFrequency: 'weekly', priority: 0.9, images: menuImageUrls() },
    { url: url('/map'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/about'), lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/terms'), lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: url('/privacy'), lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
