import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PatientIntake from './pages/PatientIntake'
import Dashboard from './pages/Dashboard'
import AgentLogs from './pages/AgentLogs'
import Doctors from './pages/Doctors'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PatientIntake />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agent-logs" element={<AgentLogs />} />
          <Route path="/doctors" element={<Doctors />} />
        </Routes>
      </main>
    </div>
  )
}
