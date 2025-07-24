'use client'
import { useState, useEffect } from 'react'
import moduleProps from '@/lib/moduleProps'
import { getRecaptchaToken } from '@/lib/recaptcha'
import moment from 'moment-hijri'
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  User,
  Mail,
  Stethoscope,
  FileText,
  Package,
  Shirt,
  Info,
  Moon,
  Star
} from 'lucide-react'

interface AppointmentFormModuleProps {
  title?: string
  description?: string
  endpoint?: string
  showRecaptcha?: boolean
  serviceTypes?: Array<{
    name: string
    duration: number
    price?: string
  }>
  timeSlots?: string[]
  locationInfo?: {
    address?: string
    mapUrl?: string
  }
  paymentInfo?: {
    depositRequired?: boolean
    depositAmount?: string
    paymentMethods?: Array<{
      method: string
      recipient: string
      details: string
    }>
  }
  prepInstructions?: {
    title?: string
    bringItems?: string[]
    wearItems?: string[]
    beforeSession?: string[]
    specialNotes?: string[]
  }
  messages?: {
    success?: string
    error?: string
  }
  _key?: string
}

// Accurate Hijri date conversion using moment-hijri
function getHijriDate(gregorianDate: Date): { day: number, month: string, year: number } {
  const m = moment(gregorianDate);
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
  ];
  
  return { 
    day: m.iDate(),
    month: hijriMonths[m.iMonth()],
    year: m.iYear()
  };
}

// Check if a date is a Sunnah day for Hijama (13th,14th,15th,17th,19th,21st of lunar month)
function isSunnahDay(date: Date): boolean {
  const hijriDay = moment(date).iDate();
  return hijriDay === 13 || hijriDay === 14 || hijriDay === 15 || 
         hijriDay === 17 || hijriDay === 19 || hijriDay === 21;
}

