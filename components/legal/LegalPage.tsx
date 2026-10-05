// Shared layout for the legal pages (/privacy and /terms): title, "last updated" date, readable text and the footer.

import Footer from '@/components/layout/Footer'

export default function LegalPage({
  title,
  updated,
  children,
}: Readonly<{ title: string; updated: string; children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-brand-offwhite text-black-900">
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="font-teko text-4xl uppercase leading-none tracking-[0.03em] sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-black-900/60">Last updated {updated}</p>
        <div className="mt-10 space-y-10 text-[0.95rem] leading-7 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

/** One numbered part of a legal page, e.g. "3. Who we share it with". `id` lets other pages link straight to it. */
export function LegalSection({ id, title, children }: Readonly<{ id?: string; title: string; children: React.ReactNode }>) {
  return (
    <section id={id} className="scroll-mt-28 space-y-3">
      <h2 className="font-teko text-2xl uppercase leading-tight tracking-[0.03em]">{title}</h2>
      {children}
    </section>
  )
}
