'use client'

import Image from 'next/image'
import Link from 'next/link'

const footerLocations = [
  { title: 'Nambita Cafe KwaMashu', addressLine1: '206 Bhenjane Rd', addressLine2: 'KwaMashu, 4051' },
  { title: 'Nambita Cafe Waterloo', addressLine1: '346 Pricklepear Rd', addressLine2: 'Waterloo, Blackburn, 4319' },
]

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

function footerDirectionsHref(location: (typeof footerLocations)[number]) {
  const query = `${location.title}, ${location.addressLine1}, ${location.addressLine2}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function Footer() {
  return (
    <footer id="footer-contact" className="relative text-white">
      <div className="w-full bg-black-900 px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/logo/NAMBITA Logo/NambitaL4.webp"
              alt="Nambita Cafe logo"
              width={140}
              height={140}
              className="h-auto w-28 object-contain sm:w-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            <div>
              <p className="font-hagrid text-sm uppercase tracking-[0.14em] text-white">Explore</p>
              <ul className="mt-4 space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="font-dm-sans text-sm text-white/80 transition-colors duration-300 hover:text-[#C98A2B]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-hagrid text-sm uppercase tracking-[0.14em] text-white">Visit Us</p>
              <ul className="mt-4 space-y-4">
                {footerLocations.map((location) => (
                  <li key={location.title}>
                    <a
                      href={footerDirectionsHref(location)}
                      target="_blank"
                      rel="noreferrer"
                      className="group font-dm-sans text-sm text-white/80 transition-colors duration-300 hover:text-[#C98A2B]"
                    >
                      <span className="block font-dm-sans-bold text-white/90 group-hover:text-[#C98A2B]">{location.title}</span>
                      {location.addressLine1}, {location.addressLine2}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-hagrid text-sm uppercase tracking-[0.14em] text-white">Social Media</p>
              <ul className="mt-4 space-y-3">
                {socialLinks.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-dm-sans text-sm text-white/80 transition-colors duration-300 hover:text-[#C98A2B]"
                    >
                      <Image src={social.icon} alt="" width={16} height={16} aria-hidden="true" className="h-4 w-4 object-contain" />
                      {social.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-0 w-full border-t border-white/15 bg-white/10 px-6 py-6 backdrop-blur-sm sm:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <p className="text-xs tracking-[0.02em] text-black-900 sm:text-sm">© 2026 Nambita Cafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
