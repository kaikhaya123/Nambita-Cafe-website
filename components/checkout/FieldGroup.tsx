// Checkout: a labelled group of form fields (e.g. "Contact Info").

export default function FieldGroup({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-4 border-t border-black/10 pt-6 first:border-t-0 first:pt-0">
      <span className="font-dm-sans text-[0.65rem] font-bold uppercase tracking-[0.15em] text-black-900">
        {label}
      </span>
      {children}
    </div>
  )
}
