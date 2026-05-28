'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BackupTracker } from '@/lib/backup-tracker'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import WeeklySlotPicker from '@/components/WeeklySlotPicker'
import {
  Phone,
  MessageSquare,
  Calendar,
  CreditCard,
  Users,
  Star,
  ChevronRight,
  Check,
  Globe,
  Headphones,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  Lock,
  Timer,
  Award,
  Heart,
  Bot,
  X,
  Menu,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react'

/* ──────────────────── Helper Functions ──────────────────── */

/**
 * Safely call MassaProAffiliate methods without throwing.
 * [MassaPro] console errors are already suppressed globally by the
 * permanent interceptor in layout.tsx (runs before the tracker script loads).
 * This wrapper just prevents thrown exceptions from breaking the form flow.
 */
function safeMassaProCall(fn: () => void) {
  if (typeof window === 'undefined') return
  try {
    fn()
  } catch {
    // Tracker unavailable — fail silently
  }
}

function handleGetNowClick(location: string) {
  // Meta Pixel: FreeConsultClick (same event as homepage for ad optimization)
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    ;(window as any).fbq('trackCustom', 'FreeConsultClick', { button_location: location, page_name: 'Expert', cta: 'consultation' })
  }
  // MassaPro Affiliate Tracker: track CTA click
  safeMassaProCall(() => {
    if (typeof (window as any).MassaProAffiliate === 'object' && typeof (window as any).MassaProAffiliate.trackEvent === 'function') {
      ;(window as any).MassaProAffiliate.trackEvent('btn_get_now')
    }
  })
  // Google Analytics 4: track CTA click
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('event', 'get_now', { button_location: location, page_name: 'Expert' })
  }
  // Scroll to the hero form
  const formEl = document.getElementById('expert-lead-form')
  if (formEl) {
    formEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/* ──────────────────── Countdown Timer Hook ──────────────────── */
function useCountdown(minutes: number) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const endTime = Date.now() + minutes * 60 * 1000

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now())
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [minutes])

  return timeLeft
}

/* ──────────────────── Scroll Animation Hook ──────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/* ──────────────────── Navbar (minimal for pitch page) ──────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-purple-100/50 border-b border-purple-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/massapro-logo-v2.png"
              alt="MassaPro Logo"
              width={160}
              height={48}
              className="h-10 w-auto lg:h-12"
              priority
            />
          </a>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              className="purple-gradient text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-300/30 animate-pulse-glow"
              onClick={() => handleGetNowClick('Header')}
            >
              Get Started Now <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <button
            className="lg:hidden p-2 text-purple-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Button className="purple-gradient text-white w-full" onClick={() => { handleGetNowClick('Header'); setMobileOpen(false); }}>
              Get Started Now
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ──────────────────── HERO SECTION (paidcreators.com/prompt style) ──────────────────── */
/* Title above, picture on the left bottom, lead form on the right — 2-step form */

