import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { HrDashboardPage } from './pages/HrDashboardPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { PeoplePage } from './pages/PeoplePage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/hr" element={<HrDashboardPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
