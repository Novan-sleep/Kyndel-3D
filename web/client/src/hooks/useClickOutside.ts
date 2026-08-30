import { useEffect, RefObject } from 'react'

export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void): void {
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, onOutside])
}
