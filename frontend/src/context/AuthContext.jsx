import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../config/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getMe } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await getMe()
          setUser(response.data.data.user)
          setRole(response.data.data.user.role)
        } catch (error) {
          console.error('Error fetching user:', error)
          setUser(null)
          setRole(null)
        }
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setRole(null)
  }

  const value = {
    user,
    role,
    loading,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
