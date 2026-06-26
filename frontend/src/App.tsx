import { Rocket, CheckCircle, Settings } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Rocket className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-semibold">MeridianOnboard</h1>
        <p className="text-slate-500">Scaffold ready — pages coming next.</p>
        <div className="flex justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">React + Vite</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span className="text-sm">lucide-react</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
