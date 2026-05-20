'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  CreditCard,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  Shield,
  Lock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const COUNTRIES = [
  'United States','Canada','United Kingdom','Australia','Germany','France','Italy','Spain',
  'Netherlands','Belgium','Switzerland','Austria','Sweden','Norway','Denmark','Finland',
  'Ireland','Portugal','Greece','Poland','Czech Republic','Romania','Hungary','New Zealand',
  'Japan','South Korea','Singapore','United Arab Emirates','Israel','Brazil','Mexico',
  'Argentina','Colombia','Chile','Peru','South Africa','Nigeria','Kenya','India',
  'Philippines','Malaysia','Thailand','Indonesia','Other',
]

interface PurchaseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName?: string
  planPrice?: string
}

interface UtmParams {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  affid: string
}

function PurchaseFormInner({ open, onOpenChange, planName, planPrice }: PurchaseFormProps) {
  const searchParams = useSearchParams()

  // Capture UTM parameters from URL on mount
  const [utmParams] = useState<UtmParams>(() => {
    // Try to get affid from cookie
    let affid = ''
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)affid=([^;]*)/)
      if (match) affid = decodeURIComponent(match[1])
    }
    // Also try MassaProAffiliate
    if (!affid && typeof window !== 'undefined' && typeof (window as any).MassaProAffiliate === 'object') {
      try {
        const attr = (window as any).MassaProAffiliate.getAttribution()
        if (attr && attr.affid) affid = attr.affid
      } catch {}
    }
    return {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_content: searchParams.get('utm_content') || '',
      utm_term: searchParams.get('utm_term') || '',
      affid,
    }
  })

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    country: 'United States',
    cardNumber: '',
    cardExpiry: '',
    cvv: '',
    cardholderName: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Track form open event (AddToCart + CartClick)
  useEffect(() => {
    if (open) {
      // Meta Pixel: AddToCart standard event
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'AddToCart')
        ;(window as any).fbq('trackCustom', 'CartClick', {
          plan_name: planName || '',
          price: planPrice || '',
          cta: 'buynow',
          page_name: 'All',
        })
      }
      // MassaPro Affiliate Tracker
      if (typeof window !== 'undefined' && typeof (window as any).MassaProAffiliate === 'object') {
        try {
          ;(window as any).MassaProAffiliate.trackEvent('btn_cart')
        } catch {}
      }
    }
  }, [open, planName, planPrice])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Format card number with spaces
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16)
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    handleChange('cardNumber', formatted)
  }

  // Format expiry MM/YY
  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length >= 3) {
      handleChange('cardExpiry', cleaned.slice(0, 2) + '/' + cleaned.slice(2))
    } else {
      handleChange('cardExpiry', cleaned)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/submit-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planName: planName || '',
          planPrice: planPrice || '',
          ...utmParams,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      // Meta Pixel: track Purchase event
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'Purchase', {
          value: planPrice || '',
          currency: 'USD',
          content_name: planName || '',
        })
      }

      // MassaPro Affiliate Tracker
      if (typeof window !== 'undefined' && typeof (window as any).MassaProAffiliate === 'object') {
        try {
          ;(window as any).MassaProAffiliate.trackEvent('btn_purchase')
        } catch {}
      }

      // Redirect to thank you page using full page navigation
      const priceNum = (planPrice || '').replace(/[^0-9]/g, '')
      window.location.href = `/all-TY?plan=${encodeURIComponent(planName || '')}&price=${encodeURIComponent(priceNum)}`
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-purple-100 px-6 py-4 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              <span className="purple-gradient-text">Complete Your Purchase</span>
            </DialogTitle>
            <DialogDescription>
              Fill out the form below to purchase your MassaPro plan.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Product Summary */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg purple-gradient flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{planName} Plan</p>
                  <p className="text-sm text-purple-700 font-medium">{planPrice}/month</p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs font-semibold">
                Selected
              </Badge>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
              Personal Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purch-firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purch-firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purch-lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purch-lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className="border-purple-200 focus:border-purple-500"
                />
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
                <Label htmlFor="purch-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purch-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@company.com"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purch-phone">
                  Phone / Mobile <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purch-phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
              Business Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purch-company">
                  Company / Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purch-company"
                  required
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Your Business Name"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purch-country">Country</Label>
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

          {/* Payment Info */}
          <div>
            <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
              Payment Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purch-cardNumber">
                  Credit Card Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="purch-cardNumber"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="border-purple-200 focus:border-purple-500 pr-10"
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purch-cardExpiry">
                    Card Expiry (MM/YY) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purch-cardExpiry"
                    required
                    value={formData.cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                    className="border-purple-200 focus:border-purple-500"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purch-cvv">
                    CVV <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purch-cvv"
                    type="password"
                    required
                    value={formData.cvv}
                    onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="border-purple-200 focus:border-purple-500"
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purch-cardholderName">
                  Cardholder Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purch-cardholderName"
                  required
                  value={formData.cardholderName}
                  onChange={(e) => handleChange('cardholderName', e.target.value)}
                  placeholder="John Doe"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>
            </div>
            {/* Security notice */}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-green-600" />
              <span>Your payment details are processed securely</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 pb-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 py-6 text-base font-semibold disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Complete Purchase
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Minimum 3-month agreement &bull; No setup fee &bull; Confirmation sent to your email
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PurchaseForm(props: PurchaseFormProps) {
  return (
    <Suspense fallback={null}>
      <PurchaseFormInner {...props} />
    </Suspense>
  )
}
