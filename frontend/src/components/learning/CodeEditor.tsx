import { useTheme } from '@/contexts/ThemeContext'
import { Card } from '@/components/common'
import { Code, RotateCcw, Type } from 'lucide-react'

interface CodeEditorProps {
  code: string
  language: 'python' | 'javascript' | 'java' | 'cpp'
  onCodeChange: (code: string) => void
  onLanguageChange: (language: 'python' | 'javascript' | 'java' | 'cpp') => void
}

const CodeEditor = ({
  code,
  language,
  onCodeChange,
  onLanguageChange
}: CodeEditorProps) => {
  const { currentTheme } = useTheme()

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ] as const

  const handleReset = () => {
    // TODO: 시작 코드로 리셋
    onCodeChange('')
  }

  const handleFormat = () => {
    // TODO: 코드 포맷팅 (prettier 등)
    console.log('Formatting code...')
  }

  return (
    <Card>
      <div className="overflow-hidden">
        {/* 에디터 헤더 */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <Code className={`w-5 h-5 ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <h3 className={`font-semibold ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              코드 에디터
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* 언어 선택 */}
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as any)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                currentTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-650'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            {/* 포맷 버튼 */}
            <button
              onClick={handleFormat}
              className={`p-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="코드 포맷팅"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* 리셋 버튼 */}
            <button
              onClick={handleReset}
              className={`p-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 에디터 영역 */}
        <div className={`relative ${
          currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder={`${languages.find(l => l.value === language)?.label} 코드를 작성하세요...`}
            className={`w-full min-h-[400px] p-4 font-mono text-sm resize-none focus:outline-none transition-colors ${
              currentTheme === 'dark'
                ? 'bg-gray-900 text-gray-100 placeholder-gray-600'
                : 'bg-gray-50 text-gray-900 placeholder-gray-400'
            }`}
            spellCheck={false}
            style={{
              tabSize: 4,
              lineHeight: '1.6'
            }}
          />

          {/* 라인 넘버 (추후 Monaco Editor로 대체) */}
          <div className={`absolute top-0 left-0 p-4 pr-2 select-none pointer-events-none font-mono text-sm ${
            currentTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {code.split('\n').map((_, index) => (
              <div key={index} style={{ lineHeight: '1.6' }}>
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 에디터 푸터 */}
        <div className={`flex items-center justify-between px-4 py-2 border-t text-xs ${
          currentTheme === 'dark'
            ? 'border-gray-700 bg-gray-800 text-gray-400'
            : 'border-gray-200 bg-gray-50 text-gray-600'
        }`}>
          <div className="flex items-center gap-4">
            <span>라인: {code.split('\n').length}</span>
            <span>문자: {code.length}</span>
            <span className={`px-2 py-0.5 rounded ${
              currentTheme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
            }`}>
              자동 저장됨
            </span>
          </div>
          <div>
            <span>{languages.find(l => l.value === language)?.label}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CodeEditor
