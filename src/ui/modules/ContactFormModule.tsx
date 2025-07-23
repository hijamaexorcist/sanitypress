'use client'
import { useState } from 'react'
import moduleProps from '@/lib/moduleProps'
import { cn } from '@/lib/utils'
import { getRecaptchaToken } from '@/lib/recaptcha'

export default function ContactFormModule({
  title,
  description,
  endpoint,
  showRecaptcha,
  reasonOptions,
  _key,
  ...props
}: {
  title?: string
  description?: string
  endpoint?: string
  showRecaptcha?: boolean
  reasonOptions?: string[]
  _key?: string
}) {
  const fallbackReasons = ['contact', 'feedback', 'referral']
  const reasons = reasonOptions?.length ? reasonOptions : fallbackReasons
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    reason: reasons[0] || 'contact',
    gCaptchaResponse: '',
  })
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    
    try {
      let submitData = { ...formData }
      
      // Debug logging
      console.log('showRecaptcha:', showRecaptcha)
      console.log('RECAPTCHA_SITE_KEY:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
      
      // reCAPTCHA integration
      if (showRecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        console.log('Attempting to get reCAPTCHA token...')
        try {
          const token = await getRecaptchaToken(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, 'submit')
          console.log('reCAPTCHA token received:', token?.substring(0, 20) + '...')
          submitData.gCaptchaResponse = token
        } catch (recaptchaError) {
          console.error('reCAPTCHA error:', recaptchaError)
          throw new Error('reCAPTCHA verification failed')
        }
      } else {
        console.log('reCAPTCHA skipped - showRecaptcha:', showRecaptcha)
      }
      
      console.log('Submitting data:', { ...submitData, gCaptchaResponse: submitData.gCaptchaResponse?.substring(0, 20) + '...' })
      
      const res = await fetch(endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(submitData),
      })
      
      const responseData = await res.json()
      console.log('Response:', responseData)
      
      if (!res.ok) throw new Error('Submission failed')
      
      setStatus('success')
      setFormData({ 
        name: '', 
        email: '', 
        message: '', 
        reason: reasons[0] || 'contact', 
        gCaptchaResponse: '' 
      })
    } catch (err) {
      console.error('Form submission error:', err)
      setStatus('error')
    }
  }
  
  return (
    <section
      className="section max-w-2xl mx-auto space-y-6"
      {...moduleProps({ _key, ...props })}
    >
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Your name"
          required
          className="input w-full"
          value={formData.name}
          onChange={handleChange}
        />
        
        <input
          name="email"
          type="email"
          placeholder="Your email"
          required
          className="input w-full"
          value={formData.email}
          onChange={handleChange}
        />
        
        <select
          name="reason"
          className="input w-full"
          value={formData.reason}
          onChange={handleChange}
        >
          {reasons.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
        
        <textarea
          name="message"
          placeholder="Your message"
          required
          className="textarea w-full"
          rows={5}
          value={formData.message}
          onChange={handleChange}
        />
        
        {status === 'success' && <p className="text-green-600">Thank you! We'll be in touch.</p>}
        {status === 'error' && <p className="text-red-600">Something went wrong. Try again.</p>}
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      
      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 mt-4">
        <p>Debug: reCAPTCHA enabled: {showRecaptcha ? 'Yes' : 'No'}</p>
        <p>Debug: Site key exists: {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? 'Yes' : 'No'}</p>
      </div>
    </section>
  )
}