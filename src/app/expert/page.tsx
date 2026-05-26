'use client'

import { useState, useEffect, useRef } from 'react'
import { BackupTracker } from '@/lib/backup-tracker'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  Calendar,
  Star,
  ChevronDown,
  Check,
  Zap,
  Globe,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Mail,
  MapPin,
  Clock,
  Shield,
  Headphones,
  Users,
  CreditCard,
  Megaphone,
  Bot,
  AlertTriangle,
  TrendingUp,
  Eye,
  Gift,
  Lock,
  Timer,
  ChevronRight,
} from 'lucide-react'

/* ──────────────────── Helper Functions ──────────────────── */
function scrollToPricing() {
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
}

function handleGetNowClick(location: string) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    (window as any).fbq('trackCustom', 'GetNowClick', { button_location: location, page_name: 'Expert', cta: 'purchase' })
  }
  if (typeof window !== 'undefined' && typeof (window as any).MassaProAffiliate === 'object') {
    try { (window as any).MassaProAffiliate.trackEvent('btn_get_now') } catch(e){}
  }
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'get_now', { button_location: location, page_name: 'Expert' })
  }
  scrollToPricing()
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

/* ──────────────────── Countdown Timer ──────────────────── */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    const STORAGE_KEY = 'massapro_expert_countdown_end'
    let endTime: number

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      endTime = parseInt(stored, 10)
      if (endTime <= Date.now()) {
        endTime = Date.now() + 48 * 60 * 60 * 1000
        localStorage.setItem(STORAGE_KEY, endTime.toString())
      }
    } else {
      endTime = Date.now() + 48 * 60 * 60 * 1000
      localStorage.setItem(STORAGE_KEY, endTime.toString())
    }

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now())
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) return null

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full purple-gradient px-4 py-2 shadow-lg shadow-purple-300/30">
      <Timer className="w-4 h-4 text-white mr-1" />
      {[
        { label: 'D', value: timeLeft.days },
        { label: 'H', value: timeLeft.hours },
        { label: 'M', value: timeLeft.minutes },
        { label: 'S', value: timeLeft.seconds },
      ].map((unit, i) => (
        <span key={unit.label} className="flex items-center gap-1">
          <span className="bg-white/20 rounded-md px-2 py-1 text-white font-bold text-sm font-mono min-w-[2.25rem] text-center">
            {pad(unit.value)}
          </span>
          <span className="text-white/70 text-xs font-medium">{unit.label}</span>
          {i < 3 && <span className="text-white/50 text-xs mx-0.5">:</span>}
        </span>
      ))}
    </div>
  )
}

/* ──────────────────── Navbar ──────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'How It Works', href: '#mechanism' },
    { label: 'What You Get', href: '#product-stack' },
    { label: 'Compare', href: '#compare' },
    { label: 'Guarantee', href: '#guarantee' },
    { label: 'Pricing', href: '#pricing' },
  ]

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
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/massapro-logo-v2.png"
              alt="MassaPro Logo"
              width={160}
              height={48}
              className="h-10 w-auto lg:h-12"
              priority
            />
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              asChild
            >
              <a href="#pricing">View Plans</a>
            </Button>
            <Button className="purple-gradient text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-300/30" onClick={() => handleGetNowClick('Header')}>
                Get Your AI Secretary <ArrowRight className="w-4 h-4 ml-1" />
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
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-600 hover:text-purple-700 py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" className="border-purple-300 text-purple-700 w-full" asChild>
                <a href="#pricing">View Plans</a>
              </Button>
              <Button className="purple-gradient text-white w-full" onClick={() => { handleGetNowClick('Header'); setMobileOpen(false); }}>
                  Get Your AI Secretary
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ──────────────────── Section 1: Hero / Identity Fork ──────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-purple-50 to-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <FadeIn>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-1.5 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-1" />
                The Pitch Expert Formula
              </Badge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                Your{' '}
                <span className="purple-gradient-text">AI Secretary</span>
                <br />
                That Never Sleeps
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed">
                There are two types of business owners reading this page: those who keep losing clients to missed calls and unanswered messages, and those who are ready to deploy a 24/7 AI that handles everything. You already know which one gets ahead...
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button
                  size="lg"
                  className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-base px-8 py-6 animate-pulse-glow"
                  onClick={() => handleGetNowClick('Hero')}
                >
                    Get Your AI Secretary Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.35}>
              <CountdownTimer />
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex items-center gap-6 pt-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-4 py-2 text-sm font-semibold border border-green-200">
                  <Check className="w-4 h-4 mr-1.5" />
                  The Same System That&apos;s Managed 500,000+ Client Interactions Across 500+ Businesses
                </Badge>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} className="relative">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-200/40 rounded-2xl rotate-12 blur-sm" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-300/30 rounded-full blur-sm" />

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

              <div className="absolute -bottom-4 -left-4 sm:bottom-8 sm:-left-8 glass-card rounded-2xl p-4 shadow-xl animate-float">
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

              <div className="absolute -top-4 -right-4 sm:top-8 sm:-right-8 glass-card rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Appointments</p>
                    <p className="text-xs text-green-600 font-medium">98.5% booked</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Section 2: The Brutal Truth ──────────────────── */
