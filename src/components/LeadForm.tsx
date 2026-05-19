'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import WeeklySlotPicker from '@/components/WeeklySlotPicker'

const INDUSTRIES = [
  'Med Spas',
  'Hair Salons',
  'Nail Studios',
  'Beauty Shops',
  'Veterinary Clinics',
  'Other',
]

const SERVICE_TYPES = [
  'AI Receptionist',
  'AI Secretary / Virtual Assistant',
  'AI Concierge',
  'Custom / Not Sure Yet',
]

const PLAN_TYPES = [
  'Basic — $500/mo',
  'Professional — $1,200/mo',
  'Enterprise — $2,000/mo',
  'Not Sure Yet',
]

const COUNTRIES = [
  'United States','Canada','United Kingdom','Australia','Germany','France','Italy','Spain',
  'Netherlands','Belgium','Switzerland','Austria','Sweden','Norway','Denmark','Finland',
  'Ireland','Portugal','Greece','Poland','Czech Republic','Romania','Hungary','New Zealand',
  'Japan','South Korea','Singapore','United Arab Emirates','Israel','Brazil','Mexico',
  'Argentina','Colombia','Chile','Peru','South Africa','Nigeria','Kenya','India',
  'Philippines','Malaysia','Thailand','Indonesia','Other',
]

interface LeadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefillService?: string
  prefillPlan?: string
  prefillIndustry?: string
}

interface UtmParams {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
}

