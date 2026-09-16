'use client'

import { useSyncExternalStore } from 'react'

type NetworkInformation = {
  saveData?: boolean
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined
  const nav = navigator as Navigator & {
    connection?: NetworkInformation
    mozConnection?: NetworkInformation
    webkitConnection?: NetworkInformation
  }
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection
}

function isSlow(connection: NetworkInformation | undefined): boolean {
  if (!connection) return false
  if (connection.saveData) return true
  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
}

function subscribe(onChange: () => void): () => void {
  const connection = getConnection()
  if (!connection?.addEventListener) return () => {}

  connection.addEventListener('change', onChange)
  return () => connection.removeEventListener?.('change', onChange)
}

function getSnapshot(): boolean {
  return isSlow(getConnection())
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Reports whether the visitor has requested reduced data usage (Data Saver)
 * or is on a 2G-class connection, so autoplaying background video can be
 * skipped in favour of a static fallback.
 */
export function useSlowConnection(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
