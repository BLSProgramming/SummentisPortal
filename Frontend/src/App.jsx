import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Login from './pages/Login'
import PortalDashboard from './pages/PortalDashboard'
import DevAccountManager from './pages/DevAccountManager'
import Threadwork from './pages/Threadwork'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PortalDashboard />} />
          <Route path="/account-manager" element={<DevAccountManager />} />
          <Route path="/threadwork" element={<Threadwork />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
