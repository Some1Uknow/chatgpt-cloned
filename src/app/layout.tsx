import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A modern ChatGPT clone with authentication',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider 
      afterSignInUrl="/chat"
      afterSignUpUrl="/chat"
    >
      <html lang="en" className="h-full dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-[#212121] text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}