function BrutalTruthSection() {
  const painPoints = [
    {
      icon: Phone,
      text: 'Right now, someone just tried to call your business... and nobody answered. That\'s a $500 client walking straight to your competitor.',
    },
    {
      icon: Clock,
      text: 'Your receptionist goes home at 6 PM, but your customers don\'t. Every missed evening call is revenue vanishing into thin air.',
    },
    {
      icon: Users,
      text: 'You\'re paying $35,000+/year for a human receptionist who takes lunch breaks, sick days, and vacations — while your AI could work 24/7 for a fraction of the cost.',
    },
    {
      icon: Calendar,
      text: 'You\'re drowning in appointment no-shows because nobody sends reminders, confirmations, or follow-ups.',
    },
    {
      icon: AlertTriangle,
      text: 'You\'re paralyzed by the fear that your competitors are already using AI to steal your clients — and you\'re right.',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-purple-900 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-800/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Here&apos;s the brutal truth nobody wants to admit:
            </h2>
          </div>
        </FadeIn>

        <div className="space-y-6">
          {painPoints.map((point, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex gap-4 items-start p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <point.icon className="w-5 h-5 text-purple-300" />
                </div>
                <p className="text-lg text-purple-100 leading-relaxed">{point.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6}>
          <div className="mt-12 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              But that struggle ends <span className="text-yellow-400">RIGHT NOW.</span>
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Section 3: The Window Frame ──────────────────── */
function WindowFrameSection() {
  const dataPoints = [
    { icon: Zap, text: 'We\'re in the first 18 months of the AI receptionist revolution — the Wild West phase' },
    { icon: TrendingUp, text: 'The AI business services market will surpass $90 billion by 2028' },
    { icon: Eye, text: '97% of small businesses STILL don\'t have AI answering their phones' },
    { icon: Globe, text: 'Early adopters are capturing market share RIGHT NOW while competitors are still "thinking about it"' },
  ]

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 px-4 py-1.5 text-sm font-medium mb-4">
              <Timer className="w-4 h-4 mr-1" />
              The Window Is Open
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Am I Too Late... <span className="purple-gradient-text">Again?</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              You remember the missed windows. Shopify in 2016. Crypto in 2017. NFTs in 2021. Every time you thought &ldquo;maybe next time&rdquo; — and watched someone else cash in.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="rounded-2xl purple-gradient p-8 lg:p-10 text-white text-center mb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/salon-interior-v2.png')] bg-cover bg-center opacity-5" />
            <div className="relative">
              <p className="text-2xl sm:text-3xl font-bold mb-2">But here&apos;s the truth that changes EVERYTHING:</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-yellow-300">You&apos;re NOT late. You&apos;re EARLY.</p>
            </div>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-6">
          {dataPoints.map((point, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card className="h-full border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{point.text}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <p className="text-center mt-10 text-xl font-semibold text-purple-800">
            The window is wide open. But it won&apos;t stay open forever.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Section 4: The Mechanism Reveal ──────────────────── */
function MechanismSection() {
  const positions = [
    {
      title: 'AI Receptionist',
      description: 'Answers calls, responds to messages, and routes inquiries 24/7. Never miss a customer again.',
      icon: Phone,
      image: '/ai-receptionist-home.png',
    },
    {
      title: 'AI Secretary',
      description: 'Manages your calendar, books appointments, sends reminders, and handles administrative tasks around the clock.',
      icon: Calendar,
      image: '/team-secretaries-v4.png',
    },
    {
      title: 'AI Concierge',
      description: 'Premium white-glove AI with personalized customer experiences, proactive outreach, and multi-language support.',
      icon: Star,
      image: '/ai-concierge-v4.png',
    },
  ]

  const proofStats = [
    { value: '500+', label: 'Businesses' },
    { value: '500,000+', label: 'Interactions Managed' },
    { value: '98.5%', label: 'Appointment Fill Rate' },
    { value: '<3s', label: 'Response Time' },
  ]

  return (
    <section id="mechanism" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-purple-100 text-purple-800 mb-4">The Mechanism</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              AI Is the Goldmine... <span className="purple-gradient-text">The Right System Is the Pickaxe</span>
            </h2>
            <p className="text-lg text-gray-500">
              Most business owners download ChatGPT, ask it to &ldquo;help with customer service,&rdquo; and 20 minutes later they&apos;re staring at generic, robotic garbage. Then they wonder why AI doesn&apos;t work for them.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="rounded-2xl bg-purple-50 border border-purple-100 p-6 lg:p-8 mb-14 max-w-3xl mx-auto text-center">
            <Bot className="w-10 h-10 text-purple-500 mx-auto mb-3" />
            <p className="text-gray-700 text-lg leading-relaxed">
              That&apos;s because a <strong>generic AI chatbot</strong> isn&apos;t a system. It&apos;s a toy. What works is a <strong>trained, industry-specific AI workforce</strong> that understands your business, your clients, and your workflows. That&apos;s what MassaPro delivers.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            Introducing: <span className="purple-gradient-text">The 3-Position AI System</span>
          </h3>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {positions.map((pos, i) => (
            <FadeIn key={pos.title} delay={i * 0.1}>
              <Card className="group h-full border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 bg-white overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={pos.image}
                    alt={pos.title}
                    width={600}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl purple-gradient flex items-center justify-center shadow-lg shadow-purple-200/50">
                      <pos.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">{pos.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{pos.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Proof Stats */}
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {proofStats.map((stat, i) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-purple-50 border border-purple-100">
                <div className="text-3xl sm:text-4xl font-extrabold purple-gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Section 5: Product Stack / Value Architecture ──────────────────── */
function ProductStackSection() {
  const stackItems = [
    { name: 'AI Receptionist (24/7 Call Answering)', value: '$800', icon: Phone },
    { name: 'AI Secretary (Calendar & Appointments)', value: '$600', icon: Calendar },
    { name: 'AI Concierge (VIP Client Experience)', value: '$500', icon: Star },
    { name: 'Industry-Customized Workflows', value: '$400', icon: Globe },
    { name: 'Multi-Channel Integration (Phone, SMS, WhatsApp, Social)', value: '$300', icon: Phone },
    { name: 'Payment & Deposit Handling', value: '$200', icon: CreditCard },
    { name: 'Lead Qualification & Routing', value: '$300', icon: Users },
    { name: 'Post-Service Follow-up Automation', value: '$200', icon: Megaphone },
    { name: 'No-Show Recovery System', value: '$150', icon: Clock },
    { name: 'Dedicated Optimization Team', value: '$500', icon: Headphones },
  ]

  const bonusItems = [
    { name: 'BONUS: Custom Voice Cloning', value: '$750', icon: Sparkles },
    { name: 'BONUS: 24/7 Human Escalation Safety Net', value: '$300', icon: Shield },
  ]

  const tiers = [
    {
      name: 'Basic',
      price: '$500',
      period: '/month',
      description: 'Perfect for small single-location businesses.',
      features: [
        '1 Skill included',
        'Up to 3 Flows/Tasks',
        '2,000 interactions/month',
        'Full platform connectivity',
        'Standard AI voice & text',
        'No setup fee (min 3 months)',
      ],
      highlight: false,
      badge: '',
      value: 500,
      contentName: 'Basic Plan',
      affiliateEvent: 'btn_buy_basic',
      cbUrl: 'https://aireceptio.pay.clickbank.net/?cbitems=1000',
    },
    {
      name: 'Professional',
      price: '$1,200',
      period: '/month',
      description: 'Ideal for growing businesses with moderate volume.',
      features: [
        '2 Skills included',
        'Up to 8 Flows/Tasks',
        '5,000 interactions/month',
        'Priority support',
        'Advanced analytics & no-show tracking',
        'Custom AI personality for your brand',
        'Deposit & cancellation fee handling',
        'No setup fee (min 3 months)',
      ],
      highlight: true,
      badge: 'Most Popular',
      value: 1200,
      contentName: 'Professional Plan',
      affiliateEvent: 'btn_buy_professional',
      cbUrl: 'https://aireceptio.pay.clickbank.net/?cbitems=1001',
    },
    {
      name: 'Enterprise',
      price: '$2,000',
      period: '/month',
      description: 'For multi-location businesses and VIP concierge service.',
      features: [
        '3+ Skills included',
        'Unlimited Flows/Tasks',
        '10,000+ interactions/month',
        'Dedicated AI optimization team',
        'Custom integrations',
        'Multi-language support (2+ languages)',
        'White-glove VIP concierge service',
        'Multi-location management',
        'No setup fee (min 3 months)',
      ],
      highlight: false,
      badge: '',
      value: 2000,
      contentName: 'Enterprise Plan',
      affiliateEvent: 'btn_buy_enterprise',
      cbUrl: 'https://aireceptio.pay.clickbank.net/?cbitems=1002',
    },
  ]

  return (
    <section id="product-stack" className="py-20 lg:py-28 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Value Architecture</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Here&apos;s <span className="purple-gradient-text">EVERYTHING</span> You Get When You Start Today
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-center text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Let&apos;s break down the <strong>Professional plan ($1,200/mo)</strong> into its individually-valued components:
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Core Stack */}
          <div>
            <FadeIn delay={0.15}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" /> Core System Components
              </h3>
            </FadeIn>
            <div className="space-y-3">
              {stackItems.map((item, i) => (
                <FadeIn key={item.name} delay={i * 0.04}>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-gray-700 text-sm sm:text-base">{item.name}</span>
                    </div>
                    <span className="text-purple-700 font-bold text-sm whitespace-nowrap ml-2">{item.value} value</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Bonuses */}
          <div>
            <FadeIn delay={0.2}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" /> Exclusive Bonuses
              </h3>
            </FadeIn>
            <div className="space-y-3 mb-8">
              {bonusItems.map((item, i) => (
                <FadeIn key={item.name} delay={0.3 + i * 0.04}>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 border-2 border-purple-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg purple-gradient flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-800 font-medium">{item.name}</span>
                    </div>
                    <span className="text-purple-700 font-bold whitespace-nowrap ml-2">{item.value} value</span>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.4}>
              <div className="rounded-2xl purple-gradient p-6 lg:p-8 text-white text-center relative overflow-hidden">
                <div className="relative">
                  <p className="text-purple-200 text-sm font-medium uppercase tracking-wider mb-2">Total Value</p>
                  <p className="text-4xl sm:text-5xl font-extrabold mb-1">$5,000<span className="text-lg font-normal">/mo</span></p>
                  <div className="h-px bg-white/30 my-4" />
                  <p className="text-purple-200 text-sm font-medium uppercase tracking-wider mb-2">Today From</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-yellow-300">$500<span className="text-lg font-normal">/mo</span></p>
                  <p className="text-purple-200 text-sm mt-2">or $1,200/mo for Professional</p>
                  <div className="h-px bg-white/30 my-4" />
                  <p className="text-2xl font-bold">YOU&apos;RE SAVING <span className="text-yellow-300">$3,800+/month</span> TODAY</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Countdown before pricing */}
        <FadeIn delay={0.1}>
          <div className="text-center my-10">
            <CountdownTimer />
          </div>
        </FadeIn>

        {/* Pricing Cards */}
        <div id="pricing" className="scroll-mt-24">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="bg-purple-100 text-purple-800 mb-4">Pricing</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                Choose Your <span className="purple-gradient-text">Plan</span>
              </h2>
              <p className="text-lg text-gray-500">
                No setup fee. Minimum 3-month agreement. Inbound communications included.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <Card
                  className={`relative h-full flex flex-col ${
                    tier.highlight
                      ? 'border-purple-400 shadow-2xl shadow-purple-200/50 scale-105 z-10 bg-gradient-to-b from-white to-purple-50/30'
                      : 'border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300'
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="purple-gradient text-white px-4 py-1 shadow-lg shadow-purple-300/30">
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-4xl sm:text-5xl font-extrabold purple-gradient-text">{tier.price}</span>
                      <span className="text-gray-500">{tier.period}</span>
                    </div>
                    <CardDescription className="text-gray-600 mt-3 min-h-[3rem]">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <a
                      href={tier.cbUrl}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        tier.highlight
                          ? 'purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
                          (window as any).fbq('track', 'AddToCart', { value: tier.value, currency: 'USD', content_name: tier.contentName, cta: 'add_to_cart' })
                        }
                        if (typeof window !== 'undefined' && typeof (window as any).MassaProAffiliate === 'object') {
                          try {
                            (window as any).MassaProAffiliate.trackEvent(tier.affiliateEvent)
                            ;(window as any).MassaProAffiliate.trackCart({ plan_type: tier.name, quantity: 1, cart_value: tier.value, currency: 'USD' })
                          } catch(e){}
                        }
                        BackupTracker.trackClick('button_click', tier.affiliateEvent, { plan: tier.name, page: '/expert' })
                        BackupTracker.trackCart(tier.name, tier.value)
                        if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
                          (window as any).gtag('event', 'add_to_cart', { value: tier.value, currency: 'USD', items: [{ name: tier.contentName, price: tier.value }] })
                        }
                        let finalUrl = tier.cbUrl
                        if (typeof window !== 'undefined' && typeof (window as any).MassaProAffiliate === 'object') {
                          try {
                            const hasAff = (window as any).MassaProAffiliate.hasAffiliate()
                            if (hasAff) {
                              const attr = (window as any).MassaProAffiliate.getAttribution()
                              if (attr && attr.affid) {
                                finalUrl = finalUrl + '&cvendthru=' + encodeURIComponent(attr.affid)
                              }
                            }
                          } catch(e){}
                        }
                        window.location.href = finalUrl
                      }}
                    >
                        Buy Now <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </CardFooter>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Section 6: Old Way vs New Way ──────────────────── */
function CompareSection() {
  const oldWay = [
    'Hiring $35K/yr receptionist',
    'Missed calls after 6 PM',
    'Manual appointment book',
    'No-shows eating profits',
    'Client complaints about slow response',
  ]

  const newWay = [
    '24/7 AI that never sleeps',
    'Every call answered in <3 seconds',
    'Automated booking & reminders',
    '40% fewer no-shows',
    'Instant multi-channel response',
  ]

  return (
    <section id="compare" className="py-20 lg:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Compare</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Old Way vs <span className="purple-gradient-text">New Way</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl shadow-purple-100/50 border border-purple-100">
          {/* Old Way */}
          <FadeIn delay={0.1}>
            <div className="bg-gray-900 text-white p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold">OLD WAY</h3>
              </div>
              <ul className="space-y-5">
                {oldWay.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <span className="text-gray-300 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* New Way */}
          <FadeIn delay={0.2}>
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 lg:p-10 border-l border-purple-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg purple-gradient flex items-center justify-center shadow-lg shadow-purple-200/50">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold purple-gradient-text">NEW WAY</h3>
              </div>
              <ul className="space-y-5">
                {newWay.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-gray-800 text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Section 7: Future Self Visualization ──────────────────── */
function FutureSelfSection() {
  const visions = [
    {
      icon: Phone,
      text: 'You hear the familiar chime of your phone — but this time, it\'s not another complaint about missed calls. It\'s your dashboard: "12 new appointments booked overnight."',
    },
    {
      icon: Clock,
      text: 'While you were having dinner with your family, your AI Secretary handled 47 client interactions, booked 8 appointments, and sent 23 reminders.',
    },
    {
      icon: TrendingUp,
      text: 'Your no-show rate dropped from 22% to 8%. Your front desk finally has breathing room.',
    },
    {
      icon: Star,
      text: 'A competitor\'s client just called YOU because nobody answered at their salon.',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Picture This</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Picture Your Business <span className="purple-gradient-text">30 Days From Now...</span>
            </h2>
          </div>
        </FadeIn>

        <div className="space-y-6 mb-14">
          {visions.map((vision, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex gap-4 items-start p-5 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all">
                <div className="w-10 h-10 rounded-lg purple-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200/50">
                  <vision.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{vision.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <div className="rounded-2xl border-2 border-purple-200 overflow-hidden">
            <div className="grid sm:grid-cols-2">
              {/* Choice A */}
              <div className="p-6 lg:p-8 bg-gray-50 border-b sm:border-b-0 sm:border-r border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <h4 className="font-bold text-gray-800">Choice A</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Close this page, keep losing $500+ clients to missed calls, and wonder &ldquo;what if&rdquo; six months from now.
                </p>
              </div>

              {/* Choice B */}
              <div className="p-6 lg:p-8 bg-purple-50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full purple-gradient flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold purple-gradient-text">Choice B</h4>
                </div>
                <p className="text-gray-700 leading-relaxed font-medium">
                  Start today, deploy your AI Secretary this week, and see results in 30 days.
                </p>
                <Button
                  className="mt-4 purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 w-full"
                  onClick={() => handleGetNowClick('FutureSelf')}
                >
                    I Choose B — Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Section 8: The Guarantee ──────────────────── */
function GuaranteeSection() {
  return (
    <section id="guarantee" className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-8">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Our &ldquo;Results in <span className="purple-gradient-text">30 Days</span>&rdquo; Guarantee
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="rounded-2xl bg-green-50 border border-green-200 p-8 lg:p-10 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              If in 30 days your AI Secretary hasn&apos;t handled at least <strong>500 client interactions</strong>, booked appointments, and reduced your no-show rate, we&apos;ll optimize your system at no extra cost for another 30 days. If it still doesn&apos;t work, <strong>we&apos;ll refund your first month</strong>.
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              There&apos;s only one condition: <strong>You must DEPLOY the system.</strong> We can&apos;t help you if we&apos;re not connected.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-600" /> No questions</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-600" /> No drama</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-600" /> No runaround</span>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Section 9: FAQ ──────────────────── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Who is this for?',
      a: 'Small and medium service businesses: salons, spas, clinics, vet offices, and any business that relies on appointments and client communication.',
    },
    {
      q: 'How long until I see results?',
      a: 'Most businesses see impact within 48 hours of deployment. Your AI starts handling calls, booking appointments, and sending reminders from day one.',
    },
    {
      q: 'What if I already have a receptionist?',
      a: 'Your AI handles the overflow, after-hours, and repetitive tasks so your human can focus on high-value interactions. They make a great team.',
    },
    {
      q: 'Can I use this in any country?',
      a: 'Yes! MassaPro supports multi-language communication and works in any timezone. Your AI is global.',
    },
    {
      q: 'What if I\'m not tech-savvy?',
      a: 'We handle ALL the setup. You just tell us about your business, and we configure everything. Zero technical skills required.',
    },
    {
      q: 'How is this different from a chatbot?',
      a: 'Chatbots follow scripts. Our AI understands context, handles multi-turn conversations, books real appointments, processes payments, and escalates to humans when needed. It\'s an intelligent workforce, not a FAQ bot.',
    },
    {
      q: 'What happens if the AI can\'t handle something?',
      a: 'Seamless human escalation. Your AI knows when to hand off — it will never leave a client stranded. You stay in control at all times.',
    },
    {
      q: 'Is my client data secure?',
      a: '256-bit encryption, HIPAA-aware infrastructure, and GDPR-compliant data handling. Your clients\' information is protected at the highest level.',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <Badge className="bg-purple-100 text-purple-800 mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Got <span className="purple-gradient-text">Questions?</span>
            </h2>
          </div>
        </FadeIn>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="rounded-xl border border-purple-100 overflow-hidden bg-white hover:border-purple-300 transition-colors">
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="font-semibold text-gray-800 pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-500 flex-shrink-0 transition-transform ${
                      openIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
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

/* ──────────────────── Section 10: Final CTA ──────────────────── */
function FinalCTASection() {
  return (
    <section className="py-20 lg:py-28 purple-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/multi-channel-v2.png')] bg-cover bg-center opacity-5" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Your Competitors Are Already Answering Their Phones.<br />
            <span className="text-yellow-300">Are You?</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-8">
            <CountdownTimer />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Button
            size="lg"
            className="bg-white text-purple-800 hover:bg-gray-100 shadow-xl shadow-purple-900/30 text-lg px-10 py-7 font-bold animate-pulse-glow"
            onClick={() => handleGetNowClick('FinalCTA')}
          >
            <Lock className="w-5 h-5 mr-2" />
            100% Secure — Start Your AI Secretary Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mt-10 text-purple-200 text-base leading-relaxed max-w-xl mx-auto">
            <strong>P.S.</strong> When you sign up, your onboarding specialist will help you choose the perfect AI skills and workflows for your specific industry — at no extra cost.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Footer ──────────────────── */
function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/massapro-logo-v2.png"
              alt="MassaPro Logo"
              width={160}
              height={48}
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm text-gray-400 leading-relaxed">
              Intelligent AI receptionists and secretaries for businesses that never want to miss a customer again.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#mechanism" className="hover:text-purple-400 transition-colors">AI Receptionist</a></li>
              <li><a href="#mechanism" className="hover:text-purple-400 transition-colors">AI Secretary</a></li>
              <li><a href="#mechanism" className="hover:text-purple-400 transition-colors">AI Concierge</a></li>
              <li><a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Industries</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/hair-salon" className="hover:text-purple-400 transition-colors">Hair Salons</a></li>
              <li><a href="/nail-studio" className="hover:text-purple-400 transition-colors">Nail Studios</a></li>
              <li><a href="/beauty-shop" className="hover:text-purple-400 transition-colors">Beauty Shops</a></li>
              <li><a href="/vet-clinic" className="hover:text-purple-400 transition-colors">Veterinary Clinics</a></li>
              <li><a href="/med-spa" className="hover:text-purple-400 transition-colors">Med Spa</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <a href="mailto:hello@massapro.com" className="hover:text-purple-400 transition-colors">hello@massapro.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Remote-First Company
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MassaPro. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────── Main Page ──────────────────── */
export default function ExpertPage() {
  useEffect(() => {
    BackupTracker.trackPageView()
    const thresholds = [25, 50, 75, 90]
    const fired = new Set<number>()
    const onScroll = () => {
      const scrollH = document.documentElement.scrollHeight - window.innerHeight
      if (scrollH <= 0) return
      const pct = Math.round((window.scrollY / scrollH) * 100)
      for (const t of thresholds) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t)
          BackupTracker.trackScroll(t)
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <BrutalTruthSection />
        <WindowFrameSection />
        <MechanismSection />
        <ProductStackSection />
        <CompareSection />
        <FutureSelfSection />
        <GuaranteeSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  )
}
