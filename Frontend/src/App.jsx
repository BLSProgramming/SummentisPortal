import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Login from './pages/Login'
import PortalDashboard from './pages/PortalDashboard'
import DevAccountManager from './pages/DevAccountManager'
import Threadwork from './pages/Threadwork'
import AuthWrapper from './Components/AuthWrapper'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<AuthWrapper><PortalDashboard /></AuthWrapper>} />
          <Route path="/account-manager" element={<AuthWrapper><DevAccountManager /></AuthWrapper>} />
          <Route path="/threadwork" element={<AuthWrapper><Threadwork /></AuthWrapper>} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
