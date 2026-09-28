// One menu category (e.g. "Drinks"): a black title bar and a grid of item cards.

import MenuItemCard from '@/components/menu/MenuItemCard'
import type { MenuItem } from '@/lib/menu-data'

export default function MenuSection({
  title,
  items,
  onSelectItem,
  onQuickAdd,
}: Readonly<{
  title: string
  items: ReadonlyArray<MenuItem>
  onSelectItem: (item: MenuItem) => void
  onQuickAdd: (item: MenuItem) => void
}>) {
  return (
    <div className="mb-16 last:mb-12">
      <div className="-mx-4 mb-8 flex items-center justify-center bg-black-900 px-5 py-5 sm:-mx-5 sm:px-8 lg:-mx-10">
        <h2 className="font-teko text-xl uppercase tracking-[0.02em] text-white sm:text-2xl sm:tracking-[0.025em] md:text-3xl md:tracking-[0.03em]">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-3">
        {items.map((item, index) => (
          <MenuItemCard key={item.id} item={item} index={index} onSelect={onSelectItem} onQuickAdd={onQuickAdd} />
        ))}
      </div>
    </div>
  )
}
