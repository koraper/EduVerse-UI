import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './useDebounce'

export interface UseSearchSuggestionsOptions {
  debounceDelay?: number
  minChars?: number
  maxSuggestions?: number
}

export interface UseSearchSuggestionsResult<T> {
  suggestions: T[]
  isLoading: boolean
  error: string | null
}

/**
 * 검색 자동완성을 위한 훅
 *
 * @param query - 검색어
 * @param fetchFn - 검색어를 받아서 제안 목록을 반환하는 함수
 * @param options - 옵션 (debounceDelay, minChars, maxSuggestions)
 * @returns 제안 목록, 로딩 상태, 에러
 *
 * @example
 * const { suggestions, isLoading, error } = useSearchSuggestions(
 *   searchQuery,
 *   async (query) => {
 *     const response = await fetch(`/api/admin/users/search?q=${query}`)
 *     const data = await response.json()
 *     return data.results
 *   },
 *   { debounceDelay: 300, minChars: 2 }
 * )
 */
export function useSearchSuggestions<T>(
  query: string,
  fetchFn: (query: string) => Promise<T[]>,
  options: UseSearchSuggestionsOptions = {}
): UseSearchSuggestionsResult<T> {
  const {
    debounceDelay = 300,
    minChars = 1,
    maxSuggestions = 10,
  } = options

  const [suggestions, setSuggestions] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce된 검색어
  const debouncedQuery = useDebounce(query, debounceDelay)

  // 검색 실행
  useEffect(() => {
    if (debouncedQuery.trim().length < minChars) {
      setSuggestions([])
      setError(null)
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await fetchFn(debouncedQuery.trim())
        setSuggestions(results.slice(0, maxSuggestions))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '검색 중 오류가 발생했습니다'
        )
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, minChars, maxSuggestions, fetchFn])

  return { suggestions, isLoading, error }
}

/**
 * 클라이언트 사이드 검색 제안을 위한 훅
 * 로컬 데이터셋에서 필터링하여 제안 반환
 */
export function useClientSearchSuggestions<T>(
  query: string,
  items: T[],
  filterFn: (item: T, query: string) => boolean,
  options: Omit<UseSearchSuggestionsOptions, 'debounceDelay'> & { debounceDelay?: number } = {}
): UseSearchSuggestionsResult<T> {
  const {
    debounceDelay = 100,
    minChars = 1,
    maxSuggestions = 10,
  } = options

  const [suggestions, setSuggestions] = useState<T[]>([])
  const debouncedQuery = useDebounce(query, debounceDelay)

  useEffect(() => {
    if (debouncedQuery.trim().length < minChars) {
      setSuggestions([])
      return
    }

    const filtered = items
      .filter((item) => filterFn(item, debouncedQuery.trim()))
      .slice(0, maxSuggestions)

    setSuggestions(filtered)
  }, [debouncedQuery, items, filterFn, minChars, maxSuggestions])

  return { suggestions, isLoading: false, error: null }
}
