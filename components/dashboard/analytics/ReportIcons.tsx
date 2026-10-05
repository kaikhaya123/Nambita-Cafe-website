// Inline line icons for the dashboard: report tiles, card titles and the order details page.
// They draw in `currentColor`, so they follow the text color, and are hidden from screen readers
// (the label says it all). Drawn for this site, so no licence or credit is needed.

export type ReportIconName =
  | 'receipt'
  | 'banknote'
  | 'bag'
  | 'timer'
  | 'hourglass'
  | 'chart'
  | 'calendar'
  | 'store'
  | 'star'
  | 'grid'
  | 'plus'
  | 'user'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'chef'
  | 'check'

const paths: Record<ReportIconName, React.ReactNode> = {
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  banknote: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  bag: (
    <>
      <path d="M5.5 8h13l-1 12.5h-11L5.5 8Z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 10v3.5l2.5 2M10 2.5h4M18.5 6.5l1.5-1.5" />
    </>
  ),
  hourglass: (
    <>
      <path d="M7 3h10M7 21h10" />
      <path d="M8 3v3.5L12 11l4-4.5V3M8 21v-3.5L12 13l4 4.5V21" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 16v-4M12 16V7M17 16v-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  store: (
    <>
      <path d="M4 10 5.5 4.5h13L20 10H4Z" />
      <path d="M5 10v10h14V10M10 20v-5h4v5" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />,
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  plus: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </>
  ),
  // Person: the customer's name.
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  // Phone handset: the customer's number.
  phone: (
    <path d="M5 3.5h3.5L10 8 7.75 9.5a11 11 0 0 0 6.75 6.75L16 14l4.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5A16 16 0 0 1 3.5 5 1.5 1.5 0 0 1 5 3.5Z" />
  ),
  // Envelope: the customer's email.
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  // Map pin: the branch they collect from.
  pin: (
    <>
      <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  // Chef's hat: the kitchen has started preparing the order.
  chef: (
    <>
      <path d="M7 14.5a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 12 3a5.5 5.5 0 0 1 5.5 3.53A4 4 0 0 1 17 14.5" />
      <path d="M7 14.5V20h10v-5.5M7 17h10" />
    </>
  ),
  // Tick in a circle: done (the customer has collected the order).
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
}

export function ReportIcon({ name, className = 'h-5 w-5' }: Readonly<{ name: ReportIconName; className?: string }>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  )
}
