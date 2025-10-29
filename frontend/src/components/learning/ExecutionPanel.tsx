import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Card } from '@/components/common'
import { Play, FlaskConical, Terminal, CheckCircle2, XCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'

interface TestResult {
  id: number
  name: string
  status: 'pass' | 'fail'
  expected: string
  actual: string
}

interface ExecutionPanelProps {
  consoleOutput: string
  testResults: TestResult[]
  isExecuting: boolean
  onRunCode: () => void
  onRunTests: () => void
}

const ExecutionPanel = ({
  consoleOutput,
  testResults,
  isExecuting,
  onRunCode,
  onRunTests
}: ExecutionPanelProps) => {
  const { currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'console' | 'tests'>('console')
  const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set())

  const passedTests = testResults.filter(t => t.status === 'pass').length
  const totalTests = testResults.length
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0

  const toggleTestExpand = (testId: number) => {
    const newExpanded = new Set(expandedTests)
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId)
    } else {
      newExpanded.add(testId)
    }
    setExpandedTests(newExpanded)
  }

  return (
    <Card>
      <div className="overflow-hidden">
        {/* 탭 헤더 */}
        <div className={`flex items-center justify-between border-b ${
          currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'console'
                  ? currentTheme === 'dark'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-primary-600 text-primary-600'
                  : currentTheme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Terminal className="w-4 h-4" />
              콘솔 출력
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'tests'
                  ? currentTheme === 'dark'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-primary-600 text-primary-600'
                  : currentTheme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              테스트 결과
              {testResults.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  passedTests === totalTests
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {passedTests}/{totalTests}
                </span>
              )}
            </button>
          </div>

          {/* 실행 버튼 */}
          <div className="flex gap-2 px-4">
            <button
              onClick={onRunCode}
              disabled={isExecuting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isExecuting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white'
              }`}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              코드 실행
            </button>
            <button
              onClick={onRunTests}
              disabled={isExecuting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isExecuting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white'
              }`}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FlaskConical className="w-4 h-4" />
              )}
              테스트 실행
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="min-h-[300px]">
          {activeTab === 'console' ? (
            /* 콘솔 출력 */
            <div className={`p-4 font-mono text-sm ${
              currentTheme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-900'
            }`}>
              {consoleOutput ? (
                <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
              ) : (
                <p className={currentTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>
                  코드를 실행하면 결과가 여기에 표시됩니다
                </p>
              )}
            </div>
          ) : (
            /* 테스트 결과 */
            <div className="p-4 space-y-4">
              {testResults.length > 0 ? (
                <>
                  {/* 통과율 */}
                  <div className={`p-4 rounded-lg ${
                    passedTests === totalTests
                      ? currentTheme === 'dark'
                        ? 'bg-green-900/20 border border-green-800'
                        : 'bg-green-50 border border-green-200'
                      : currentTheme === 'dark'
                      ? 'bg-red-900/20 border border-red-800'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${
                        passedTests === totalTests
                          ? currentTheme === 'dark' ? 'text-green-300' : 'text-green-900'
                          : currentTheme === 'dark' ? 'text-red-300' : 'text-red-900'
                      }`}>
                        테스트 통과율
                      </span>
                      <span className={`text-2xl font-bold ${
                        passedTests === totalTests
                          ? currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {passRate}%
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${
                      currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passedTests === totalTests ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                  </div>

                  {/* 테스트 케이스 목록 */}
                  <div className="space-y-2">
                    {testResults.map((test) => (
                      <div
                        key={test.id}
                        className={`border rounded-lg overflow-hidden ${
                          currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleTestExpand(test.id)}
                          className={`w-full flex items-center justify-between p-3 transition-colors ${
                            currentTheme === 'dark'
                              ? 'hover:bg-gray-800 bg-gray-750'
                              : 'hover:bg-gray-50 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {test.status === 'pass' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className={`font-medium ${
                              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {test.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              test.status === 'pass'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {test.status === 'pass' ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                          {expandedTests.has(test.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {/* 상세 정보 */}
                        {expandedTests.has(test.id) && (
                          <div className={`p-4 border-t text-sm ${
                            currentTheme === 'dark'
                              ? 'border-gray-700 bg-gray-800'
                              : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className={`text-xs font-medium mb-1 ${
                                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  예상값
                                </p>
                                <code className={`block p-2 rounded font-mono ${
                                  currentTheme === 'dark'
                                    ? 'bg-gray-900 text-green-400'
                                    : 'bg-white text-green-600'
                                }`}>
                                  {test.expected}
                                </code>
                              </div>
                              <div>
                                <p className={`text-xs font-medium mb-1 ${
                                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  실제값
                                </p>
                                <code className={`block p-2 rounded font-mono ${
                                  test.status === 'pass'
                                    ? currentTheme === 'dark'
                                      ? 'bg-gray-900 text-green-400'
                                      : 'bg-white text-green-600'
                                    : currentTheme === 'dark'
                                    ? 'bg-gray-900 text-red-400'
                                    : 'bg-white text-red-600'
                                }`}>
                                  {test.actual}
                                </code>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className={`text-center py-8 ${
                  currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  테스트를 실행하면 결과가 여기에 표시됩니다
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default ExecutionPanel
