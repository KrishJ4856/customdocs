'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import ApiKeyModal from '@/components/keys/ApiKeyModal'

interface KeyModalContextType {
  openKeyModal: () => void
}

const KeyModalContext = createContext<KeyModalContextType>({ openKeyModal: () => {} })

export function useKeyModal() {
  return useContext(KeyModalContext)
}

export function KeyModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openKeyModal = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  return (
    <KeyModalContext.Provider value={{ openKeyModal }}>
      {children}
      <ApiKeyModal open={open} onClose={onClose} />
    </KeyModalContext.Provider>
  )
}
