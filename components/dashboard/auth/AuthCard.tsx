import Image from 'next/image'

// Shared frame and field styles for the login and setup screens.

export const inputClass =
  'mt-2 w-full rounded-lg border border-black-900/30 bg-white px-4 py-3 text-base outline-none focus:border-black-900 focus:ring-2 focus:ring-brand-yellow'

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

export function Select({
  id,
  value,
  onChange,
  placeholder,
  children,
}: Readonly<{ id: string; value: string; onChange: (value: string) => void; placeholder: string; children: React.ReactNode }>) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10 ${value ? 'text-black-900' : 'text-black-900/40'}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-black-900/60"
        fill="currentColor"
      >
        <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
      </svg>
    </div>
  )
}

/** 6-digit authenticator code field; phones offer the number pad and can autofill codes. */
export function CodeInput({
  id,
  value,
  onChange,
  autoFocus = false,
}: Readonly<{ id: string; value: string; onChange: (value: string) => void; autoFocus?: boolean }>) {
  return (
    <input
      id={id}
      autoFocus={autoFocus}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      placeholder="123456"
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
      className={`${inputClass} text-center font-mono text-2xl tracking-[0.4em] placeholder:text-black-900/20`}
    />
  )
}
