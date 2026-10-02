// Publishes /manifest.webmanifest: the name, colours and icon used when someone adds the site to their
// phone's home screen. Search engines also read it to understand the site.

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nambita Cafe',
    short_name: 'Nambita',
    description: 'Wings, wors rolls, smoothies and coffee in KwaMashu and Waterloo, Durban. Order online and collect.',
    start_url: '/',
    display: 'standalone',
    // Same values as brand.offwhite and brand.yellow in tailwind.config.js (this file can't use Tailwind classes).
    background_color: '#FAF8F3',
    theme_color: '#FFFF00',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' }],
  }
}
