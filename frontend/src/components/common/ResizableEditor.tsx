import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'

interface ResizableEditorProps {
  value: string
  language: string
  theme: string
  options: any
  initialHeight?: number
  minHeight?: number
  maxHeight?: number
}

const ResizableEditor = ({
  value,
  language,
  theme,
  options,
  initialHeight = 300,
  minHeight = 150,
  maxHeight = 800
}: ResizableEditorProps) => {
  const [height, setHeight] = useState(initialHeight)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startYRef.current = e.clientY
    startHeightRef.current = height
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaY = e.clientY - startYRef.current
      const newHeight = Math.min(
        Math.max(startHeightRef.current + deltaY, minHeight),
        maxHeight
      )
      setHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minHeight, maxHeight])

  return (
    <div ref={containerRef} className="relative">
      <Editor
        height={`${height}px`}
        language={language}
        value={value}
        theme={theme}
        options={options}
      />
      <div
        onMouseDown={handleMouseDown}
        className={`absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize group ${
          isResizing ? 'bg-primary-500/30' : 'hover:bg-primary-500/20'
        } transition-colors`}
      >
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-0.5">
          <div className="flex gap-1">
            <div className={`w-8 h-0.5 rounded-full ${
              isResizing ? 'bg-primary-500' : 'bg-gray-400 group-hover:bg-primary-500'
            } transition-colors`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResizableEditor
