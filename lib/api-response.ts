import { NextResponse } from 'next/server'

// Small helpers shared by the API routes in app/api.

/** Sends `{ error: message }` with an HTTP status code, e.g. jsonError('Not found.', 404). */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Waits a moment before answering a wrong password or code.
 * This makes guessing thousands of passwords in a row much slower.
 */
export function slowDown() {
  return new Promise((resolve) => setTimeout(resolve, 600))
}
