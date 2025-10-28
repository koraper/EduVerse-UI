import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type FontType = 'pretendard' | 'poppins' | 'nanum-pen'

interface FontContextType {
  currentFont: FontType
  setFont: (font: FontType) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

interface FontProviderProps {
  children: ReactNode
}

export const FontProvider = ({ children }: FontProviderProps) => {
  const [currentFont, setCurrentFont] = useState<FontType>('pretendard')
  const [isLoading, setIsLoading] = useState(true)

  // 초기화: localStorage에서 저장된 폰트 로드
  useEffect(() => {
    const savedFont = localStorage.getItem('selectedFont') as FontType | null
    if (savedFont && ['pretendard', 'poppins', 'nanum-pen'].includes(savedFont)) {
      setCurrentFont(savedFont)
      applyFont(savedFont)
    } else {
      // 기본값: Pretendard
      applyFont('pretendard')
    }
    setIsLoading(false)
  }, [])

  // 폰트 적용 함수
  const applyFont = (font: FontType) => {
    const fontMap: Record<FontType, string> = {
      pretendard: 'font-pretendard',
      poppins: 'font-poppins',
      'nanum-pen': 'font-nanum-pen',
    }

    // body 요소에서 기존 폰트 클래스 제거
    document.body.classList.remove('font-pretendard', 'font-poppins', 'font-nanum-pen')
    // 새로운 폰트 클래스 추가
    document.body.classList.add(fontMap[font])
    document.documentElement.style.fontFamily = getFontFamilyString(font)
  }

  // 폰트 이름에서 CSS font-family 문자열 생성
  const getFontFamilyString = (font: FontType): string => {
    const fontFamilyMap: Record<FontType, string> = {
      pretendard: "'Noto Sans KR', system-ui, sans-serif",
      poppins: "'Poppins', system-ui, sans-serif",
      'nanum-pen': "'Nanum Pen Script', cursive",
    }
    return fontFamilyMap[font]
  }

  // 폰트 변경 함수
  const setFont = (font: FontType) => {
    setCurrentFont(font)
    localStorage.setItem('selectedFont', font)
    applyFont(font)
  }

  return (
    <FontContext.Provider value={{ currentFont, setFont }}>
      {children}
    </FontContext.Provider>
  )
}

export const useFont = (): FontContextType => {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}