// Get the current month's Sunnah days
function getSunnahDaysForMonth(year: number, month: number): Date[] {
  const sunnahDays: Date[] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  let current = new Date(startDate);
  while (current <= endDate) {
    if (isSunnahDay(current)) {
      sunnahDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return sunnahDays;
}

export default function AppointmentFormModule({
  title = 'Book Your Hijama Appointment',
  description = 'Schedule your Hijama session with our experienced practitioner',
  endpoint,
  showRecaptcha,
  serviceTypes = [],
  timeSlots = [],
  locationInfo,
  paymentInfo,
  prepInstructions,
  messages = {
    success: 'Thank you for booking! We\'ll confirm your appointment once the deposit is received.',
    error: 'Something went wrong. Please try again or call us directly.',
  },
  _key,
  ...props
}: AppointmentFormModuleProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get date string for min attribute (tomorrow)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]
  
  // Get date string for max attribute (30 days from now)
  const maxDateObj = new Date(today)
  maxDateObj.setDate(maxDateObj.getDate() + 30)
  const maxDate = maxDateObj.toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: serviceTypes[0]?.name || '',
    date: '',
    time: '',
    additionalNotes: '',
    gCaptchaResponse: '',
  })
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedDateInfo, setSelectedDateInfo] = useState<{ hijri: any, isSunnah: boolean } | null>(null)
  const [currentMonthSunnahDays, setCurrentMonthSunnahDays] = useState<Date[]>([])
  
  // Update Sunnah days when component mounts
  useEffect(() => {
    const now = new Date()
    const sunnahDays = getSunnahDaysForMonth(now.getFullYear(), now.getMonth())
    setCurrentMonthSunnahDays(sunnahDays)
  }, [])
  
  // Update selected date info when date changes
  useEffect(() => {
    if (formData.date) {
      const selectedDate = new Date(formData.date)
      const hijriDate = getHijriDate(selectedDate)
      const isSunnah = isSunnahDay(selectedDate)
      setSelectedDateInfo({ hijri: hijriDate, isSunnah })
    } else {
      setSelectedDateInfo(null)
    }
  }, [formData.date])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    
    try {
      let submitData = { ...formData }
      
      // Format the date for display
      const dateObj = new Date(formData.date)
      submitData.date = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
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
        phone: '',
        service: serviceTypes[0]?.name || '',
        date: '',
        time: '',
        additionalNotes: '',
        gCaptchaResponse: '' 
      })
    } catch (err) {
      console.error('Form submission error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  return (
    <section
      className="section py-16 lg:py-24"
      {...moduleProps({ _key, ...props })}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-10">
              <h2 className="text-2xl font-semibold mb-6">Schedule Your Session</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Personal Information</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        name="name"
                        placeholder="Full name"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Phone number"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Select Service</h3>
                  
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <select
                      name="service"
                      className="w-full pl-10 pr-10 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                      value={formData.service}
                      onChange={handleChange}
                      required
                    >
                      {serviceTypes.map((service) => (
                        <option key={service.name} value={service.name}>
                          {service.name} - {service.duration} min {service.price && `- ${service.price}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Choose Date & Time</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="date"
                        name="date"
                        className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        value={formData.date}
                        onChange={handleChange}
                        min={minDate}
                        max={maxDate}
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <select
                        name="time"
                        className="w-full pl-10 pr-10 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Hijri Date Info */}
                  {selectedDateInfo && (
                    <div className={`p-4 rounded-lg ${selectedDateInfo.isSunnah ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-muted/50'}`}>
                      <div className="flex items-start gap-3">
                        <Moon className={`w-5 h-5 mt-0.5 ${selectedDateInfo.isSunnah ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Hijri Date: {selectedDateInfo.hijri.day} {selectedDateInfo.hijri.month} {selectedDateInfo.hijri.year}
                          </p>
                          {selectedDateInfo.isSunnah && (
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1 flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              Sunnah Day - Recommended for Hijama!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Additional Information</h3>
                  
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <textarea
                      name="additionalNotes"
                      placeholder="Any specific areas of concern, health conditions, or special requests..."
                      className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                      rows={4}
                      value={formData.additionalNotes}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{messages.success}</p>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{messages.error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Booking Appointment...
                    </span>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Sunnah Days Info */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                Sunnah Days for Hijama
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                The Prophet ﷺ recommended Hijama on the 17th, 19th, and 21st of the lunar month. 
                Also beneficial are the "white days" - 13th, 14th, and 15th.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">This month's Sunnah days:</p>
                {currentMonthSunnahDays.length > 0 ? (
                  <div className="space-y-1">
                    {currentMonthSunnahDays.map((date, i) => (
                      <p key={i} className="text-sm text-green-700 dark:text-green-400">
                        {formatDateForDisplay(date)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Calculating...</p>
                )}
              </div>
            </div>
            
            {/* Location Info */}
            {locationInfo && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">{locationInfo.address}</p>
                {locationInfo.mapUrl && (
                  <a 
                    href={locationInfo.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-primary hover:underline"
                  >
                    View on Google Maps
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* Payment Info */}
            {paymentInfo && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Payment Information
                </h3>
                {paymentInfo.depositRequired && (
                  <p className="text-muted-foreground mb-4">
                    A deposit of <span className="font-semibold text-foreground">{paymentInfo.depositAmount}</span> is required to confirm your appointment.
                  </p>
                )}
                {paymentInfo.paymentMethods?.map((method, index) => (
                  <div key={index} className="space-y-1">
                    <p className="font-medium">{method.method}</p>
                    <p className="text-sm text-muted-foreground">{method.recipient}</p>
                    <p className="text-sm text-muted-foreground">{method.details}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Prep Instructions Toggle */}
            {prepInstructions && (
              <div className="bg-muted/30 rounded-xl p-6">
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between font-semibold text-lg hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    {prepInstructions.title || 'Preparation Instructions'}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
                </button>
                
                {showInstructions && (
                  <div className="mt-4 space-y-4">
                    {prepInstructions.bringItems && prepInstructions.bringItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          What to Bring
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {prepInstructions.bringItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {prepInstructions.wearItems && prepInstructions.wearItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-primary" />
                          What to Wear
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {prepInstructions.wearItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {prepInstructions.beforeSession && prepInstructions.beforeSession.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Before Your Session</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {prepInstructions.beforeSession.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {prepInstructions.specialNotes && prepInstructions.specialNotes.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <h4 className="font-medium mb-2 text-sm">Special Notes</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {prepInstructions.specialNotes.map((note, i) => (
                            <li key={i} className="bg-primary/5 p-3 rounded-lg">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}