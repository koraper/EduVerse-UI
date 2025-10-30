import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

// Button 컴포넌트 타입
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

// Input 컴포넌트 타입
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  maxLength?: number
  showLengthCounter?: boolean
  onLengthChange?: (length: number) => void
}

// Textarea 컴포넌트 타입
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  resize?: boolean
  showLengthCounter?: boolean
  onLengthChange?: (length: number) => void
}

// Select 컴포넌트 타입
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: ButtonSize
  options?: SelectOption[]
  placeholder?: string
  children?: ReactNode
}

// Modal 컴포넌트 타입
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdropClick?: boolean
  closeOnEsc?: boolean
  showCloseButton?: boolean
}

// Card 컴포넌트 타입
export interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
  onClick?: () => void
}

// Badge 컴포넌트 타입
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'blue' | 'purple' | 'gray'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  pill?: boolean
  dot?: boolean
  className?: string
  onClick?: () => void
}

// Spinner 컴포넌트 타입
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  className?: string
}

// Loading 컴포넌트 타입
export interface LoadingProps {
  fullScreen?: boolean
  text?: string
  size?: SpinnerSize
}

// Toast 컴포넌트 타입
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastContextType {
  toasts: ToastProps[]
  addToast: (
    message: string,
    options?: {
      variant?: ToastVariant
      duration?: number
      action?: ToastProps['action']
    }
  ) => void
  removeToast: (id: string) => void
}

export interface ToastProviderProps {
  children: ReactNode
}
