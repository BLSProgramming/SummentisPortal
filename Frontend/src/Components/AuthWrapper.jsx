import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthWrapper({ children }) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in (stored in localStorage)
        const storedAuth = localStorage.getItem('isAuthenticated')
        
        if (storedAuth === 'true') {
          setIsAuthenticated(true)
          setIsChecking(false)
        } else {
          // Not authenticated, redirect to login
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('Auth check error:', err)
        navigate('/login', { replace: true })
      }
    }

    checkAuth()
  }, [navigate])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-slate-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : null
}

export default AuthWrapper
