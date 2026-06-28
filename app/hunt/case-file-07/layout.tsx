import type { Metadata } from 'next'
import { Cinzel, Lora, Geist_Mono } from 'next/font/google'
import { ScrollProvider } from '@/components/case-file-07/ScrollProvider'

const cinzel = Cinzel({ variable: '--font-cinzel', subsets: ['latin'] })
const lora = Lora({ variable: '--font-body', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const viewport = { width: 'device-width', initialScale: 1 }
export const metadata: Metadata = { 
  title: 'Case 07 - Operation Deadlight', 
  description: 'A story-driven cryptic hunt across nine fractured timelines.', 
  keywords: ['Aetherion', 'cryptic hunt', 'IEEE CS MUJ', 'puzzles'] 
}

export default function CaseFileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${cinzel.variable} ${lora.variable} ${geistMono.variable} min-h-full bg-black text-[#f4ece1] antialiased`}>
      <div className="aetherion-grain" />
      <div className="aetherion-scanlines" />
      <ScrollProvider>{children}</ScrollProvider>
    </div>
  )
}

