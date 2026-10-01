// Search box at the top of the /map page.

import { SearchIcon } from '@/components/map/MapIcons'

export default function LocationSearch({
  value,
  onChange,
  onSubmit,
}: Readonly<{
  value: string
  onChange: (value: string) => void
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void
}>) {
  return (
    <div className="bg-black-900 px-5 py-5 sm:px-8">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-white px-5 py-3 transition-shadow focus-within:ring-2 focus-within:ring-brand-yellow">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Your Address"
          aria-label="Search by address or suburb"
          className="w-full bg-transparent text-sm text-black-900 placeholder:text-black-900 focus:outline-none"
          suppressHydrationWarning
        />
        <button type="submit" aria-label="Search" className="text-black-900 transition-opacity hover:opacity-60">
          <SearchIcon />
        </button>
      </form>
    </div>
  )
}
