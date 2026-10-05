import Image from 'next/image'

// Shared frame and field styles for the login screen.

export const inputClass =
  'mt-2 w-full rounded-lg border border-black-900/50 bg-white px-4 py-3 text-base outline-none focus:border-black-900 focus:ring-1 focus:ring-black-900'

export const labelClass = 'mt-4 block text-xs font-bold uppercase tracking-[0.12em]'

export const primaryButtonClass =
  'mt-6 w-full rounded-full bg-black-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity disabled:opacity-40'

export function AuthCard({
  title,
  children,
  onSubmit,
}: Readonly<{ title: string; children: React.ReactNode; onSubmit: (event: React.FormEvent) => void }>) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-black-900 bg-white p-8 shadow-[6px_6px_0_#111]"
      >
        <div className="flex justify-center">
          <Image src="/logo/NAMBITA Logo/NambitaL2.png" alt="Nambita Cafe" width={120} height={60} className="h-auto w-28" />
        </div>
        <h1 className="mt-6 text-center font-teko text-3xl uppercase tracking-[0.03em]">{title}</h1>
        {children}
      </form>
    </main>
  )
}

export function FormError({ message }: Readonly<{ message: string | null }>) {
  if (!message) return null
  return (
    <p role="alert" className="mt-3 text-sm font-bold text-red-700">
      {message}
    </p>
  )
}
