/**
 * 에러 로그 레벨
 */
export enum ErrorLogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * 에러 로그 항목
 */
export interface ErrorLogEntry {
  id: string
  timestamp: Date
  level: ErrorLogLevel
  message: string
  errorType: string
  context?: Record<string, unknown>
  userAgent?: string
  url?: string
  stack?: string
}

/**
 * 에러 로거 클래스
 * - 에러 로그 수집 및 저장
 * - 로컬 스토리지 또는 서버로 전송
 * - 에러 분석 및 추적
 */
class ErrorLogger {
  private logs: ErrorLogEntry[] = []
  private maxLogs: number = 100
  private storageKey: string = 'error_logs'

  constructor(maxLogs: number = 100) {
    this.maxLogs = maxLogs
    this.loadLogsFromStorage()
  }

  /**
   * 에러 로그 기록
   */
  log(
    message: string,
    options: {
      level?: ErrorLogLevel
      error?: unknown
      context?: Record<string, unknown>
    } = {}
  ): ErrorLogEntry {
    const {
      level = ErrorLogLevel.ERROR,
      error,
      context,
    } = options

    const errorType = this.getErrorType(error)
    const stack = this.getErrorStack(error)

    const entry: ErrorLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      errorType,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack,
    }

    // 로그 추가
    this.logs.push(entry)

    // 최대 개수 초과 시 가장 오래된 로그 제거
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 로컬 스토리지에 저장
    this.saveLogsToStorage()

    // 콘솔에 출력 (개발 모드)
    if (import.meta.env.DEV) {
      this.logToConsole(entry)
    }

    // 중요한 에러는 서버로 전송 (선택사항)
    if (level === ErrorLogLevel.ERROR || level === ErrorLogLevel.CRITICAL) {
      this.sendToServer(entry)
    }

    return entry
  }

  /**
   * 에러 기록
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    return this.log(message, {
      level: ErrorLogLevel.ERROR,
      error,
      context,
    })
  }

  /**
   * 경고 기록
   */
  warn(message: string, error?: unknown, context?: Record<string, unknown>) {
    return this.log(message, {
      level: ErrorLogLevel.WARNING,
      error,
      context,
    })
  }

  /**
   * 정보 기록
   */
  info(message: string, context?: Record<string, unknown>) {
    return this.log(message, {
      level: ErrorLogLevel.INFO,
      context,
    })
  }

  /**
   * 디버그 기록
   */
  debug(message: string, context?: Record<string, unknown>) {
    return this.log(message, {
      level: ErrorLogLevel.DEBUG,
      context,
    })
  }

  /**
   * 심각한 에러 기록
   */
  critical(message: string, error?: unknown, context?: Record<string, unknown>) {
    return this.log(message, {
      level: ErrorLogLevel.CRITICAL,
      error,
      context,
    })
  }

  /**
   * 모든 로그 조회
   */
  getLogs(filter?: { level?: ErrorLogLevel; limit?: number }): ErrorLogEntry[] {
    let filtered = [...this.logs]

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level)
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit)
    }

    return filtered
  }

  /**
   * 로그 검색
   */
  searchLogs(query: string): ErrorLogEntry[] {
    const lowerQuery = query.toLowerCase()
    return this.logs.filter(
      (log) =>
        log.message.toLowerCase().includes(lowerQuery) ||
        log.errorType.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 로그 초기화
   */
  clearLogs() {
    this.logs = []
    localStorage.removeItem(this.storageKey)
  }

  /**
   * 에러 타입 추출
   */
  private getErrorType(error: unknown): string {
    if (error instanceof Error) {
      return error.constructor.name
    }
    if (error instanceof Response) {
      return `HTTP ${error.status}`
    }
    return typeof error === 'string' ? 'String' : 'Unknown'
  }

  /**
   * 에러 스택 추출
   */
  private getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack
    }
    return undefined
  }

  /**
   * 콘솔에 로그 출력
   */
  private logToConsole(entry: ErrorLogEntry) {
    const style = this.getConsoleStyle(entry.level)
    const message = `[${entry.level}] ${entry.message}`

    console.group(`%c${message}`, style)
    console.log('Error Type:', entry.errorType)
    console.log('Time:', entry.timestamp.toISOString())
    if (entry.context) {
      console.log('Context:', entry.context)
    }
    if (entry.stack) {
      console.log('Stack:', entry.stack)
    }
    console.groupEnd()
  }

  /**
   * 콘솔 스타일 결정
   */
  private getConsoleStyle(level: ErrorLogLevel): string {
    const styles = {
      [ErrorLogLevel.DEBUG]: 'color: #999; font-weight: normal;',
      [ErrorLogLevel.INFO]: 'color: #0066cc; font-weight: normal;',
      [ErrorLogLevel.WARNING]: 'color: #ff9900; font-weight: bold;',
      [ErrorLogLevel.ERROR]: 'color: #cc0000; font-weight: bold;',
      [ErrorLogLevel.CRITICAL]: 'color: #ff0000; font-weight: bold; background: #ffcccc;',
    }
    return styles[level]
  }

  /**
   * 로그를 로컬 스토리지에 저장
   */
  private saveLogsToStorage() {
    try {
      const simplified = this.logs.map((log) => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
      }))
      localStorage.setItem(this.storageKey, JSON.stringify(simplified))
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error)
    }
  }

  /**
   * 로컬 스토리지에서 로그 로드
   */
  private loadLogsFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{
          timestamp: string
          [key: string]: unknown
        }>
        this.logs = parsed.map((log) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        } as ErrorLogEntry))
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error)
    }
  }

  /**
   * 에러 로그를 서버로 전송 (선택사항)
   */
  private async sendToServer(entry: ErrorLogEntry) {
    try {
      // 향후 에러 로깅 서버 구현 시 사용
      // await fetch('/api/logs/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // })
    } catch (error) {
      console.warn('Failed to send error log to server:', error)
    }
  }
}

// 전역 에러 로거 인스턴스
export const errorLogger = new ErrorLogger()

/**
 * 전역 에러 핸들러 설정
 */
export function setupGlobalErrorHandlers() {
  // 처리되지 않은 에러
  window.addEventListener('error', (event: ErrorEvent) => {
    errorLogger.error('Uncaught Error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // 처리되지 않은 Promise 거부
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    errorLogger.error('Unhandled Promise Rejection', event.reason, {
      promise: event.promise,
    })
  })

  // 콘솔 에러 메서드 오버라이드 (개발용)
  if (import.meta.env.DEV) {
    const originalError = console.error
    console.error = function (...args: any[]) {
      errorLogger.warn('Console Error', undefined, { args })
      originalError.apply(console, args)
    }
  }
}
