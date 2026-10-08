// The menu: every item customers can order, with its price and photo.
//
// To add, remove or re-price an item, edit `menuSections` below. That's the only place
// prices live. The checkout API re-reads prices from here, so what the customer is
// charged always matches this file.

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export interface MenuSection {
  title: string
  items: MenuItem[]
}

export interface AddOn {
  id: string
  name: string
  price: number
}

export interface OrderLine {
  key: string
  item: MenuItem
  quantity: number
  addOns: AddOn[]
}

/** Price of one order line: the item plus its add-ons, times the quantity. */
export function lineTotal(line: OrderLine) {
  const addOnsTotal = line.addOns.reduce((sum, addOn) => sum + addOn.price, 0)
  return (line.item.price + addOnsTotal) * line.quantity
}

export const menuSections: MenuSection[] = [
  {
    title: 'Original Wors Roll',
    items: [
      {
        id: 'wors-roll-combo',
        name: 'WORS ROLL COMBO',
        description: 'Grilled boerewors in a fresh roll with red onions, served with chips and a drink.',
        price: 65,
        image: '/Images/Remove Logo from Image-Photoroom.png',
      },
    ],
  },
  {
    title: 'Original Wings ',
    items: [
      {
        id: 'wings-4-fries',
        name: '4 WINGS + FRIES ',
        description: '4 crumbed or flame-grilled wings served with a side of fries and a Coke.',
        price: 65,
        image: '/Images/IMG_4311.png',
      },
      {
        id: 'wings-6-fries',
        name: '6 WINGS + FRIES + COKE',
        description: '6 crumbed or flame-grilled wings served with a side of fries and a Coke.',
        price: 85,
        image: '/Images/menu/wings-combo.png',
      },
    ],
  },
  {
    title: 'Original Drinks',
    items: [
      { id: 'smoothie', name: 'SMOOTHIE', description: 'Freshly blended smoothie, cold and refreshing.', price: 55, image: '/Images/ChatGPT Image Jul 13, 2026, 04_12_00 PM-Photoroom.png' },
      { id: 'iced-coffee', name: 'ICED COFFEE', description: 'Cold coffee over ice for a fresh pick-me-up.', price: 35, image: '/Images/ChatGPT Image Jul 13, 2026, 04_26_07 PM-Photoroom.png' },
      { id: 'coke', name: 'COKE', description: 'Classic chilled coke served cold.', price: 15, image: '/Images/pngwing.com (1).png' },
    ],
  },
  {
    title: 'Sides',
    items: [
      { id: 'fried-chips', name: 'FRIED CHIPS', description: 'Golden, crispy fried chips.', price: 20, image: '/Images/menu/fried-chips.png' },
    ],
  },
]

export const menuItemsById: Record<string, MenuItem> = Object.fromEntries(
  menuSections.flatMap((section) => section.items.map((item) => [item.id, item]))
)

export const MAX_LINE_QUANTITY = 50

/**
 * Rebuilds a cart line from untrusted input (the browser, or a cart saved by an older
 * version of the site) using the current menu. Only the item id and quantity are kept;
 * name and price always come from the menu. Returns null if the line isn't valid.
 * Add-ons are dropped: there is no priced add-on list to check them against.
 */
export function parseOrderLine(value: unknown): OrderLine | null {
  const line = value as { key?: unknown; item?: { id?: unknown }; quantity?: unknown } | null
  const id = line?.item?.id
  const item = typeof id === 'string' && Object.hasOwn(menuItemsById, id) ? menuItemsById[id] : undefined
  const quantity = line?.quantity
  if (!item || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
    return null
  }
  const key = typeof line?.key === 'string' && line.key.length <= 100 ? line.key : `${item.id}-${quantity}`
  return { key, item, quantity, addOns: [] }
}
