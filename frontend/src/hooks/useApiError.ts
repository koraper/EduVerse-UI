import { useState, useCallback } from 'react'
import { useToast } from '@/components/common'
import {
  handleApiError,
  handleFetchError,
  getToastVariantForErrorType,
  type ApiErrorInfo,
} from '@/utils/apiError'

export interface UseApiErrorOptions {
  showToast?: boolean
  onAuthError?: () => void
  onPermissionError?: () => void
}

export const useApiError = (options: UseApiErrorOptions = {}) => {
  const { showToast = true, onAuthError, onPermissionError } = options
  const { addToast } = useToast()
  const [error, setError] = useState<ApiErrorInfo | null>(null)

  /**
   * 에러 처리 함수
   */
  const handleError = useCallback(
    (err: unknown) => {
      const errorInfo = handleApiError(err)
      setError(errorInfo)

      // Toast로 사용자에게 알림
      if (showToast) {
        const toastVariant = getToastVariantForErrorType(errorInfo.type)
        addToast(errorInfo.message, { variant: toastVariant })
      }

      // 특정 에러에 대한 콜백 실행
      if (errorInfo.type === 'auth' && onAuthError) {
        onAuthError()
      }

      if (errorInfo.type === 'permission' && onPermissionError) {
        onPermissionError()
      }

      // 개발자 콘솔에도 에러 출력
      if (import.meta.env.DEV) {
        console.error('[API Error]', errorInfo)
      }

      return errorInfo
    },
    [showToast, addToast, onAuthError, onPermissionError]
  )

  /**
   * Fetch Response 기반 에러 처리
   */
  const handleResponseError = useCallback(
    async (response: Response) => {
      const errorInfo = await handleFetchError(response)
      setError(errorInfo)

      // Toast로 사용자에게 알림
      if (showToast) {
        const toastVariant = getToastVariantForErrorType(errorInfo.type)
        addToast(errorInfo.message, { variant: toastVariant })
      }

      // 특정 에러에 대한 콜백 실행
      if (errorInfo.type === 'auth' && onAuthError) {
        onAuthError()
      }

      if (errorInfo.type === 'permission' && onPermissionError) {
        onPermissionError()
      }

      // 개발자 콘솔에도 에러 출력
      if (import.meta.env.DEV) {
        console.error('[API Error]', errorInfo)
      }

      return errorInfo
    },
    [showToast, addToast, onAuthError, onPermissionError]
  )

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    handleResponseError,
    clearError,
    isError: error !== null,
    errorMessage: error?.message || '',
    errorType: error?.type,
  }
}
