'use client'

import { useSyncExternalStore } from 'react'

let isOpen = false
const listeners = new Set<() => void>()

function setOpen(next: boolean) {
  isOpen = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return isOpen
}

function getServerSnapshot() {
  return false
}

export function openCartDrawer() {
  setOpen(true)
}

export function closeCartDrawer() {
  setOpen(false)
}

export function useCartDrawerOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
