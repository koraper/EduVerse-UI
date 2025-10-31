import { useTheme } from '@/contexts/ThemeContext'
import { Card } from '@/components/common'
import { Code, RotateCcw, Type } from 'lucide-react'
import Editor from '@monaco-editor/react'

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

  // Monaco Editor 언어 맵핑
  const getMonacoLanguage = (lang: typeof language): string => {
    const languageMap: Record<typeof language, string> = {
      python: 'python',
      javascript: 'javascript',
      java: 'java',
      cpp: 'cpp'
    }
    return languageMap[lang]
  }

  const handleReset = () => {
    // TODO: 시작 코드로 리셋
    onCodeChange('')
  }

  const handleFormat = () => {
    // Monaco Editor의 포맷팅 기능 사용
    // 에디터 인스턴스에서 직접 호출하도록 수정 필요
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

        {/* Monaco Editor 영역 */}
        <div className={currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
          <Editor
            height="400px"
            language={getMonacoLanguage(language)}
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            theme={currentTheme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              }
            }}
            loading={
              <div className={`flex items-center justify-center h-[400px] ${
                currentTheme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'
              }`}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                  <p className="text-sm">에디터 로딩 중...</p>
                </div>
              </div>
            }
          />
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
