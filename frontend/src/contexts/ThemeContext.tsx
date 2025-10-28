import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeType = 'system' | 'light' | 'dark'

interface ThemeContextType {
  currentTheme: ThemeType
  setTheme: (theme: ThemeType) => void
  actualTheme: 'light' | 'dark' // 시스템 테마를 고려한 실제 테마
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [isLoading, setIsLoading] = useState(true)

  // 초기화: localStorage에서 저장된 테마 로드
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') as ThemeType | null
    if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // 기본값: system
      applyTheme('system')
    }
    setIsLoading(false)
  }, [])

  // 시스템 다크 모드 감지
  useEffect(() => {
    if (currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        setActualTheme(e.matches ? 'dark' : 'light')
        applyThemeToDOM(e.matches ? 'dark' : 'light')
      }

      // 초기 설정
      setActualTheme(mediaQuery.matches ? 'dark' : 'light')
      applyThemeToDOM(mediaQuery.matches ? 'dark' : 'light')

      // 리스너 추가
      mediaQuery.addEventListener('change', handleChange)

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    } else {
      const theme = currentTheme as 'light' | 'dark'
      setActualTheme(theme)
      applyThemeToDOM(theme)
    }
  }, [currentTheme])

  // DOM에 테마 적용
  const applyThemeToDOM = (theme: 'light' | 'dark') => {
    const htmlElement = document.documentElement
    if (theme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  // 테마 변경 함수
  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme)
    localStorage.setItem('selectedTheme', theme)
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
