'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { CollectionsProvider } from '@/contexts/CollectionsContext'
import { ReactNode } from 'react'

export function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CollectionsProvider>
        {children}
      </CollectionsProvider>
    </AuthProvider>
  )
}
