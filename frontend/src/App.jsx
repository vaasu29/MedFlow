import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import PatientIntake from './pages/PatientIntake'
import Dashboard from './pages/Dashboard'
import AgentLogs from './pages/AgentLogs'
import Doctors from './pages/Doctors'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopHeader />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<PatientIntake />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agent-logs" element={<AgentLogs />} />
            <Route path="/doctors" element={<Doctors />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