function LeadFormInner({ open, onOpenChange, prefillService, prefillPlan, prefillIndustry }: LeadFormProps) {
  const searchParams = useSearchParams()

  // Capture UTM parameters from URL on mount
  const [utmParams] = useState<UtmParams>(() => ({
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_content: searchParams.get('utm_content') || '',
    utm_term: searchParams.get('utm_term') || '',
  }))

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyUrl: '',
    industry: '',
    otherIndustry: '',
    email: '',
    mobile: '',
    country: 'United States',
    appointmentDate: '',
    appointmentTime: '',
    appointmentSlotId: '',
    timezone: '',
    serviceType: '',
    planType: '',
    notes: '',
  })
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Track form open event (Meta Pixel + Google Analytics)
  useEffect(() => {
    if (open) {
      // Meta Pixel: custom event
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('trackCustom', 'LeadFormOpen')
      }
      // Google Analytics 4: custom event
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        ;(window as any).gtag('event', 'lead_form_open', {
          event_category: 'engagement',
          event_label: 'Lead Form Opened',
        })
      }
    }
  }, [open])

  // Fetch booked slots when form opens
  useEffect(() => {
    if (open) {
      fetchBookedSlots()
    }
  }, [open])

  const fetchBookedSlots = async () => {
    try {
      const res = await fetch('/api/available-slots')
      if (res.ok) {
        const data = await res.json()
        setBookedSlots(data.bookedSlots || [])
      }
    } catch {
      // Silently fail — all slots will show as available
      console.warn('Could not fetch booked slots')
    }
  }

  // Auto-detect timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setFormData((prev) => ({ ...prev, timezone: tz }))
    } catch {
      setFormData((prev) => ({ ...prev, timezone: 'America/New_York' }))
    }
  }, [])

  // Prefill service/plan/industry from button click or page context
  useEffect(() => {
    if (prefillService) {
      setFormData((prev) => ({ ...prev, serviceType: prefillService }))
    }
    if (prefillPlan) {
      setFormData((prev) => ({ ...prev, planType: prefillPlan }))
    }
    if (prefillIndustry) {
      setFormData((prev) => ({ ...prev, industry: prefillIndustry }))
    }
  }, [prefillService, prefillPlan, prefillIndustry])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle slot selection from WeeklySlotPicker
  const handleSlotSelect = useCallback((slotId: string, dateISO: string, timeIsrael: string) => {
    setFormData((prev) => ({
      ...prev,
      appointmentSlotId: slotId,
      appointmentDate: dateISO,
      appointmentTime: timeIsrael,
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Require a slot selection
    if (!formData.appointmentSlotId) {
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
          ...formData,
          ...utmParams,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        // If the slot was taken, refresh booked slots
        if (data.error?.includes('already booked') || data.error?.includes('slot')) {
          fetchBookedSlots()
        }
        throw new Error(data.error || 'Submission failed')
      }

      setSubmitted(true)

      // Add the newly booked slot locally so it shows as unavailable if they reopen
      setBookedSlots(prev => [...prev, formData.appointmentSlotId])

      // Meta Pixel: track Schedule event
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'Schedule')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitted) {
      setSubmitted(false)
      setFormData({
        firstName: '',
        lastName: '',
        companyUrl: '',
        industry: '',
        otherIndustry: '',
        email: '',
        mobile: '',
        country: 'United States',
        appointmentDate: '',
        appointmentTime: '',
        appointmentSlotId: '',
        timezone: '',
        serviceType: '',
        planType: '',
        notes: '',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className={`sticky top-0 z-10 bg-white border-b border-purple-100 px-6 py-4 rounded-t-lg ${submitted ? 'text-center' : ''}`}>
          <DialogHeader className={submitted ? 'items-center' : ''}>
            <DialogTitle className="text-2xl font-bold">
              {submitted ? (
                <span className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="w-6 h-6" /> Submitted!
                </span>
              ) : (
                <span className="purple-gradient-text">Get Started with MassaPro</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "Your consultation has been scheduled. A Google Meet link will be sent to your email."
                : 'Fill out the form below and schedule your free consultation.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {submitted ? (
          <div className="px-6 py-12 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Thank You!</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your consultation has been scheduled. A Google Meet link and confirmation email will be sent to{' '}
              <span className="font-semibold text-purple-700">{formData.email}</span> shortly.
            </p>
            <Button onClick={handleClose} className="purple-gradient text-white mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Business Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyUrl">Company URL</Label>
                  <Input
                    id="companyUrl"
                    type="text"
                    value={formData.companyUrl}
                    onChange={(e) => handleChange('companyUrl', e.target.value)}
                    placeholder="www.example.com or https://example.com"
                    pattern="^(https?://)?([\w-]+\.)+[\w-]+(/.*)?$"
                    className="border-purple-200 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400">e.g. www.site.com or https://www.site.com</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">
                    Industry <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.industry} onValueChange={(v) => handleChange('industry', v)}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.industry === 'Other' && (
                    <Input
                      value={formData.otherIndustry}
                      onChange={(e) => handleChange('otherIndustry', e.target.value)}
                      placeholder="Please specify your industry"
                      className="border-purple-200 focus:border-purple-500 mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Contact Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@company.com"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">
                    Mobile <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.country} onValueChange={(v) => handleChange('country', v)}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Service Selection — BEFORE Schedule Consultation */}
            <div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Service Selection
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type of Service</Label>
                  <Select value={formData.serviceType} onValueChange={(v) => handleChange('serviceType', v)}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type of Plan</Label>
                  <Select value={formData.planType} onValueChange={(v) => handleChange('planType', v)}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Appointment - Weekly Slot Picker — AFTER Service Selection */}
            <div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Schedule Consultation
              </h3>
              <WeeklySlotPicker
                selectedSlot={formData.appointmentSlotId}
                onSelectSlot={handleSlotSelect}
                bookedSlots={bookedSlots}
              />
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Task & Flow Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Describe the tasks and flows you need for your AI service
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="e.g., We need appointment booking with SMS reminders, payment deposit handling, and post-visit follow-up for our hair salon. We'd also like lead qualification for new clients..."
                  className="border-purple-200 focus:border-purple-500 min-h-[120px]"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 pb-4">
              <Button
                type="submit"
                disabled={submitting || !formData.appointmentSlotId}
                className="w-full purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 py-6 text-base font-semibold disabled:opacity-50"
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
              <p className="text-xs text-gray-400 text-center mt-3">
                No setup fee &bull; Free consultation &bull; Google Meet link sent to your email
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function LeadForm(props: LeadFormProps) {
  return (
    <Suspense fallback={null}>
      <LeadFormInner {...props} />
    </Suspense>
  )
}
