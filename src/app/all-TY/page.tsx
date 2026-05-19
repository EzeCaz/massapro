'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const planName = searchParams.get('plan') || 'your plan'
  const price = searchParams.get('price') || ''

  // Fire analytics events on mount
  useEffect(() => {
    // Meta Pixel: Purchase standard event
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      ;(window as any).fbq('track', 'Purchase', {
        value: price,
        currency: 'USD',
        content_name: planName,
      })
      ;(window as any).fbq('trackCustom', 'PurchaseComplete', {
        plan_name: planName,
        price,
        cta: 'purchase',
        page_name: 'All-TY',
      })
    }

    // MassaPro Affiliate Tracker
    if (typeof window !== 'undefined' && typeof (window as any).MassaProAffiliate === 'object') {
      try {
        ;(window as any).MassaProAffiliate.trackEvent('btn_purchase_complete')
      } catch {}
    }

    // Google Analytics 4: purchase event
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'purchase', {
        value: price,
        currency: 'USD',
        items: [{ item_name: planName }],
      })
    }
  }, [planName, price])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-purple-50 to-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-100/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Image
                src="/massapro-logo-v2.png"
                alt="MassaPro Logo"
                width={160}
                height={48}
                className="h-10 w-auto"
                priority
              />
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Green Checkmark */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-xl shadow-green-100/50 animate-bounce-once">
              <Check className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Badge */}
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-1" />
            Purchase Confirmed
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Thank <span className="purple-gradient-text">You!</span>
          </h1>

          {/* Description */}
          <div className="space-y-4">
            <p className="text-lg text-gray-600 leading-relaxed">
              Your purchase of the <span className="font-semibold text-purple-700">{planName}</span> plan has been received.
              We&apos;ll send a confirmation to your email shortly.
            </p>
            <p className="text-gray-500">
              Our team will reach out within 24 hours to set up your AI Secretary.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 shadow-lg shadow-purple-100/30">
            <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">Order Summary</h3>
            <div className="flex items-center justify-between py-2 border-b border-purple-50">
              <span className="text-gray-600">Plan</span>
              <span className="font-semibold text-gray-800">{planName}</span>
            </div>
            {price && (
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-purple-700">${price}/month</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-base px-8 py-6 font-semibold"
              asChild
            >
              <a href="/">
                Back to Home
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>

          <p className="text-xs text-gray-400 pt-2">
            If you have any questions, contact us at{' '}
            <a href="mailto:hello@massapro.com" className="text-purple-500 hover:text-purple-700">
              hello@massapro.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-950 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MassaPro. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Bounce animation style */}
      <style jsx global>{`
        @keyframes bounce-once {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default function AllTYPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-white">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
