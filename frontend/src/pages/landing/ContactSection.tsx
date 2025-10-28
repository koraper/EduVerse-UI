import { useState } from 'react'
import { Button } from '@/components/common'
import {
  FORM_INPUT_LIMITS,
  validateName,
  validateEmail,
  validatePhone,
  validateOrganization,
  validateMessage,
  applyInputLimit,
  formatCharCount,
  getInputErrorClass,
  type ValidationErrors,
} from '@/utils/formValidation'

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    message: '',
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // 전체 폼 검증
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      organization: validateOrganization(formData.organization),
      message: validateMessage(formData.message),
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== undefined)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // 실시간 길이 제한 적용
    let limitedValue = value
    const limits: Record<string, number> = {
      name: FORM_INPUT_LIMITS.name.max,
      email: FORM_INPUT_LIMITS.email.max,
      organization: FORM_INPUT_LIMITS.organization.max,
      message: FORM_INPUT_LIMITS.message.max,
    }

    if (limits[name]) {
      limitedValue = applyInputLimit(value, limits[name])
    }

    setFormData((prev) => ({ ...prev, [name]: limitedValue }))

    // 입력 중 해당 필드 에러 제거
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 폼 검증
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    // Mock API call - replace with actual API endpoint
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Contact form submitted:', formData)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', organization: '', message: '' })
      setErrors({})
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              문의하기
            </h2>
            <p className="text-lg text-gray-300">
              EduVerse에 대해 궁금한 점이 있으신가요? 언제든지 문의해 주세요.
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-700 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-600">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                  이름 <span className="text-red-400">*</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatCharCount(formData.name.length, FORM_INPUT_LIMITS.name.max)}
                  </span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={getInputErrorClass(
                    !!errors.name,
                    'w-full px-4 py-3 bg-gray-600 border text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                  )}
                  placeholder="홍길동"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  이메일 <span className="text-red-400">*</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatCharCount(formData.email.length, FORM_INPUT_LIMITS.email.max)}
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputErrorClass(
                    !!errors.email,
                    'w-full px-4 py-3 bg-gray-600 border text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                  )}
                  placeholder="hong@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                  연락처 <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={getInputErrorClass(
                    !!errors.phone,
                    'w-full px-4 py-3 bg-gray-600 border text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                  )}
                  placeholder="010-1234-5678 또는 02-1234-5678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-semibold text-gray-300 mb-2">
                  소속 기관
                  <span className="text-xs text-gray-400 ml-2">
                    {formatCharCount(formData.organization.length, FORM_INPUT_LIMITS.organization.max)}
                  </span>
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className={getInputErrorClass(
                    !!errors.organization,
                    'w-full px-4 py-3 bg-gray-600 border text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                  )}
                  placeholder="OO대학교 컴퓨터공학과"
                />
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-400">{errors.organization}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                  문의 내용 <span className="text-red-400">*</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatCharCount(formData.message.length, FORM_INPUT_LIMITS.message.max)}
                  </span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={getInputErrorClass(
                    !!errors.message,
                    'w-full px-4 py-3 bg-gray-600 border text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y'
                  )}
                  placeholder="문의하실 내용을 자유롭게 작성해 주세요."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                )}
              </div>

              {/* Submit Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-900/50 border border-green-600 rounded-lg">
                  <p className="text-green-300 font-medium">
                    ✓ 문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변 드리겠습니다.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg">
                  <p className="text-red-300 font-medium">
                    ✗ 문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? '전송 중...' : '문의 보내기'}
              </Button>
            </form>
          </div>

          {/* Additional Contact Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gray-700 rounded-lg shadow-sm border border-gray-600">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">이메일</h3>
              <p className="text-gray-300">support@eduverse.com</p>
            </div>

            <div className="p-6 bg-gray-700 rounded-lg shadow-sm border border-gray-600">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">전화</h3>
              <p className="text-gray-300">02-1234-5678</p>
            </div>

            <div className="p-6 bg-gray-700 rounded-lg shadow-sm border border-gray-600">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">운영 시간</h3>
              <p className="text-gray-300">평일 09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
