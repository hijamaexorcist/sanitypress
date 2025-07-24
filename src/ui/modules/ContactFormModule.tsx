'use client'
import { useState } from 'react'
import moduleProps from '@/lib/moduleProps'
import { getRecaptchaToken } from '@/lib/recaptcha'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Youtube, 
  Linkedin,
  Twitter,
  Facebook,
  Send,
  User,
  MessageSquare,
  ChevronDown
} from 'lucide-react'

// Social platform icon mapping
const socialIcons = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: MessageSquare, // Using MessageSquare as placeholder for TikTok
}

interface ContactFormModuleProps {
  title?: string
  description?: string
  endpoint?: string
  showRecaptcha?: boolean
  reasonOptions?: string[]
  contactInfo?: {
    heading?: string
    email?: string
    phone?: string
    address?: string
  }
  socialLinks?: {
    heading?: string
    links?: Array<{
      platform: keyof typeof socialIcons
      url: string
      label?: string
    }>
  }
  messages?: {
    success?: string
    error?: string
    submitButton?: string
    submittingButton?: string
  }
  _key?: string
}

export default function ContactFormModule({
  title = 'Get in Touch',
  description = 'Have a question or want to work together? Drop us a message!',
  endpoint,
  showRecaptcha,
  reasonOptions,
  contactInfo,
  socialLinks,
  messages = {
    success: 'Thank you for your message! We\'ll get back to you soon.',
    error: 'Something went wrong. Please try again later.',
    submitButton: 'Send Message',
    submittingButton: 'Sending...',
  },
  _key,
  ...props
}: ContactFormModuleProps) {
  const fallbackReasons = ['General Inquiry', 'Partnership', 'Support', 'Feedback']
  const reasons = reasonOptions?.length ? reasonOptions : fallbackReasons
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    reason: reasons[0] || 'General Inquiry',
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
      
      if (showRecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        try {
          const token = await getRecaptchaToken(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, 'submit')
          submitData.gCaptchaResponse = token
        } catch (recaptchaError) {
          throw new Error('reCAPTCHA verification failed')
        }
      }
      
      const res = await fetch(endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(submitData),
      })
      
      if (!res.ok) throw new Error('Submission failed')
      
      setStatus('success')
      setFormData({ 
        name: '', 
        email: '', 
        message: '', 
        reason: reasons[0] || 'General Inquiry', 
        gCaptchaResponse: '' 
      })
      
      // Reset status after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      console.error('Form submission error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }
  
  return (
    <section
      className="section py-16 lg:py-24"
      {...moduleProps({ _key, ...props })}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Info & Social Links Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-muted-foreground text-lg">{description}</p>
            </div>
            
            {/* Contact Information */}
            {contactInfo && (contactInfo.email || contactInfo.phone || contactInfo.address) && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  {contactInfo.heading || 'Contact Information'}
                </h3>
                
                <div className="space-y-3">
                  {contactInfo.email && (
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <span>{contactInfo.email}</span>
                    </a>
                  )}
                  
                  {contactInfo.phone && (
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <span>{contactInfo.phone}</span>
                    </a>
                  )}
                  
                  {contactInfo.address && (
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <span className="whitespace-pre-line">{contactInfo.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Social Links */}
            {socialLinks?.links && socialLinks.links.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  {socialLinks.heading || 'Follow Us'}
                </h3>
                
                <div className="flex gap-3">
                  {socialLinks.links.map((link, index) => {
                    const Icon = socialIcons[link.platform] || MessageSquare
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                        aria-label={link.label || `Follow us on ${link.platform}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Form Column */}
          <div className="lg:col-span-3">
            <div className="bg-muted/50 rounded-2xl p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      name="name"
                      placeholder="Your name"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Your email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Reason Dropdown */}
                <div className="relative">
                  <select
                    name="reason"
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                    value={formData.reason}
                    onChange={handleChange}
                  >
                    {reasons.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
                
                {/* Message */}
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <textarea
                    name="message"
                    placeholder="Your message"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Status Messages */}
                {status === 'success' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                    {messages.success}
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                    {messages.error}
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {messages.submittingButton}
                    </>
                  ) : (
                    <>
                      {messages.submitButton}
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}