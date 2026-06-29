import { Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { DayStartModal } from './components/DayStartModal'
import { useCurrentEmployee } from './context/CurrentEmployeeContext'
import { DocPage } from './pages/DocPage'
import { HomePage } from './pages/HomePage'
import { HrDashboardPage } from './pages/HrDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { PeoplePage } from './pages/PeoplePage'
import { WorkspacePage } from './pages/WorkspacePage'

function App() {
  const { loading, isAuthenticated } = useCurrentEmployee()

  // While the directory is loading we can't yet resolve a stored session.
  if (loading) {
    return (
      <div className="app-splash">
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Meridian…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <>
      <DayStartModal />
      <Nav />
      <div className="workspace">
        <div className="workspace-inner">
          <Routes>
            <Route path="/"           element={<HomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/workspace"  element={<WorkspacePage />} />
            <Route path="/people"     element={<PeoplePage />} />
            <Route path="/resources/:id" element={<DocPage />} />
            <Route path="/hr"         element={<HrDashboardPage />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
