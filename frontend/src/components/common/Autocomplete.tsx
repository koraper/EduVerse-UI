import { forwardRef, useRef, useEffect, useState, ReactNode } from 'react'
import { Search, X } from 'lucide-react'

export interface AutocompleteProps<T> {
  value: string
  onChange: (value: string) => void
  onSelect?: (item: T) => void
  suggestions: T[]
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  renderSuggestion: (item: T, isHighlighted: boolean) => ReactNode
  getSuggestionKey: (item: T) => string | number
  getSuggestionValue?: (item: T) => string
  minCharsToShow?: number
  maxSuggestions?: number
  clearOnSelect?: boolean
}

const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps<any>>(
  (
    {
      value,
      onChange,
      onSelect,
      suggestions = [],
      isLoading = false,
      disabled = false,
      placeholder = '검색...',
      label,
      error,
      helperText,
      size = 'md',
      renderSuggestion,
      getSuggestionKey,
      getSuggestionValue,
      minCharsToShow = 1,
      maxSuggestions = 10,
      clearOnSelect = false,
    },
    _ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // 기본 스타일
    const baseInputStyles = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100'

    const stateStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    }

    const suggestionsListSize = {
      sm: 'max-h-48',
      md: 'max-h-60',
      lg: 'max-h-72',
    }

    // 검색 결과가 있으면 드롭다운 열기
    useEffect(() => {
      setIsOpen(value.length >= minCharsToShow && suggestions.length > 0)
      setHighlightedIndex(-1)
    }, [value, suggestions, minCharsToShow])

    // 클릭 외부 감지
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // 키보드 네비게이션
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' && suggestions.length > 0) {
          e.preventDefault()
          setIsOpen(true)
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            handleSelectSuggestion(suggestions[highlightedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          break
        default:
          break
      }
    }

    const handleSelectSuggestion = (suggestion: any) => {
      if (onSelect) {
        onSelect(suggestion)
      }
      if (clearOnSelect) {
        onChange('')
      } else if (getSuggestionValue) {
        onChange(getSuggestionValue(suggestion))
      }
      setIsOpen(false)
      setHighlightedIndex(-1)
    }

    const handleClear = () => {
      onChange('')
      inputRef.current?.focus()
    }

    // 하이라이트된 항목이 보이도록 스크롤
    useEffect(() => {
      if (highlightedIndex >= 0 && suggestionsRef.current) {
        const highlightedElement = suggestionsRef.current.children[
          highlightedIndex
        ] as HTMLElement
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ block: 'nearest' })
        }
      }
    }, [highlightedIndex])

    const displayedSuggestions = suggestions.slice(0, maxSuggestions)

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (value.length >= minCharsToShow && suggestions.length > 0) {
                  setIsOpen(true)
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              className={`${baseInputStyles} ${stateStyles} ${sizeStyles[size]} pl-10 ${value ? 'pr-10' : ''}`}
            />

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {isOpen && (
            <div
              ref={suggestionsRef}
              className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto ${suggestionsListSize[size]}`}
            >
              {isLoading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                  </div>
                  <p className="mt-2 text-sm">로드 중...</p>
                </div>
              ) : displayedSuggestions.length > 0 ? (
                <ul className="py-1">
                  {displayedSuggestions.map((suggestion, index) => (
                    <li
                      key={getSuggestionKey(suggestion)}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`px-4 py-2 cursor-pointer transition-colors ${
                        index === highlightedIndex
                          ? 'bg-indigo-50 text-indigo-900'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {renderSuggestion(suggestion, index === highlightedIndex)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">검색 결과가 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Autocomplete.displayName = 'Autocomplete'

export default Autocomplete