function HeroSection() {
  const searchParams = useSearchParams()

  // Capture UTM parameters from URL on mount (same as homepage LeadForm)
  const [utmParams] = useState(() => ({
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_content: searchParams.get('utm_content') || '',
    utm_term: searchParams.get('utm_term') || '',
  }))

  // Step state: 1 = personal info, 2 = calendar + notes
  const [formStep, setFormStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formOpenTracked, setFormOpenTracked] = useState(false)

  // Step 1 fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')

  // Ensure lastName has a fallback for API validation (API requires lastName)
  const effectiveLastName = lastName.trim() || 'N/A'

  // Step 2 fields
  const [appointmentSlotId, setAppointmentSlotId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [notes, setNotes] = useState('')
  const [bookedRanges, setBookedRanges] = useState<Array<{ startMs: number; endMs: number }>>([])

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimezone(tz)
    } catch {
      setTimezone('America/New_York')
    }
  }, [])

  // Track form open event on first mount (same as homepage LeadForm)
  useEffect(() => {
    if (!formOpenTracked) {
      setFormOpenTracked(true)
      // MassaPro Affiliate Tracker: track form open
      safeMassaProCall(() => {
        if (typeof (window as any).MassaProAffiliate === 'object' && typeof (window as any).MassaProAffiliate.trackLeadFormOpen === 'function') {
          ;(window as any).MassaProAffiliate.trackLeadFormOpen()
        }
      })
      // Meta Pixel: custom event
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('trackCustom', 'LeadFormOpen')
      }
      // Google Analytics 4: custom event
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        ;(window as any).gtag('event', 'lead_form_open', {
          event_category: 'engagement',
          event_label: 'Lead Form Opened',
          page_name: 'Expert',
        })
      }
    }
  }, [formOpenTracked])

  // Fetch booked slots on mount AND when step 2 appears
  // (same as homepage LeadForm which fetches on dialog open)
  useEffect(() => {
    fetchBookedSlots()
  }, [])

  useEffect(() => {
    if (formStep === 2) {
      fetchBookedSlots()
    }
  }, [formStep])

  const fetchBookedSlots = async () => {
    try {
      const res = await fetch('/api/available-slots')
      if (res.ok) {
        const data = await res.json()
        setBookedRanges(data.bookedRanges || [])
      }
    } catch {
      console.warn('Could not fetch booked slots')
    }
  }

  // Handle slot selection from WeeklySlotPicker
  const handleSlotSelect = useCallback((slotId: string, dateISO: string, timeIsrael: string) => {
    setAppointmentSlotId(slotId)
    setAppointmentDate(dateISO)
    setAppointmentTime(timeIsrael)
  }, [])

  // Step 1 → Step 2 (just validates, no API call)
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !email.trim() || !mobile.trim()) {
      setError('Please fill in all required fields (First Name, Email, Phone).')
      return
    }
    setError('')
    setFormStep(2)
  }

  // Step 2 → Submit (same API + tracking as home page LeadForm)
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointmentSlotId) {
      setError('Please select a time slot for your consultation.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName: effectiveLastName,
          email,
          mobile,
          companyUrl,
          industry: 'Other',
          country: 'United States',
          appointmentDate,
          appointmentTime,
          appointmentSlotId,
          timezone,
          serviceType: 'AI Secretary / Virtual Assistant',
          planType: 'Not Sure Yet',
          notes: notes || 'Lead from /expert page',
          ...utmParams,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes('already booked') || data.error?.includes('slot')) {
          fetchBookedSlots()
        }
        throw new Error(data.error || 'Submission failed')
      }

      setSubmitted(true)

      // Add the newly booked slot locally
      const slotStartMs = new Date(appointmentSlotId).getTime()
      setBookedRanges(prev => [...prev, { startMs: slotStartMs, endMs: slotStartMs + 30 * 60 * 1000 }])

      // Meta Pixel: track Schedule event (same as home page)
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'Schedule')
      }

      // Google Analytics 4: track schedule conversion
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        ;(window as any).gtag('event', 'schedule', {
          event_category: 'conversion',
          event_label: 'Consultation Scheduled',
          page_name: 'Expert',
        })
      }

      // MassaPro Affiliate Tracker: track lead (same as home page)
      safeMassaProCall(() => {
        if (typeof (window as any).MassaProAffiliate === 'object' && typeof (window as any).MassaProAffiliate.trackLead === 'function') {
          ;(window as any).MassaProAffiliate.trackLead({
            lead_name: `${firstName} ${effectiveLastName}`,
            lead_email: email,
            lead_phone: mobile,
            lead_company: companyUrl || '',
            plan_type: 'Not Sure Yet',
            initial_status: 'Booked Call',
          })
        }
      })

      // Meta Pixel: CompleteRegistration (standard conversion event)
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'CompleteRegistration')
      }

      // Google Analytics 4: Complete Registration conversion event
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        ;(window as any).gtag('event', 'complete_registration', {
          event_category: 'conversion',
          event_label: 'Consultation Booked — Expert Page',
          page_name: 'Expert',
        })
      }

      // Local backup: track lead (same as home page)
      try {
        BackupTracker.trackLead({
          name: `${firstName} ${effectiveLastName}`,
          email,
          phone: mobile,
          company: companyUrl,
          planType: 'Not Sure Yet',
        })
      } catch (e) {
        console.debug('[MassaPro] Backup tracker skipped')
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-white pt-16 lg:pt-18">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title above - spanning full width */}
        <FadeIn>
          <div className="text-center pt-2 pb-4 lg:pt-4 lg:pb-5">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-1.5 text-sm font-medium mb-6 inline-flex">
              <Sparkles className="w-4 h-4 mr-1" />
              VIP AI Secretary & Concierge Services
            </Badge>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05] mb-3 max-w-4xl mx-auto">
              There Are Two Types of Hair-Salon Owners:{' '}
              <span className="purple-gradient-text">Those Who Never Miss a Call</span>
              {' '}And Those Who Lose $43,200/Year
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your AI Secretary handles calls, books appointments, and manages your entire front desk — 24/7.
              No sick days. No salary. No missed opportunities.
            </p>
          </div>
        </FadeIn>

        {/* Below title: Image on the left, Lead Form on the right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start pb-10 lg:pb-16">
          {/* Left: Hero Image */}
          <FadeIn delay={0.1} className="relative">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-purple-200/40 rounded-2xl rotate-12 blur-sm" />
              <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-purple-300/30 rounded-full blur-sm" />

              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/50 border border-purple-100">
                <Image
                  src="/hero-secretary-v2.png"
                  alt="Professional AI Secretary That Never Sleeps"
                  width={864}
                  height={1152}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-3 -left-3 sm:bottom-6 sm:-left-6 glass-card rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full purple-gradient flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Calls Managed</p>
                    <p className="text-xs text-purple-600 font-medium">2,847 this month</p>
                  </div>
                </div>
              </div>

              {/* Floating stat card 2 */}
              <div className="absolute -top-3 -right-3 sm:top-6 sm:-right-6 glass-card rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">No-Show Rate</p>
                    <p className="text-xs text-green-600 font-medium">Down 40%</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: 2-Step Lead Capture Form */}
          <FadeIn delay={0.2}>
            <div id="expert-lead-form" className="bg-white rounded-3xl shadow-2xl shadow-purple-200/50 border border-purple-200 p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              {/* Form decorative badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  LIMITED OFFER
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Get Your <span className="purple-gradient-text">AI Secretary</span>
                </h2>
                <p className="text-gray-600">Free consultation. No setup fee. Deploy in 48 hours.</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 text-sm font-medium ${formStep === 1 ? 'text-purple-700' : 'text-green-600'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${formStep === 1 ? 'purple-gradient text-white' : 'bg-green-100 text-green-600'}`}>
                    {formStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  Your Details
                </div>
                <div className="flex-1 h-0.5 bg-purple-100">
                  <div className={`h-full purple-gradient transition-all duration-500 ${formStep === 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center gap-2 text-sm font-medium ${formStep === 2 ? 'text-purple-700' : 'text-gray-400'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${formStep === 2 ? 'purple-gradient text-white' : 'bg-purple-100 text-purple-400'}`}>
                    2
                  </div>
                  Schedule
                </div>
              </div>

              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Thank You!</h3>
                  <p className="text-gray-600">Your consultation has been scheduled. A Google Meet link and confirmation email will be sent to <span className="font-semibold text-purple-700">{email}</span> shortly.</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* STEP 1: Personal Info */}
                  {formStep === 1 && (
                    <form onSubmit={handleStep1Next} data-massapro-handled="true" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="hero-fname">First Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="hero-fname"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                            className="border-purple-200 focus:border-purple-500 h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hero-lname">Last Name</Label>
                          <Input
                            id="hero-lname"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Smith"
                            className="border-purple-200 focus:border-purple-500 h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-email">Business Email <span className="text-red-500">*</span></Label>
                        <Input
                          id="hero-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@yourbusiness.com"
                          className="border-purple-200 focus:border-purple-500 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-phone">Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="hero-phone"
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="border-purple-200 focus:border-purple-500 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-url">Company URL</Label>
                        <Input
                          id="hero-url"
                          type="text"
                          value={companyUrl}
                          onChange={(e) => setCompanyUrl(e.target.value)}
                          placeholder="www.example.com"
                          className="border-purple-200 focus:border-purple-500 h-11"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 py-5 text-base font-semibold"
                      >
                        Next: Schedule Consultation
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          <span>100% Secure</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>256-bit Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>48hr Setup</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 text-center">
                        No spam. No obligation. Cancel anytime.
                      </p>
                    </form>
                  )}

                  {/* STEP 2: Calendar + Notes */}
                  {formStep === 2 && (
                    <form onSubmit={handleStep2Submit} data-massapro-handled="true" className="space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                          Schedule Consultation
                        </h3>
                        <WeeklySlotPicker
                          selectedSlot={appointmentSlotId}
                          onSelectSlot={handleSlotSelect}
                          bookedRanges={bookedRanges}
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                          Task & Flow Details
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="hero-notes">
                            Describe the tasks and flows you need
                          </Label>
                          <Textarea
                            id="hero-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., We need appointment booking with SMS reminders, payment deposit handling, and post-visit follow-up for our salon..."
                            className="border-purple-200 focus:border-purple-500 min-h-[100px]"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50 py-5"
                          onClick={() => { setFormStep(1); setError(''); }}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting || !appointmentSlotId}
                          className="flex-1 purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 py-5 text-base font-semibold disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Scheduling...
                            </>
                          ) : (
                            <>
                              Schedule Consultation
                              <ChevronRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>

                      <p className="text-xs text-gray-400 text-center">
                        No setup fee &bull; Free consultation &bull; Google Meet link sent to your email
                      </p>
                    </form>
                  )}
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Layer 1: Identity Fork ──────────────────── */
function IdentityForkSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 px-4 py-1.5 text-sm font-medium mb-4">
              <AlertTriangle className="w-4 h-4 mr-1" />
              The Hard Truth
            </Badge>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">
              There are two types of hair-salon owners reading this page right now.
            </p>

            <p>
              <strong>Type 1:</strong> The ones still answering every call themselves, juggling appointment books,
              chasing no-shows, and watching their evenings disappear into voicemails and text threads. They&apos;re
              working 12-hour days but their front desk is still a bottleneck. <span className="text-purple-700 font-semibold">They&apos;re losing
              $43,200 a year in missed calls alone.</span>
            </p>

            <p>
              <strong>Type 2:</strong> The ones who deployed an AI Secretary that answers every call in 2 seconds,
              books appointments while they sleep, sends automatic reminders that cut no-shows by 40%, and handles
              their entire front desk for a fraction of a human salary. <span className="text-purple-700 font-semibold">They&apos;re growing while
              their competition is still playing phone tag.</span>
            </p>

            <p className="text-xl font-semibold text-gray-900 pt-4">
              I bet you already know which type gets ahead.
            </p>

            <p className="text-gray-600">
              And here&apos;s the thing — it&apos;s not about working harder. The second type didn&apos;t hire more staff.
              They didn&apos;t find extra hours in the day. They just stopped doing work that a machine does <em>better</em>,
              <em> faster</em>, and <em>cheaper</em>.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-base px-8 py-6"
              onClick={() => handleGetNowClick('IdentityFork')}
            >
              I Want to Be Type 2 <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Layer 2: Brutal Truth ──────────────────── */
function BrutalTruthSection() {
  const painPoints = [
    {
      stat: '$43,200',
      label: 'lost per year from missed calls (avg. small business)',
      icon: Phone,
    },
    {
      stat: '62%',
      label: 'of callers won\'t call back if they reach voicemail',
      icon: MessageSquare,
    },
    {
      stat: '28%',
      label: 'average no-show rate without automated reminders',
      icon: Calendar,
    },
    {
      stat: '$4,800/mo',
      label: 'average cost of a full-time human receptionist (salary + benefits)',
      icon: CreditCard,
    },
    {
      stat: '3.5 hrs',
      label: 'wasted daily on manual scheduling, callbacks, and confirmations',
      icon: Clock,
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-purple-950 to-purple-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              The Brutal Truth Nobody Wants to Admit
            </h2>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Right now, your business is bleeding money. Not from bad marketing or wrong pricing — from
              the most basic operations that should run on autopilot.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-4 mb-12">
            <p className="text-purple-100 text-lg leading-relaxed">
              You&apos;re watching competitors with <strong>half your experience</strong> book out their calendars
              while you&apos;re stuck returning voicemails at 9 PM. You&apos;re sitting on a business that
              could grow 40% — but the front desk can&apos;t handle the volume you already have. And the worst part?
            </p>
            <p className="text-2xl font-bold text-center py-4">
              You&apos;re one missed call away from losing your next best client.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {painPoints.map((point, i) => (
            <FadeIn key={point.stat} delay={i * 0.08}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
                <point.icon className="w-8 h-8 mx-auto mb-3 text-purple-300" />
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">{point.stat}</p>
                <p className="text-xs sm:text-sm text-purple-200 leading-tight">{point.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-12 text-center">
            <p className="text-purple-200 text-lg mb-6">
              And you&apos;re paying $4,800/month for a human who takes lunch breaks, sick days, and quits without notice?
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-900 hover:bg-purple-50 shadow-xl text-base px-8 py-6 font-semibold"
              onClick={() => handleGetNowClick('BrutalTruth')}
            >
              There&apos;s a Better Way <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Layer 3: Window Frame ──────────────────── */
function WindowFrameSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 px-4 py-1.5 text-sm font-medium mb-4">
              <Timer className="w-4 h-4 mr-1" />
              The Window Is Open
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              You Missed E-commerce. You Missed Crypto. <span className="purple-gradient-text">Don&apos;t Miss This.</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <p>
              You remember the early days of every revolution. E-commerce in 2005. Social media marketing in 2010.
              Crypto in 2016. The people who moved first didn&apos;t just get ahead — they <strong>defined the market</strong>.
            </p>

            <p>
              You might be thinking: &ldquo;Another trend I&apos;m late to.&rdquo; But here&apos;s the reality that should
              excite you:
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-gray-800 font-semibold text-xl">4 reasons you&apos;re NOT late — you&apos;re EARLY:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full purple-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span><strong>97% of small businesses</strong> still don&apos;t have AI-powered reception. Your competitors haven&apos;t even heard of this yet.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full purple-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span>The AI receptionist market is projected to hit <strong>$4.5 billion by 2027</strong> — growing at 28% CAGR.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full purple-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span>Early adopters are seeing <strong>3x ROI within 90 days</strong> — not from cost savings, but from revenue that was previously invisible.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full purple-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <span>Businesses using AI receptionists report <strong>40% fewer no-shows</strong> and <strong>35% more bookings</strong> in the first month.</span>
                </li>
              </ul>
            </div>

            <p className="text-xl font-semibold text-gray-900 pt-2">
              The window is wide open. But it won&apos;t stay open forever.
            </p>

            <p className="text-gray-600">
              Within 18 months, every serious business in your industry will have an AI front desk. The question
              is whether you&apos;ll be the one setting the standard — or the one scrambling to catch up.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-base px-8 py-6"
              onClick={() => handleGetNowClick('WindowFrame')}
            >
              I&apos;m Ready to Move Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Layer 4: Mechanism Reveal ──────────────────── */
function MechanismRevealSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-1.5 text-sm font-medium mb-4">
              <Bot className="w-4 h-4 mr-1" />
              The MassaPro Method
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              AI Is the Goldmine. <span className="purple-gradient-text">MassaPro Is the Pickaxe.</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-6 text-lg leading-relaxed text-gray-700 mb-12">
            <p>
              See, most businesses are just buying a chatbot and hoping for the best. Then they&apos;re shocked
              when it sounds robotic, can&apos;t book appointments, and their customers hate it.
            </p>
            <p>
              It&apos;s like having the key to the world&apos;s biggest library... but not knowing which books to read.
            </p>
            <p>
              <strong>MassaPro isn&apos;t a chatbot.</strong> It&apos;s a complete AI workforce system — trained on
              500+ real business workflows, customized for your industry, and deployed with a dedicated AI
              optimization team that constantly improves your results.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Phone,
                title: 'AI Receptionist',
                desc: 'Answers every call in 2 seconds, routes intelligently, and never misses a lead — 24/7/365.',
              },
              {
                icon: Calendar,
                title: 'AI Secretary',
                desc: 'Books appointments, sends reminders, handles rescheduling, and processes payments — all automatically.',
              },
              {
                icon: Star,
                title: 'AI Concierge',
                desc: 'White-glove VIP service with multi-language support, proactive outreach, and personalized experiences.',
              },
            ].map((item, i) => (
              <div key={item.title} className="bg-white rounded-2xl border border-purple-200 p-6 hover:shadow-xl hover:shadow-purple-100/50 hover:border-purple-300 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl purple-gradient flex items-center justify-center mb-4 shadow-lg shadow-purple-200/50">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">The Proof:</h3>
            <ul className="space-y-3">
              {[
                '500+ businesses deployed — from hair salons to veterinary clinics',
                '2.8M+ calls managed per month across all clients',
                '98.5% appointment booking rate on the Professional tier',
                '40% reduction in no-shows within the first 30 days',
                'Industry-specific AI trained on your exact workflows',
              ].map((proof) => (
                <li key={proof} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{proof}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-base px-8 py-6"
              onClick={() => handleGetNowClick('MechanismReveal')}
            >
              Deploy My AI Secretary Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Layer 5: Product Stack (Value Architecture) ──────────────────── */
function ProductStackSection() {
  const stack = [
    { name: 'AI Receptionist — 24/7 Call Answering', value: 1500, desc: 'Never miss another call. Your AI answers in 2 seconds, routes intelligently, and captures every lead.' },
    { name: 'AI Secretary — Full Appointment Management', value: 1200, desc: 'Book, confirm, remind, and reschedule — all automated. Reduce no-shows by 40%.' },
    { name: 'Multi-Channel Orchestration', value: 800, desc: 'Phone, SMS, WhatsApp, Telegram, web chat — one AI, every channel, seamless experience.' },
    { name: 'Industry-Customized Workflow Engine', value: 900, desc: 'Pre-built flows for salons, clinics, and shops — or we customize for your exact business.' },
    { name: 'Payment & Deposit Handling', value: 600, desc: 'Secure payment processing, deposit collection, and cancellation fee automation.' },
    { name: 'Smart Lead Qualification', value: 700, desc: 'Automatically score and route hot leads to your team for immediate follow-up.' },
    { name: 'Marketing & Follow-up Automation', value: 600, desc: 'Post-visit follow-ups, review requests, loyalty campaigns — all on autopilot.' },
    { name: 'Custom AI Personality & Brand Voice', value: 500, desc: 'Your AI sounds like YOUR business — professional, warm, and on-brand.' },
    { name: 'Dedicated AI Optimization Team', value: 1200, desc: 'Real humans who monitor and improve your AI performance every week.' },
    { name: 'Analytics Dashboard & Reporting', value: 400, desc: 'Track every call, booking, and dollar earned — full visibility into your AI ROI.' },
  ]

  const totalValue = stack.reduce((sum, item) => sum + item.value, 0)

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-1.5 text-sm font-medium mb-4">
              <Award className="w-4 h-4 mr-1" />
              Complete AI Secretary System
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              The Full <span className="purple-gradient-text">Product Stack</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-b from-purple-50 to-white rounded-3xl border border-purple-200 overflow-hidden mb-8">
            <div className="divide-y divide-purple-100">
              {stack.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between p-4 sm:p-5 hover:bg-purple-50/50 transition-colors">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</span>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm ml-6">{item.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-purple-700 font-bold text-sm">VALUE: ${item.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Value Bar */}
            <div className="bg-purple-900 text-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">TOTAL REAL-WORLD VALUE:</span>
                <span className="text-2xl sm:text-3xl font-bold">${totalValue.toLocaleString()}/month</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Pricing Tiers */}
        <FadeIn delay={0.2}>
          <div className="text-center mb-8">
            <p className="text-xl text-gray-700 mb-2">But you won&apos;t pay anywhere near that.</p>
            <p className="text-gray-500">Choose the plan that fits your business:</p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic */}
          <FadeIn delay={0.2}>
            <Card className="h-full flex flex-col border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Basic</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$500</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">1 Skill | 3 Flows | 2,000 interactions/mo</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 text-sm flex-1">
                  {['1 AI Skill included', 'Up to 3 Flows/Tasks', '2,000 interactions/month', 'Full platform connectivity', 'Standard AI voice & text', 'No setup fee (min 3 months)'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400 mb-2">Value: $3,400/mo — You save $2,900</p>
                  <a
                    href="https://aireceptio.pay.clickbank.net/?cbitems=1000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full"
                    onClick={() => handleGetNowClick('Basic')}
                  >
                    <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 py-5">
                      Get Basic Plan <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Professional - highlighted */}
          <FadeIn delay={0.25}>
            <Card className="h-full flex flex-col border-purple-400 shadow-2xl shadow-purple-200/50 scale-105 z-10 bg-gradient-to-b from-white to-purple-50/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="purple-gradient text-white px-4 py-1 shadow-lg shadow-purple-300/30">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Professional</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$1,200</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">2 Skills | 8 Flows | 5,000 interactions/mo</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 text-sm flex-1">
                  {['2 AI Skills included', 'Up to 8 Flows/Tasks', '5,000 interactions/month', 'Priority support', 'Advanced analytics & no-show tracking', 'Custom AI personality for your brand', 'Deposit & cancellation fee handling', 'No setup fee (min 3 months)'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400 mb-2">Value: $6,800/mo — You save $5,600</p>
                  <a
                    href="https://aireceptio.pay.clickbank.net/?cbitems=1001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full"
                    onClick={() => handleGetNowClick('Professional')}
                  >
                    <Button className="w-full purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 py-5 animate-pulse-glow">
                      Get Professional Plan <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Enterprise */}
          <FadeIn delay={0.3}>
            <Card className="h-full flex flex-col border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$2,000</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">3+ Skills | Unlimited Flows | 10,000+ interactions/mo</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 text-sm flex-1">
                  {['3+ AI Skills included', 'Unlimited Flows/Tasks', '10,000+ interactions/month', 'Dedicated AI optimization team', 'Custom integrations', 'Multi-language support (2+ languages)', 'White-glove VIP concierge service', 'Multi-location management', 'No setup fee (min 3 months)'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400 mb-2">Value: $8,400/mo — You save $6,400</p>
                  <a
                    href="https://aireceptio.pay.clickbank.net/?cbitems=1002"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full"
                    onClick={() => handleGetNowClick('Enterprise')}
                  >
                    <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 py-5">
                      Get Enterprise Plan <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Urgency countdown */}
        <FadeIn delay={0.35}>
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 sm:p-8 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Timer className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Limited Time Offer</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">No Setup Fee — Ends Soon</h3>
            <p className="text-purple-200 mb-4">The $500 setup fee is waived for new clients who sign up this month.</p>
            <CountdownTimer />
            <Button
              size="lg"
              className="bg-white text-purple-900 hover:bg-purple-50 shadow-xl text-base px-8 py-6 font-semibold mt-4"
              onClick={() => handleGetNowClick('Urgency')}
            >
              Claim My No-Fee Setup <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Countdown Timer Component ──────────────────── */
function CountdownTimer() {
  const timeLeft = useCountdown(180) // 3 hours

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {[
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px]">
            <span className="text-2xl sm:text-3xl font-bold">{String(unit.value).padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-purple-200 mt-1">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ──────────────────── Layer 6: Future Self Visualization ──────────────────── */
function FutureSelfSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-purple-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-1" />
              Imagine This
            </Badge>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">
              30 days from now, you wake up to the familiar ping of your phone.
            </p>

            <p>
              But this time, it&apos;s different. Instead of 12 missed calls and a voicemail inbox full of
              frustrated clients, you see a clean notification: <strong>&ldquo;8 new appointments booked
              overnight. $2,400 in deposits collected. Zero no-shows.&rdquo;</strong>
            </p>

            <p>
              Your AI Secretary handled everything while you slept. A client texted at 11 PM to reschedule —
              handled instantly. A new lead called at 7 AM — booked before your first coffee. Your
              calendar is full, your clients are happy, and you haven&apos;t lifted a finger.
            </p>

            <p>
              You walk into your business at 9 AM and everything is already running. Your AI has sent
              reminders for today&apos;s appointments, confirmed the deposits, and flagged one cancellation
              — but don&apos;t worry, it already filled the slot from the waitlist.
            </p>

            <p>
              Your competitor down the street? They&apos;re still returning yesterday&apos;s voicemails.
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 sm:p-8 mt-8">
              <p className="text-xl font-semibold text-gray-900 mb-4">Now you have a choice:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-red-200">
                  <p className="font-semibold text-red-700 mb-1">Option A</p>
                  <p className="text-gray-600 text-sm">Close this page. Keep doing everything yourself. Miss calls. Chase no-shows. Stay stuck in the same place 6 months from now.</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-300 shadow-lg shadow-purple-100/50">
                  <p className="font-semibold text-purple-700 mb-1">Option B</p>
                  <p className="text-gray-600 text-sm">Deploy your AI Secretary today. Get your first automated booking in 48 hours. Watch your revenue grow while you sleep.</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-lg px-10 py-7"
              onClick={() => handleGetNowClick('FutureSelf')}
            >
              I Choose Option B — Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Layer 7: Guarantee + Risk Reversal ──────────────────── */
function GuaranteeSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-4 py-1.5 text-sm font-medium mb-4">
              <Shield className="w-4 h-4 mr-1" />
              Iron-Clad Guarantee
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our &ldquo;First Booking in 48 Hours&rdquo; <span className="purple-gradient-text">Guarantee</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-3xl border border-purple-200 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 rounded-full purple-gradient flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200/50">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <p className="text-xl leading-relaxed text-gray-700 max-w-2xl mx-auto mb-6">
              If within <strong>30 days</strong> of deploying your MassaPro AI Secretary, you don&apos;t have your
              first automated booking, we&apos;ll work with you 1-on-1 until you do — at no extra cost. If after
              60 days you&apos;re not seeing measurable improvement in your booking rate and no-show reduction,
              we&apos;ll refund every penny.
            </p>

            <p className="text-gray-500 text-sm mb-8">
              There&apos;s only one condition: <strong>You must TRY the system.</strong> We can&apos;t help
              you if you don&apos;t turn it on. But if you give it an honest shot and it doesn&apos;t deliver,
              email us at <span className="text-purple-700 font-semibold">support@massapro.com</span> and
              we&apos;ll refund 100% of your money. No drama. No runaround.
            </p>

            <Button
              size="lg"
              className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-lg px-10 py-7"
              onClick={() => handleGetNowClick('Guarantee')}
            >
              Start Risk-Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Deploy in 48hrs</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Social Proof Bar ──────────────────── */
function SocialProofBar() {
  return (
    <section className="py-10 bg-white border-y border-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          <div className="text-center">
            <p className="text-3xl font-bold purple-gradient-text">500+</p>
            <p className="text-sm text-gray-500">Businesses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold purple-gradient-text">2.8M+</p>
            <p className="text-sm text-gray-500">Calls/Month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold purple-gradient-text">98.5%</p>
            <p className="text-sm text-gray-500">Booking Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-purple-500 text-purple-500" />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">4.9/5 Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold purple-gradient-text">40%</p>
            <p className="text-sm text-gray-500">Fewer No-Shows</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── FAQ Section ──────────────────── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: 'How is this different from a regular chatbot?',
      a: 'A chatbot sits on your website and answers basic questions. MassaPro is a complete AI workforce — it answers phone calls, sends text messages, books appointments, processes payments, and handles your entire front desk across every channel your customers use. It\'s not a widget; it\'s an employee that never sleeps.',
    },
    {
      q: 'How quickly can I get started?',
      a: 'Most businesses are fully deployed within 48 hours. We handle the setup, train your AI on your specific workflows, and connect it to your existing tools (calendar, CRM, payment gateway). You just need to tell us how your business works — we do the rest.',
    },
    {
      q: 'What if I\'m not tech-savvy?',
      a: 'You don\'t need to be. We set everything up for you. Your AI optimization team monitors performance and makes improvements weekly. You just watch the bookings come in. If you can check your email, you can use MassaPro.',
    },
    {
      q: 'Will it sound robotic on the phone?',
      a: 'No. Our AI uses natural language processing with human-quality voice synthesis. Your clients won\'t know they\'re talking to AI unless you tell them. We customize the personality and tone to match your brand voice.',
    },
    {
      q: 'What industries does this work for?',
      a: 'We specialize in service businesses: hair salons, nail studios, beauty shops, med spas, veterinary clinics, and similar businesses. Our AI is pre-trained on industry-specific workflows, so it knows the difference between a balayage and a blowout, or a vaccination and a wellness check.',
    },
    {
      q: 'What happens if the AI can\'t handle something?',
      a: 'Your AI is trained to recognize when a conversation needs a human. It seamlessly transfers the call or message to you or your team with full context — so your customer never has to repeat themselves. Think of it as a filter that handles 90% of inquiries and only escalates the ones that truly need you.',
    },
    {
      q: 'Can I cancel if it doesn\'t work?',
      a: 'Yes. There\'s a minimum 3-month agreement (because it takes about 30 days to fully optimize your AI), and after that you can cancel anytime. But with our 60-day money-back guarantee, you have zero risk. If it doesn\'t deliver, you get every penny back.',
    },
    {
      q: 'What countries does MassaPro support?',
      a: 'MassaPro currently supports businesses in the United States, Canada, UK, Australia, EU, and Israel. We\'re expanding rapidly — contact us if you\'re in a different region and we\'ll see what we can do.',
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked <span className="purple-gradient-text">Questions</span>
            </h2>
          </div>
        </FadeIn>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="border border-purple-100 rounded-xl overflow-hidden hover:border-purple-300 transition-colors">
                <button
                  className="w-full text-left p-5 flex items-center justify-between gap-4"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-purple-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Final CTA Section ──────────────────── */
function FinalCTASection() {
  return (
    <section className="py-16 lg:py-24 purple-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/salon-interior-v2.png')] bg-cover bg-center opacity-5" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Stop Losing $43,200/Year to Missed Calls.
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Deploy your AI Secretary today. Get your first automated booking in 48 hours. Or keep playing
            phone tag. The choice is yours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://aireceptio.pay.clickbank.net/?cbitems=1001"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleGetNowClick('FinalCTA')}
            >
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-purple-50 shadow-xl text-lg px-10 py-7 font-semibold"
              >
                Get Professional Plan — $1,200/mo <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-base px-8 py-6"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View All Plans
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-purple-200">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>60-Day Money-Back</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Deploy in 48hrs</span>
            </div>
          </div>

          <p className="mt-8 text-sm text-purple-300 max-w-xl mx-auto">
            P.S. When you get started, head straight to the onboarding call — that&apos;s where we customize
            your AI for your exact business. The businesses that see the fastest results are the ones
            who jump on that call within 24 hours.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Footer ──────────────────── */
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/massapro-logo-v2.png"
            alt="MassaPro Logo"
            width={120}
            height={36}
            className="h-8 w-auto opacity-70"
          />
          <p className="text-sm text-center">
            &copy; {new Date().getFullYear()} MassaPro. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a href="/all" className="hover:text-purple-400 transition-colors">All Services</a>
            <a href="mailto:support@massapro.com" className="hover:text-purple-400 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────── MAIN PAGE COMPONENT ──────────────────── */
export default function ExpertPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      {/* 7-Layer Pitch Architecture */}
      <Suspense fallback={null}>
        <HeroSection />              {/* Title above, image left, form right */}
      </Suspense>
      <SocialProofBar />           {/* Social proof metrics */}
      <IdentityForkSection />      {/* Layer 1: Identity Fork */}
      <BrutalTruthSection />       {/* Layer 2: Brutal Truth */}
      <WindowFrameSection />       {/* Layer 3: Window Frame */}
      <MechanismRevealSection />   {/* Layer 4: Mechanism Reveal */}
      <ProductStackSection />      {/* Layer 5: Product Stack + Pricing */}
      <FutureSelfSection />        {/* Layer 6: Future Self */}
      <GuaranteeSection />         {/* Layer 7: Guarantee */}
      <FAQSection />               {/* Objection handling */}
      <FinalCTASection />          {/* Final push with P.S. */}
      <Footer />
    </main>
  )
}
