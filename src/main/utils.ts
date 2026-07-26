import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

export function generateId(): string {
  return nanoid()
}

export function nowIso(): string {
  return new Date().toISOString()
}
