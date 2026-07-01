import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AmbientBackground } from './components/AmbientBackground'
import { CurrentEmployeeProvider } from './context/CurrentEmployeeContext'
import { TimesheetProvider } from './context/TimesheetContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CurrentEmployeeProvider>
        <TimesheetProvider>
          <AmbientBackground />
          <App />
        </TimesheetProvider>
      </CurrentEmployeeProvider>
    </BrowserRouter>
  </StrictMode>,
)
