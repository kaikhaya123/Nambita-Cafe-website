'use client'

// The customer's shopping cart (browser only).
//
// How it works:
// - The cart is one shared list kept in this file, so every component sees the same cart.
// - It's saved to localStorage, so it survives page refreshes.
// - Components read it with the `useCart()` hook. When the cart changes, every component
//   using `useCart()` re-renders automatically (that's what useSyncExternalStore does).

import { useCallback, useSyncExternalStore } from 'react'
import { lineTotal, parseOrderLine, type AddOn, type MenuItem, type OrderLine } from './menu-data'

const STORAGE_KEY = 'nambita-cart'

let cart: OrderLine[] = []
let hasLoadedFromStorage = false
const listeners = new Set<() => void>()

function readStoredCart(): OrderLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    // Re-check saved lines against the current menu: drops removed items and refreshes prices.
    return Array.isArray(parsed)
      ? parsed.map(parseOrderLine).filter((line): line is OrderLine => line !== null)
      : []
  } catch {
    return []
  }
}

function loadFromStorageOnce() {
  if (hasLoadedFromStorage || typeof window === 'undefined') return
  cart = readStoredCart()
  hasLoadedFromStorage = true
}

// Replace the cart, save it, and tell every component using useCart() to re-render.
function setCart(next: OrderLine[]) {
  cart = next
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  loadFromStorageOnce()
  return cart
}

// On the server there's no localStorage, so the cart always starts empty.
function getServerSnapshot() {
  return cart
}

/** Total price of every line in the cart. */
export function cartSubtotal(cartLines: OrderLine[]) {
  return cartLines.reduce((sum, line) => sum + lineTotal(line), 0)
}

export function useCart() {
  const currentCart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addToCart = useCallback((item: MenuItem, quantity: number, addOns: AddOn[] = []) => {
    setCart([...cart, { key: `${item.id}-${Date.now()}`, item, quantity, addOns }])
  }, [])

  const removeFromCart = useCallback((key: string) => {
    setCart(cart.filter((line) => line.key !== key))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  // isHydrated: true once the saved cart has been loaded. Before that, an empty cart
  // might just mean "not loaded yet", so pages shouldn't say "your cart is empty".
  return { cart: currentCart, addToCart, removeFromCart, clearCart, isHydrated: hasLoadedFromStorage }
}
