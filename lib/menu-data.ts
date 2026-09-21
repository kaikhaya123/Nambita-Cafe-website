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

export const menuSections: MenuSection[] = [
  {
    title: 'Wors Roll Combo',
    items: [
      {
        id: 'wors-roll-combo',
        name: 'WORS ROLL COMBO',
        description: 'Grilled boerewors in a fresh roll with red onions, served with chips and a drink.',
        price: 55,
        image: '/Images/menu/wors-roll-combo.jpg',
      },
    ],
  },
  {
    title: 'Wings Combo',
    items: [
      {
        id: 'wings-4-fries',
        name: '4 WINGS + FRIES',
        description: '4 crumbed or flame-grilled wings served with a side of fries.',
        price: 65,
        image: '/Images/Wings.jpg',
      },
      {
        id: 'wings-6-fries',
        name: '6 WINGS + FRIES',
        description: '6 crumbed or flame-grilled wings served with a side of fries.',
        price: 85,
        image: '/Images/Wings_Combo.png',
      },
    ],
  },
  {
    title: 'Drinks',
    items: [
      { id: 'smoothie', name: 'SMOOTHIE', description: 'Freshly blended smoothie, cold and refreshing.', price: 45, image: '/Images/Smoothie.jpeg' },
      { id: 'iced-coffee', name: 'ICED COFFEE', description: 'Cold coffee over ice for a fresh pick-me-up.', price: 45, image: '/Images/menu/iced-coffee.jpg' },
      { id: 'coke', name: 'COKE', description: 'Classic chilled coke served cold.', price: 15, image: '/Images/Cold-drinks.png' },
    ],
  },
  {
    title: 'Sides',
    items: [
      { id: 'fried-chips', name: 'FRIED CHIPS', description: 'Golden, crispy fried chips.', price: 20, image: '/Images/menu/fried-chips.jpg' },
    ],
  },
]

export const menuItemsById: Record<string, MenuItem> = Object.fromEntries(
  menuSections.flatMap((section) => section.items.map((item) => [item.id, item]))
)
