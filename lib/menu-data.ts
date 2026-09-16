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
    title: 'Toasted & Bites',
    items: [
      { id: 'stacked-dagwood', name: 'STACKED DAGWOOD', description: '100% meat patty, tomato, cheese, lettuce and onions.', price: 52, image: '/Images/menu/stacked-dagwood.jpg' },
      { id: 'chicken-wrap', name: 'CHICKEN WRAP', description: 'Crumbed chicken, tomato, cheese and your choice of sauce.', price: 56, image: '/Images/menu/chicken-wrap.jpg' },
      { id: 'chicken-mayo', name: 'CHICKEN & MAYO', description: 'Toasted sandwich served with shredded chicken and mayo.', price: 34, image: '/Images/menu/chicken-mayo.jpg' },
      { id: 'chicken-strips', name: 'CHICKEN STRIPS', description: '4 crumbed chicken strips served with any sauce.', price: 36, image: '/Images/menu/chicken-strips.jpg' },
      { id: 'ham-cheese', name: 'HAM & CHEESE', description: 'Toasted sandwich with ham, cheese and BBQ sauce.', price: 32, image: '/Images/menu/ham-cheese.jpg' },
      { id: 'wors-roll', name: 'WORS ROLL', description: 'Grilled boerewors in a fresh roll with red onions.', price: 35, image: '/Images/menu/wors-roll.jpg' },
    ],
  },
  {
    title: 'Hot Drinks',
    items: [
      { id: 'coffee', name: 'COFFEE', description: 'Fresh brewed coffee served hot.', price: 22, image: '/Images/menu/coffee.jpg' },
      { id: 'cappuccino', name: 'CAPPUCCINO', description: 'Espresso with smooth steamed foam.', price: 28, image: '/Images/menu/cappuccino.jpg' },
      { id: 'hot-chocolate', name: 'HOT CHOCOLATE', description: 'Rich hot chocolate served warm and creamy.', price: 28, image: '/Images/menu/hot-chocolate.jpg' },
    ],
  },
  {
    title: 'Cold Drinks',
    items: [
      { id: 'iced-coffee', name: 'ICED COFFEE', description: 'Cold coffee over ice for a fresh pick-me-up.', price: 28, image: '/Images/menu/iced-coffee.jpg' },
      { id: 'refresher', name: 'REFRESHER', description: 'Chilled refresher drink served cold.', price: 25, image: '/Images/menu/refresher.jpg' },
      { id: 'coke', name: 'COKE', description: 'Classic chilled coke served cold.', price: 15, image: '/Images/menu/coke.jpg' },
    ],
  },
]

export const menuItemsById: Record<string, MenuItem> = Object.fromEntries(
  menuSections.flatMap((section) => section.items.map((item) => [item.id, item]))
)

// Add-ons available for suggestion — either a bite/drink pulled from the menu
// (referencesMenuItem) or an extra that only exists as an add-on.
export const addOnCatalog: Record<string, AddOn> = {
  'extra-cheese': { id: 'extra-cheese', name: 'Extra Cheese', price: 8 },
  'extra-patty': { id: 'extra-patty', name: 'Extra Patty', price: 15 },
  'extra-sauce': { id: 'extra-sauce', name: 'Extra Sauce', price: 5 },
  coffee: { id: 'coffee', name: 'Coffee', price: 22 },
  cappuccino: { id: 'cappuccino', name: 'Cappuccino', price: 28 },
  'hot-chocolate': { id: 'hot-chocolate', name: 'Hot Chocolate', price: 28 },
  'iced-coffee': { id: 'iced-coffee', name: 'Iced Coffee', price: 28 },
  refresher: { id: 'refresher', name: 'Refresher', price: 25 },
  coke: { id: 'coke', name: 'Coke', price: 15 },
  'ham-cheese': { id: 'ham-cheese', name: 'Ham & Cheese', price: 32 },
  'chicken-mayo': { id: 'chicken-mayo', name: 'Chicken & Mayo', price: 34 },
  'chicken-strips': { id: 'chicken-strips', name: 'Chicken Strips', price: 36 },
  'chicken-wrap': { id: 'chicken-wrap', name: 'Chicken Wrap', price: 56 },
  'stacked-dagwood': { id: 'stacked-dagwood', name: 'Stacked Dagwood', price: 52 },
  'wors-roll': { id: 'wors-roll', name: 'Wors Roll', price: 35 },
}

// Curated "suggested combo" add-ons per menu item id.
export const comboSuggestions: Record<string, string[]> = {
  'stacked-dagwood': ['extra-cheese', 'coke'],
  'chicken-wrap': ['extra-sauce', 'iced-coffee'],
  'chicken-mayo': ['extra-cheese', 'coffee'],
  'chicken-strips': ['extra-sauce', 'coke'],
  'ham-cheese': ['extra-cheese', 'cappuccino'],
  'wors-roll': ['extra-sauce', 'coke'],
  coffee: ['ham-cheese'],
  cappuccino: ['chicken-mayo'],
  'hot-chocolate': ['stacked-dagwood'],
  'iced-coffee': ['chicken-wrap'],
  refresher: ['chicken-strips'],
  coke: ['wors-roll'],
}
