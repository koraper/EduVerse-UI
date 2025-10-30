import React, { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary 컴포넌트
 * - 자식 컴포넌트에서 발생한 렌더링 에러를 캡처
 * - 에러 발생 시 대체 UI(fallback) 표시
 * - 에러 정보 로깅 가능
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 정보 저장
    this.setState({
      errorInfo,
    })

    // 외부 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 개발 환경에서 콘솔에 에러 출력
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // 사용자 정의 fallback UI 제공
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow p-6">
              {/* 에러 아이콘 */}
              <div className="flex justify-center mb-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-12 w-12 text-error-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* 에러 메시지 */}
              <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
                문제가 발생했습니다
              </h1>
              <p className="text-center text-gray-600 text-sm mb-6">
                페이지를 표시하는 중에 예상치 못한 오류가 발생했습니다.
                페이지를 새로고침하거나 나중에 다시 시도해주세요.
              </p>

              {/* 개발 환경 에러 상세 정보 */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                  <h2 className="font-semibold text-sm text-gray-900 mb-2">
                    개발자 정보:
                  </h2>
                  <div className="text-xs text-gray-700 overflow-auto max-h-32">
                    <p className="font-mono mb-2">
                      <strong>에러 메시지:</strong>
                      <br />
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                      <p className="font-mono whitespace-pre-wrap">
                        <strong>스택 추적:</strong>
                        <br />
                        {this.state.errorInfo.componentStack}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  페이지 새로고침
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  홈으로 가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
