import { Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { HrDashboardPage } from './pages/HrDashboardPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { PeoplePage } from './pages/PeoplePage'

function App() {
  return (
    <>
      <Nav />
      <div className="workspace">
        <div className="workspace-inner">
          <Routes>
            <Route path="/"       element={<OnboardingPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/hr"     element={<HrDashboardPage />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
