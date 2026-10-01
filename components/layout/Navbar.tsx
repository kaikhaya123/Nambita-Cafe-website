'use client'

// Top navigation bar for public pages, plus the mobile bottom bar and slide-up menu.
// Hidden on the staff dashboard and login pages, which have their own header.

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'
import { openCartDrawer } from '@/lib/cart-drawer'
import CartDrawer from '@/components/menu/CartDrawer'

const findCafeLink = { name: 'Find Nambita Cafe', href: '/map' } as const

const primaryNavLinks = [
  { name: 'Menu', href: '/menu' },
  { name: 'Our Story', href: '/about' },
  findCafeLink
] as const

// Nav links use the same font style as the site headings (Teko, bold, uppercase).
// Teko is a narrow font, so it needs a bigger size than a normal font to read at the same width.
const navLinkClass =
  'font-teko font-bold text-lg uppercase leading-none tracking-[0.05em] text-black-900 transition-opacity duration-200 hover:opacity-60'

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuActive, setIsMenuActive] = useState(false)
  const { cart } = useCart()
  const cartCount = cart.length

  useEffect(() => {
    if (!isMenuActive) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuActive(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuActive])

  // The staff dashboard has its own header.
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/nambita-staff-access')) return null

  return (
    <>
    <header className="sticky top-0 z-[85] flex h-20 w-full items-center bg-brand-yellow px-[clamp(0.75rem,3vw,2rem)] shadow-[0_1px_0_rgba(0,0,0,0.08)] sm:h-24 lg:grid lg:grid-cols-[1fr_auto_1fr]">
      <div className="flex items-center gap-3 text-white sm:gap-4">
        <nav className="hidden items-center gap-7 lg:ml-4 lg:flex">
          {primaryNavLinks
            .filter((item) => item !== findCafeLink)
            .map((item) => (
              <Link key={item.name} href={item.href} className={navLinkClass}>
                {item.name}
              </Link>
            ))}
        </nav>
      </div>

      <Link href="/" aria-label="Nambita Cafe home" className="inline-flex items-center lg:col-start-2 lg:justify-self-center">
        <Image
          src="/logo/NAMBITA Logo/NambitaL2.png"
          alt="Nambita Cafe"
          width={140}
          height={140}
          priority
          sizes="(max-width: 640px) 96px, 140px"
          className="h-14 w-auto object-contain sm:h-16"
        />
      </Link>

      <div className="ml-auto flex items-center justify-end gap-4 lg:ml-0 lg:col-start-3">
        <Link href={findCafeLink.href} className={`hidden lg:mr-3 lg:inline ${navLinkClass}`}>
          {findCafeLink.name}
        </Link>

        <button
          type="button"
          onClick={openCartDrawer}
          aria-label="View order"
          className="relative flex h-14 w-14 items-center justify-center text-black-900 sm:h-16 sm:w-16"
        >
          <Image src="/Icons/shopping-cart.png" alt="" width={40} height={40} className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
          {cartCount > 0 && (
            <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-black-900 px-1 font-dm-sans text-xs font-bold leading-none text-white">
              {cartCount}
            </span>
          )}
        </button>

        <Link
          href="/menu"
          className="btn hidden border border-black-900 bg-black-900 text-white hover:bg-transparent hover:text-black-900 lg:inline-flex"
        >
          Order Now
        </Link>
      </div>

      <AnimatePresence>
        {isMenuActive && (
          <motion.nav
            id="nambita-mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-white px-8 pb-28 pt-6 sm:px-12 sm:pt-8 lg:hidden"
          >
            <div className="flex items-center justify-center">
              <Link href="/" aria-label="Nambita Cafe home" onClick={() => setIsMenuActive(false)} className="inline-flex items-center">
                <Image
                  src="/logo/NAMBITA Logo/NambitaL4.webp"
                  alt="Nambita Cafe"
                  width={200}
                  height={200}
                  sizes="192px"
                  className="h-20 w-auto object-contain sm:h-24"
                />
              </Link>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <ul className="flex w-full flex-col items-start">
                {primaryNavLinks.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full border-b border-black/10"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuActive(false)}
                      className="flex min-h-[52px] items-center font-teko font-bold text-3xl uppercase leading-none tracking-[0.03em] text-black-900 transition-opacity duration-200 hover:opacity-60 sm:text-4xl"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>

    <div className="fixed inset-x-0 bottom-0 z-[90] flex items-center justify-between gap-4 border-t border-brand-yellow bg-brand-yellow px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.18)] lg:hidden">
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={isMenuActive}
        aria-controls="nambita-mobile-menu"
        onClick={() => setIsMenuActive((current) => !current)}
        className={`nambita-menu-toggle text-black-900${isMenuActive ? ' active' : ''}`}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <Link
        href="/menu"
        className="btn btn-sm border border-black-900 bg-black-900 text-white hover:bg-transparent hover:text-black-900 sm:h-12 sm:px-6 sm:text-lg"
      >
        Order Now
      </Link>
    </div>

    <CartDrawer />
    </>
  )
}
