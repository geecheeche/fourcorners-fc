import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Four Corners FC | Maryland Recreational Football',
  description: 'Four Corners Football Club — co-ed recreational football in Maryland.',
  openGraph: {
    title: 'Four Corners FC',
    description: 'Co-ed recreational football in Maryland',
    images: ['/fcfc.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
