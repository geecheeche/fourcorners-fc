import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Image src="/fcfc.jpg" alt="FCFC" width={36} height={36} className="rounded-full object-cover" />
            <span className="font-bold text-white">Four Corners FC</span>
          </div>
          <p className="text-slate-400 text-sm">Co-ed recreational football in Maryland. All skill levels welcome.</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-200 mb-3">Quick Links</h4>
          <ul className="space-y-1 text-sm text-slate-400">
            {[['/', 'Home'], ['/teams', 'Teams'], ['/fixtures', 'Fixtures & Log'], ['/waiver', 'Sign Waiver']].map(([h, l]) => (
              <li key={h}><Link href={h} className="hover:text-green-400 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-200 mb-3">The Four Teams</h4>
          <ul className="space-y-1 text-sm text-slate-400">
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" />Gang Green</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />White Noise</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600 inline-block" />Crunch</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />Big Blue</li>
          </ul>
        </div>
      </div>
      <p className="text-center text-slate-600 text-xs mt-8">© {new Date().getFullYear()} Four Corners FC · Maryland</p>
    </footer>
  )
}
