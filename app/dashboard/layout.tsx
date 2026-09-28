// Wrapper for every /dashboard page. Hides the dashboard from search engines.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders Dashboard | Nambita Cafe',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
  return <div className="min-h-screen bg-brand-offwhite font-dm-sans text-black-900">{children}</div>
}
