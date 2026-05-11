'use client'

import { useState, useEffect } from 'react'
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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import {
  X,
  CalendarIcon,
  Clock,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const INDUSTRIES = [
  'Hair Salon',
  'Nail Studio',
  'Beauty Shop / Spa',
  'Barbershop',
  'Veterinary Clinic',
  'Dental Clinic',
  'Medical Practice',
  'Chiropractic Office',
  'Physical Therapy Clinic',
  'Dermatology Clinic',
  'Plastic Surgery Clinic',
  'Med Spa / Aesthetics',
  'Massage Therapy',
  'Wellness Center',
  'Yoga / Pilates Studio',
  'Fitness Center / Gym',
  'Personal Training Studio',
  'Tattoo Studio',
  'Photography Studio',
  'Event Planning',
  'Catering Company',
  'Restaurant / Café',
  'Real Estate Agency',
  'Insurance Agency',
  'Law Firm',
  'Accounting Firm',
  'Financial Advisory',
  'Car Dealership',
  'Auto Repair Shop',
  'Pet Grooming',
  'Pet Boarding / Daycare',
  'Childcare / Daycare',
  'Tutoring Center',
  'Language School',
  'Dance Studio',
  'Music School',
  'Art Studio / Gallery',
  'Home Services (Plumbing, Electrical, etc.)',
  'Cleaning Service',
  'Landscaping / Gardening',
  'Interior Design',
  'Architecture Firm',
  'Consulting Firm',
  'Marketing Agency',
  'IT Services',
  'Travel Agency',
  'Funeral Home',
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
  'Growth — $900/mo',
  'Premium — $1,500/mo',
  'Not Sure Yet',
]

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia',
  'Puerto Rico','Other',
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
}

export function LeadForm({ open, onOpenChange, prefillService, prefillPlan }: LeadFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    companyUrl: '',
    industry: '',
    email: '',
    mobile: '',
    country: 'United States',
    state: '',
    appointmentDate: '',
    appointmentTime: '',
    timezone: '',
    serviceType: '',
    planType: '',
    notes: '',
  })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Auto-detect timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setFormData((prev) => ({ ...prev, timezone: tz }))
    } catch {
      setFormData((prev) => ({ ...prev, timezone: 'America/New_York' }))
    }
  }, [])

  // Prefill service/plan from button click
  useEffect(() => {
    if (prefillService) {
      setFormData((prev) => ({ ...prev, serviceType: prefillService }))
    }
    if (prefillPlan) {
      setFormData((prev) => ({ ...prev, planType: prefillPlan }))
    }
  }, [prefillService, prefillPlan])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`
      setFormData((prev) => ({ ...prev, appointmentDate: formatted }))
      setCalendarDate(date)
      setCalendarOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      setSubmitted(true)
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
        companyName: '',
        companyUrl: '',
        industry: '',
        email: '',
        mobile: '',
        country: 'United States',
        state: '',
        appointmentDate: '',
        appointmentTime: '',
        timezone: '',
        serviceType: '',
        planType: '',
        notes: '',
      })
      setCalendarDate(undefined)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-purple-100 px-6 py-4 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {submitted ? (
                <span className="flex items-center gap-2 text-green-600">
                  <Check className="w-6 h-6" /> Submitted!
                </span>
              ) : (
                <span className="purple-gradient-text">Get Started with MassaPro</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "We'll be in touch within 24 hours to schedule your consultation."
                : 'Fill out the form below and our team will reach out to schedule your free consultation.'}
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
              Your consultation request has been received. Our team will contact you at{' '}
              <span className="font-semibold text-purple-700">{formData.email}</span> within 24 hours.
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
                Company Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Acme Inc."
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyUrl">Company URL</Label>
                  <Input
                    id="companyUrl"
                    type="url"
                    value={formData.companyUrl}
                    onChange={(e) => handleChange('companyUrl', e.target.value)}
                    placeholder="https://example.com"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="industry">Industry</Label>
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
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
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
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  {formData.country === 'United States' ? (
                    <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {US_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="Province / Region"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Appointment */}
            <div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Schedule Consultation
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <div className="flex gap-2">
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal border-purple-200 hover:border-purple-500 hover:bg-purple-50"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2 text-purple-500" />
                          {calendarDate ? calendarDate.toLocaleDateString('en-US') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={calendarDate}
                          onSelect={handleCalendarSelect}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    value={formData.appointmentDate}
                    onChange={(e) => handleChange('appointmentDate', e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="border-purple-200 focus:border-purple-500 text-sm"
                  />
                  <p className="text-xs text-gray-400">Use the calendar or type manually (MM/DD/YYYY)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => handleChange('appointmentTime', e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                  />
                  {formData.timezone && (
                    <div className="flex items-center gap-1 text-xs text-purple-500">
                      <Clock className="w-3 h-3" />
                      {formData.timezone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Service Selection */}
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
                disabled={submitting}
                className="w-full purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 py-6 text-base font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Consultation Request
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-3">
                No setup fee • Free consultation • We&apos;ll respond within 24 hours
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
