import WaiverForm from './WaiverForm'

export default function WaiverPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Player Waiver</h1>
        <p className="text-slate-400">
          All players must sign the Four Corners FC liability waiver before participating.
          Fill in your details, review the waiver, draw your signature, and submit.
        </p>
      </div>

      {/* Waiver PDF preview */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">Liability Waiver Document</h2>
          <a href="/waiver.pdf" target="_blank" rel="noopener noreferrer"
            className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </a>
        </div>
        <iframe
          src="/waiver.pdf"
          className="w-full h-96 rounded-xl border border-slate-700"
          title="FCFC Waiver"
        />
      </div>

      <WaiverForm />
    </div>
  )
}
