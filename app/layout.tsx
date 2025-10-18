import type { Metadata } from 'next'
import '@/index.css'
import { RootLayoutClient } from './RootLayoutClient'

export const metadata: Metadata = {
  title: 'Dumpit',
  description: 'Dump your resources, find them later',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}
