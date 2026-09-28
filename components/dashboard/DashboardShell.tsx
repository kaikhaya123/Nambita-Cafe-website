'use client'

// Frame around every dashboard page: black header, "Logged in as", and the side menu.

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import RoleAvatar from '@/components/dashboard/RoleAvatar'
import type { StaffRole } from '@/lib/staff-auth'

const navItems: { href: string; label: string; icon: string; managerOnly: boolean }[] = [
  { href: '/dashboard', label: 'Orders', icon: '/Icons/paper-bag.png', managerOnly: false },
  { href: '/dashboard/sales', label: 'Sales', icon:'/Icons/pos.png', managerOnly: false },
  { href: '/dashboard/menu-performance', label: 'Performance', icon: '/Icons/teamwork.png', managerOnly: true },
  { href: '/dashboard/team', label: 'Team', icon: '/Icons/profile.png', managerOnly: true },
]

function NavIcon({ src, onDark }: Readonly<{ src: string; onDark: boolean }>) {
  return (
    <Image
      src={src}
      alt=""
      width={512}
      height={512}
      className={`h-7 w-7 shrink-0 object-contain brightness-0 ${onDark ? 'invert' : ''}`}
    />
  )
}

const HEADER_HEIGHT = 'h-16 sm:h-20'

interface Props {
  role: StaffRole
  staffName: string
  headerRight?: React.ReactNode
  persistentNav?: boolean
  /** Page title shown in the header in place of the logo when the sidebar is visible. */
  title?: string
  children: React.ReactNode
}

export default function DashboardShell({
  role,
  staffName,
  headerRight,
  persistentNav = false,
  title,
  children,
}: Readonly<Props>) {
  const router = useRouter()
  const pathname = usePathname()
  const [isNavOpen, setIsNavOpen] = useState(false)

  useEffect(() => {
    if (!isNavOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isNavOpen])

  async function logout() {
    await fetch('/api/staff/session', { method: 'DELETE' }).catch(() => {})
    router.replace('/nambita-staff-access')
  }

  const items = navItems.filter((item) => role === 'manager' || !item.managerOnly)

  const nav = (
    <nav aria-label="Dashboard" className="flex h-full flex-col gap-1 px-4 pb-4">
      <div className={`${HEADER_HEIGHT} flex shrink-0 items-center px-3`}>
        <Image
          src="/logo/NAMBITA Logo/NambitaL3.png"
          alt="Nambita Cafe"
          width={1920}
          height={960}
          className="h-10 w-auto sm:h-14"
        />
      </div>
      <div className="h-8 shrink-0" aria-hidden />
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsNavOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold uppercase tracking-[0.08em] transition-colors ${
              isActive ? 'bg-brand-yellow text-black-900' : 'text-white'
            }`}
          >
            <NavIcon src={item.icon} onDark={!isActive} />
            {item.label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold uppercase tracking-[0.08em] text-white/60 hover:text-white"
      >
        <NavIcon src="/Icons/turn-off.png" onDark />
        Log Out
      </button>
    </nav>
  )

  return (
    <div className="flex min-h-screen">
      {persistentNav && (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-black-900 lg:block">{nav}</aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 bg-black-900 text-white">
          <div className={`${HEADER_HEIGHT} grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:gap-3 sm:px-6`}>
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsNavOpen(true)}
                aria-label="Open menu"
                aria-expanded={isNavOpen}
                className={`-ml-1 flex h-9 w-9 shrink-0 items-center sm:ml-0 sm:h-10 sm:w-10 justify-center rounded-full hover:bg-white/10 ${
                  persistentNav ? 'lg:hidden' : ''
                }`}
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center">
              {/* With the sidebar showing (large screens) its logo is already visible, so the header
                  shows the page title instead of a second logo. */}
              <Link
                href="/dashboard"
                aria-label="Orders board"
                className={persistentNav && title ? 'lg:hidden' : undefined}
              >
                <Image
                  src="/logo/NAMBITA Logo/NambitaL3.png"
                  alt="Nambita Cafe"
                  width={1920}
                  height={960}
                  priority
                  className="h-10 w-auto sm:h-14"
                />
              </Link>
              {persistentNav && title && (
                <p className="hidden font-teko text-4xl uppercase leading-none tracking-[0.04em] lg:block">{title}</p>
              )}
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
              {headerRight}
              <div className="flex min-w-0 items-center gap-2" title={`Logged in as ${staffName}`}>
                <span className="hidden min-w-0 text-right leading-tight md:block">
                  <span className="block text-[10px] uppercase tracking-[0.12em] text-white/50">Logged in as</span>
                  <span className="block truncate text-sm font-bold">{staffName}</span>
                </span>
                <RoleAvatar role={role} onDark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
                <span className="sr-only md:hidden">Logged in as {staffName}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>

      {isNavOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsNavOpen(false)}
            className="absolute inset-0 bg-black-900/50"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-black-900 shadow-2xl">{nav}</aside>
        </div>
      )}
    </div>
  )
}
