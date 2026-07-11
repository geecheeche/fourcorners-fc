'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <button onClick={logout}
      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors">
      Sign Out
    </button>
  )
}
