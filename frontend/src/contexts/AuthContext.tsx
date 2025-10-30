import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: 'student' | 'professor' | 'admin'
  emailVerified: boolean
  phone?: string
  department?: string
  bio?: string
  studentId?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<User>
  register: (email: string, name: string, password: string, role: 'student' | 'professor') => Promise<User>
  logout: () => void
  updateUser: (updatedUser: User) => void
  isLoading: boolean
  loading: boolean // alias for isLoading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로드시 localStorage에서 인증 정보 복원
  useEffect(() => {
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser)

        // role이 없거나 누락된 필드가 있으면 API로 최신 정보 가져오기
        if (!parsedUser.role) {
          console.warn('[AuthContext] User role is missing. Fetching latest user data...')
          try {
            const response = await fetch('/api/profile', {
              headers: { 'Authorization': `Bearer ${storedToken}` }
            })
            const data = await response.json()
            if (data.status === 'success' && data.data?.user) {
              const updatedUser = data.data.user
              setUser(updatedUser)
              setToken(storedToken)
              localStorage.setItem('auth_user', JSON.stringify(updatedUser))
              console.log('[AuthContext] User data updated:', updatedUser)
            } else {
              setUser(parsedUser)
              setToken(storedToken)
            }
          } catch (error) {
            console.error('[AuthContext] Failed to fetch user data:', error)
            setUser(parsedUser)
            setToken(storedToken)
          }
        } else {
          setToken(storedToken)
          setUser(parsedUser)
        }
      }
      setIsLoading(false)
    }

    restoreAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다')
      }

      const { user, token } = data.data

      setUser(user)
      setToken(token)

      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      return user
    } catch (error) {
      throw error
    }
  }

  const register = async (
    email: string,
    name: string,
    password: string,
    role: 'student' | 'professor'
  ): Promise<User> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다')
      }

      const { user, token } = data.data

      setUser(user)
      setToken(token)

      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      return user
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('auth_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, isLoading, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
