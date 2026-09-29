// Site footer shown at the bottom of every public page: logo, links, branch addresses, socials.

import Image from 'next/image'
import Link from 'next/link'
import { cafeLocations, directionsHref } from '@/lib/cafe-locations'

const exploreLinks = [
  { name: 'Home', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'Our Story', href: '/about' },
  { name: 'Find Nambita Cafe', href: '/map' },
]

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/nambitacafe/', icon: '/Icons/instagram (3).png' },
  { name: 'Facebook', href: 'https://www.instagram.com/nambitacafe/', icon: '/Icons/facebook-app-symbol (2).png' },
  { name: 'TikTok', href: 'https://www.instagram.com/nambitacafe/', icon: '/Icons/tik-tok (1).webp' },
]

// Every column heading and list shares these styles, so the columns line up and look the same.
const headingClass = 'font-hagrid text-sm uppercase tracking-[0.14em] text-white'
const linkClass = 'font-dm-sans text-sm text-white/80 transition-colors duration-300 hover:text-brand-caramel'

export default function Footer() {
  return (
    <footer id="footer-contact" className="relative bg-black-900 text-white">
      {/* Layout: phone = one column, tablet = logo on its own row then 3 columns,
          desktop = logo + 3 columns in one row, with the logo as tall as the tallest column ("Visit Us"). */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-3 sm:px-10 lg:grid-cols-[auto_1fr_1fr_1fr] lg:gap-12">
        <div className="sm:col-span-3 lg:col-span-1">
          {/* NambitaL4-trim.webp is the logo with its empty border cut off, so its height is the real logo height. */}
          <Image
            src="/logo/NAMBITA Logo/NambitaL4-trim.webp"
            alt="Nambita Cafe logo"
            width={1665}
            height={735}
            sizes="(min-width: 1280px) 430px, 340px"
            className="h-24 w-auto object-contain sm:h-28 lg:h-[150px] xl:h-[188px]"
          />
        </div>

        <div>
          <p className={headingClass}>Explore</p>
          <ul className="mt-4 space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className={linkClass}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={headingClass}>Visit Us</p>
          <ul className="mt-4 space-y-4">
            {cafeLocations.map((location) => (
              <li key={location.id}>
                {/* Branch name on its own line, then the address split over two short lines. */}
                <a href={directionsHref(location)} target="_blank" rel="noreferrer" className={`group block leading-relaxed ${linkClass}`}>
                  <span className="block font-dm-sans-bold text-white group-hover:text-brand-caramel">{location.name}</span>
                  <span className="block">{location.addressLine1}</span>
                  <span className="block">{location.addressLine2}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={headingClass}>Social Media</p>
          <ul className="mt-4 space-y-3">
            {socialLinks.map((social) => (
              <li key={social.name}>
                <a href={social.href} target="_blank" rel="noreferrer" className={`flex items-center gap-2 ${linkClass}`}>
                  <Image src={social.icon} alt="" width={16} height={16} aria-hidden="true" className="h-4 w-4 object-contain" />
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright strip. Extra bottom padding below `lg` so the fixed yellow "Order Now" bar doesn't cover it. */}
      <div className="px-6 pb-24 pt-6 sm:px-10 lg:pb-6">
        <p className="mx-auto max-w-7xl text-center text-xs tracking-[0.02em] text-white sm:text-sm">
          © 2026 Nambita Cafe. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
