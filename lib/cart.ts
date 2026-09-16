'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { AddOn, MenuItem, OrderLine } from './menu-data'

export const DELIVERY_FEE = 50

const STORAGE_KEY = 'nambita-cart'

let cart: OrderLine[] = []
let hydrated = false
const listeners = new Set<() => void>()

function readStoredCart(): OrderLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OrderLine[]) : []
  } catch {
    return []
  }
}

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
}

function ensureHydrated() {
  if (hydrated || typeof window === 'undefined') return
  cart = readStoredCart()
  hydrated = true
}

function setCart(next: OrderLine[]) {
  cart = next
  persist()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  ensureHydrated()
  return cart
}

function getServerSnapshot() {
  return cart
}

export function lineTotal(line: OrderLine) {
  const addOnsTotal = line.addOns.reduce((sum, addOn) => sum + addOn.price, 0)
  return (line.item.price + addOnsTotal) * line.quantity
}

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

  return { cart: currentCart, addToCart, removeFromCart, clearCart, isHydrated: hydrated }
}
