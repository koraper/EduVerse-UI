import { useState, useEffect } from 'react'

/**
 * useDebounce Hook
 * 값 변경을 지연시켜 빈번한 업데이트를 방지합니다.
 *
 * @param value - debounce할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns debounced 값
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebounce(searchQuery, 1000)
 *
 * useEffect(() => {
 *   // debouncedQuery가 변경될 때만 API 호출
 *   fetchResults(debouncedQuery)
 * }, [debouncedQuery])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // delay 후에 값을 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 다음 effect 실행 전 또는 컴포넌트 unmount 시 타이머 클리어
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
