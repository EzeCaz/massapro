'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadForm } from '@/components/LeadForm'
import {
  Phone,
  MessageSquare,
  Calendar,
  CreditCard,
  Users,
  Megaphone,
  Shield,
  Star,
  ChevronRight,
  ChevronDown,
  Check,
  Zap,
  Globe,
  Headphones,
  Bot,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Mail,
  MapPin,
  Clock,
  Heart,
  Send,
  Layers,
  Workflow,
  MousePointerClick,
  BarChart3,
  Languages,
  Palette,
  DollarSign,
  TrendingUp,
  Scissors,
} from 'lucide-react'

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

/* ──────────────────── Custom Mic Icon ──────────────────── */
function Mic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

/* ──────────────────── Navbar ──────────────────── */
function Navbar({ onOpenForm }: { onOpenForm: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Skills', href: '#skills' },
    { label: 'Flows', href: '#flows' },
    { label: 'Industries', href: '#industries', children: [
      { label: 'Med Spas', href: '/med-spa' },
      { label: 'Hair Salons', href: '/hair-salon' },
      { label: 'Nail Studios', href: '/nail-studio' },
      { label: 'Beauty Shops', href: '/beauty-shop' },
      { label: 'Veterinary Clinics', href: '/vet-clinic' },
    ]},
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
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
          {/* Logo + Badge */}
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/massapro-logo-v2.png"
              alt="MassaPro Logo"
              width={160}
              height={48}
              className="h-10 w-auto lg:h-12"
              priority
            />
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs font-semibold hidden sm:inline-flex">
              Med Spa
            </Badge>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative group">
                  <a
                    href={link.href}
                    className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
                  </a>
                  {/* Dropdown */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl shadow-purple-100/50 border border-purple-100 py-2 min-w-[220px]">
                      {link.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
                </a>
              )
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              asChild
            >
              <a href="#pricing">View Plans</a>
            </Button>
            <Button className="purple-gradient text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-300/30" onClick={onOpenForm}>
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-purple-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-medium text-gray-600 hover:text-purple-700 py-2"
                  >
                    {link.label}
                  </a>
                  <div className="pl-4 space-y-1">
                    {link.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm text-gray-500 hover:text-purple-700 py-1.5 border-l-2 border-purple-200 pl-3"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-gray-600 hover:text-purple-700 py-2"
                >
                  {link.label}
                </a>
              )
            )}
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" className="border-purple-300 text-purple-700 w-full" asChild>
                <a href="#pricing" onClick={() => setMobileOpen(false)}>View Plans</a>
              </Button>
              <Button className="purple-gradient text-white w-full" onClick={() => { setMobileOpen(false); onOpenForm(); }}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ──────────────────── Hero Section ──────────────────── */
function HeroSection({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-purple-50 to-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <FadeIn>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-1.5 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Powered Med Spa Automation
              </Badge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                Your Med Spa&apos;s{' '}
                <span className="purple-gradient-text">AI Secretary</span>
                <br />
                That Never Sleeps
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed">
                The $26.2B US med spa industry loses thousands every month — 39% of calls go unanswered while providers are with patients, and 85% of those callers never call back. MassaPro captures every call, texts back instantly, and books appointments 24/7.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="purple-gradient text-white hover:opacity-90 shadow-xl shadow-purple-300/30 text-base px-8 py-6"
                  onClick={onOpenForm}
                >
                  Start Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 text-base px-8 py-6"
                  asChild
                >
                  <a href="#services">
                    Explore Services
                  </a>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex items-center gap-8 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">500+ med spa businesses trust us</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-purple-500 text-purple-500" />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">4.9/5</span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: Hero Image */}
          <FadeIn delay={0.2} className="relative">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-200/40 rounded-2xl rotate-12 blur-sm" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-300/30 rounded-full blur-sm" />

              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/50 border border-purple-100">
                <Image
                  src="/medspa-hero-v2.png"
                  alt="Professional AI Receptionist for Med Spas"
                  width={864}
                  height={1152}
                  className="w-full h-auto object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
              </div>

              {/* Floating card - Bookings */}
              <div className="absolute -bottom-4 -left-4 sm:bottom-8 sm:-left-8 glass-card rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full purple-gradient flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Bookings Captured</p>
                    <p className="text-xs text-purple-600 font-medium">$15K+<span className="text-[0.5rem]">/month</span></p>
                  </div>
                </div>
              </div>

              {/* Floating card 2 - Calls */}
              <div className="absolute -top-4 -right-4 sm:top-8 sm:-right-8 glass-card rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Calls Answered</p>
                    <p className="text-xs text-green-600 font-medium">100% coverage</p>
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

/* ──────────────────── Stats Banner ──────────────────── */
function StatsBanner() {
  const stats = [
    { value: '$26.2B', label: 'Med Spa Market', icon: DollarSign },
    { value: '39%', label: 'Calls Unanswered', icon: Phone },
    { value: '75%', label: 'Clients Prefer Text', icon: MessageSquare },
    { value: '45%', label: 'Bookings After Hours', icon: Clock },
    { value: '<10s', label: 'AI Response Time', icon: Zap },
    { value: '65%', label: 'No-Show Recovery', icon: TrendingUp },
  ]

  return (
    <section className="py-16 purple-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/medspa-interior.png')] bg-cover bg-center opacity-5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08}>
              <div className="text-center text-white">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-200" />
                <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-purple-200 text-xs sm:text-sm font-medium">{stat.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Channel Logos ──────────────────── */
function ChannelBar() {
  const channels = [
    { name: 'SMS', icon: MessageSquare },
    { name: 'WhatsApp', icon: Phone },
    { name: 'Phone', icon: Headphones },
    { name: 'Telegram', icon: Send },
    { name: 'Social Media', icon: Globe },
    { name: 'CRM', icon: Users },
    { name: 'Google Sheets', icon: Layers },
  ]

  return (
    <section className="py-12 bg-white border-y border-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">
            Seamlessly connects to the platforms you already use
          </p>
        </FadeIn>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
          {channels.map((channel, i) => (
            <FadeIn key={channel.name} delay={i * 0.05}>
              <div className="flex items-center gap-2 text-gray-400 hover:text-purple-600 transition-colors cursor-default">
                <channel.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{channel.name}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Integrations Section ──────────────────── */
function IntegrationsSection() {
  const integrations = [
    { name: 'Instagram', logo: '/integ-instagram.png' },
    { name: 'Facebook', logo: '/integ-facebook.png' },
    { name: 'Telegram', logo: '/integ-telegram.png' },
    { name: 'Google Drive', logo: '/integ-gdrive.png' },
    { name: 'OneDrive', logo: '/integ-onedrive.png' },
    { name: 'Calendly', logo: '/integ-calendly.png' },
    { name: 'Discord', logo: '/integ-discord.png' },
    { name: 'WhatsApp', logo: '/integ-whatsapp.png' },
    { name: 'Slack', logo: '/integ-slack.png' },
    { name: 'Salesforce', logo: '/integ-salesforce.png' },
    { name: 'HubSpot', logo: '/integ-hubspot.png' },
    { name: 'Mailchimp', logo: '/integ-mailchimp.png' },
    { name: 'Trello', logo: '/integ-trello.png' },
    { name: 'Asana', logo: '/integ-asana.png' },
    { name: 'Jira', logo: '/integ-jira.png' },
    { name: 'Gmail', logo: '/integ-gmail.png' },
    { name: 'Outlook', logo: '/integ-outlook.png' },
    { name: 'Zoom', logo: '/integ-zoom.png' },
    { name: 'Google Meet', logo: '/integ-gmeet.png' },
    { name: 'Teams', logo: '/integ-teams.png' },
    { name: 'QuickBooks', logo: '/integ-quickbooks.png' },
    { name: 'Google Sheets', logo: '/integ-gsheets.png' },
    { name: 'Google Docs', logo: '/integ-gdocs.png' },
    { name: 'Excel', logo: '/integ-excel.png' },
    { name: 'Google Forms', logo: '/integ-gforms.png' },
    { name: 'PayPal', logo: '/integ-paypal.png' },
    { name: 'Stripe', logo: '/integ-stripe.png' },
    { name: 'Google Calendar', logo: '/integ-gcal.png' },
    { name: 'DaySchedule', logo: '/integ-dayschedule.png' },
    { name: 'Zoho Bookings', logo: '/integ-zoho.png' },
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-purple-50/30 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Integrations</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Integrates with Your <span className="purple-gradient-text">Favorite Platform</span>
            </h2>
            <p className="text-lg text-gray-500">
              MassaPro connects seamlessly with the tools you already use — including PatientNow, Aesthetix CRM, Zenoti, and Book4Time for med spas. From calendars and CRMs to payment gateways and booking platforms, everything works together.
            </p>
          </div>
        </FadeIn>

        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-purple-50/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Scrolling row 1 - left to right */}
          <div className="flex gap-6 mb-6 animate-scroll-left">
            {integrations.slice(0, 15).map((item, i) => (
              <div
                key={`${item.name}-1`}
                className="flex-shrink-0 flex flex-col items-center gap-3 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 px-6 py-5 w-[130px]"
              >
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-contain"
                />
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">{item.name}</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {integrations.slice(0, 15).map((item, i) => (
              <div
                key={`${item.name}-1d`}
                className="flex-shrink-0 flex flex-col items-center gap-3 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 px-6 py-5 w-[130px]"
              >
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-contain"
                />
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Scrolling row 2 - right to left */}
          <div className="flex gap-6 animate-scroll-right">
            {integrations.slice(15).map((item, i) => (
              <div
                key={`${item.name}-2`}
                className="flex-shrink-0 flex flex-col items-center gap-3 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 px-6 py-5 w-[130px]"
              >
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-contain"
                />
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">{item.name}</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {integrations.slice(15).map((item, i) => (
              <div
                key={`${item.name}-2d`}
                className="flex-shrink-0 flex flex-col items-center gap-3 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 px-6 py-5 w-[130px]"
              >
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-contain"
                />
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── AI Positions Section (Services) ──────────────────── */
function PositionsSection({ onOpenForm }: { onOpenForm: () => void }) {
  const positions = [
    {
      title: 'AI Receptionist for Med Spas',
      description:
        'Your front-line AI that answers calls, responds to texts, and routes inquiries — 24/7. While your providers are mid-treatment with Botox or laser sessions, MassaPro captures every call and message. Never lose another booking to voicemail with an AI receptionist that understands aesthetic medicine, speaks your patients\' language, and handles multiple conversations simultaneously across every channel.',
      icon: Phone,
      features: [
        'Answer every call — even during peak hours and after close',
        'Route treatment and product inquiries to the right provider',
        'Greet returning patients by name with their treatment history',
        'Capture consultation requests and waitlist sign-ups instantly',
      ],
      image: '/medspa-receptionist.png',
    },
    {
      title: 'AI Secretary for Med Spas',
      description:
        'A full-featured AI secretary that manages your complex med spa appointment calendar, handles multi-duration bookings, sends reminders, and processes deposits. Think of it as a dedicated assistant who understands that CoolSculpting takes 60 minutes, a full-face filler session takes 90 minutes, and a Botox touch-up is 20 minutes — and schedules accordingly without ever double-booking.',
      icon: Calendar,
      features: [
        'Manage multi-duration appointments with smart time-slot logic',
        'Send confirmations & reminders — reduce no-shows by up to 65%',
        'Handle same-day rescheduling for laser treatments and fillers',
        'Process deposits and cancellation fees for high-value treatments',
      ],
      image: '/medspa-secretary.png',
    },
    {
      title: 'AI Concierge for Med Spas',
      description:
        'Premium full-service AI that delivers the white-glove experience your med spa patients expect. Your AI Concierge provides personalized treatment consultations, proactive aftercare follow-ups, VIP loyalty management, and multi-language support — the ultimate luxury experience that turns first-time visitors into lifelong patients.',
      icon: Star,
      features: [
        'Multi-language support (5+) for diverse clientele',
        'Personalized aftercare follow-ups and skincare tips',
        'VIP recognition with preference-based booking',
        'Proactive rebooking and seasonal promotion campaigns',
      ],
      image: '/medspa-concierge.png',
    },
  ]

  return (
    <section id="services" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">AI Positions</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Choose Your <span className="purple-gradient-text">AI Role</span>
            </h2>
            <p className="text-lg text-gray-500">
              Each position is a specialized AI persona designed for med spa operations. Deploy one or combine them for complete coverage — from front desk to VIP concierge.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-20">
          {positions.map((pos, idx) => (
            <FadeIn key={pos.title} delay={0.1}>
              <div
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl purple-gradient flex items-center justify-center shadow-lg shadow-purple-200/50">
                      <pos.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">{pos.title}</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">{pos.description}</p>
                  <ul className="space-y-3">
                    {pos.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30" onClick={onOpenForm}>
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-purple-100/50 border border-purple-50">
                    <Image
                      src={pos.image}
                      alt={pos.title}
                      width={1344}
                      height={768}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent" />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Advantages Section ──────────────────── */
function AdvantagesSection() {
  const advantages = [
    {
      title: 'Revenue Recovery',
      stat: '$15K+/month',
      description: 'Recapture missed booking revenue from the 39% of calls that go unanswered while your team is with patients.',
      icon: DollarSign,
    },
    {
      title: 'Lightning-Fast Response',
      stat: '<10s',
      description: 'AI responds to every inquiry in under 10 seconds — before your competitor even picks up the phone.',
      icon: Zap,
    },
    {
      title: 'After-Hours Booking',
      stat: '45%',
      description: '45% of med spa appointments are booked outside business hours. Capture them all with 24/7 AI coverage.',
      icon: Clock,
    },
    {
      title: 'No-Show Reduction',
      stat: '5%',
      description: 'Cut no-shows from 20%+ down to under 5% with automated reminders and deposit handling.',
      icon: TrendingUp,
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Advantages</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Why Med Spas <span className="purple-gradient-text">Choose MassaPro</span>
            </h2>
            <p className="text-lg text-gray-500">
              Every missed call is a missed Botox appointment, a missed filler booking, a missed laser treatment. MassaPro stops the revenue leak.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((adv, i) => (
            <FadeIn key={adv.title} delay={i * 0.1}>
              <Card className="group h-full border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl purple-gradient flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform duration-300">
                    <adv.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold purple-gradient-text mb-1">
                    {adv.stat.split('/').map((part, i) =>
                      i === 0 ? part : <span key={i} className="text-base sm:text-lg">/{part}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{adv.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">{adv.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Skills Section ──────────────────── */
function SkillsSection() {
  const skills = [
    {
      title: 'Appointment Management',
      description:
        'Full lifecycle appointment handling for med spa services — from booking Botox, fillers, and laser treatments to sending reminders and follow-ups. Handles multi-duration scheduling so a 20-minute Botox touch-up never blocks a 90-minute CoolSculpting slot. Reduce no-shows by up to 65% with automated reminders.',
      icon: Calendar,
    },
    {
      title: 'Treatment Consultation & Sales',
      description:
        'AI-powered aesthetic consultations and treatment recommendations. Your AI understands the difference between Botox and Dysport, recommends the right filler for nasolabial folds vs. lip augmentation, and upsells add-on treatments like microneedling or PRP — turning inquiries into high-value bookings.',
      icon: Sparkles,
    },
    {
      title: 'Payment & Deposit Handling',
      description:
        'Securely process deposits for high-value treatments, handle cancellation fees, send invoices, and manage billing inquiries. Require deposits for laser packages and filler sessions to slash no-shows. Integrated with your preferred payment gateways for seamless transactions.',
      icon: CreditCard,
    },
    {
      title: 'Customer Support & FAQ',
      description:
        'Instantly answer common med spa questions about prep instructions, aftercare, pricing, service durations, and policies. &ldquo;How do I prep for Botox?&rdquo; &ldquo;Can I exercise after fillers?&rdquo; Your AI knows the answers and learns from every interaction.',
      icon: Headphones,
    },
    {
      title: 'Marketing & Follow-up',
      description:
        'Automate post-treatment aftercare follow-ups, review requests, seasonal promotion campaigns (holiday glow packages, summer body contouring), and re-engagement sequences. Send personalized skincare tips between visits that keep patients loyal and coming back.',
      icon: Megaphone,
    },
    {
      title: 'Multi-Channel Orchestration',
      description:
        'Unify conversations across phone, SMS, WhatsApp, Instagram DMs, Telegram, and web chat. One consistent AI experience across every touchpoint your med spa patients use — because 75% of them prefer texting over calling.',
      icon: Globe,
    },
  ]

  return (
    <section id="skills" className="py-20 lg:py-28 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Core Skills</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Powerful <span className="purple-gradient-text">AI Skills</span> for Med Spas
            </h2>
            <p className="text-lg text-gray-500">
              Each skill is purpose-built for med spa operations. Mix and match to build the perfect AI assistant for your unique services.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, i) => (
            <FadeIn key={skill.title} delay={i * 0.08}>
              <Card className="group h-full border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 group-hover:bg-purple-600 flex items-center justify-center mb-2 transition-colors duration-300">
                    <skill.icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl">{skill.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{skill.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Flows Section ──────────────────── */
function FlowsSection() {
  const flowCategories = [
    {
      category: 'Appointment Booking',
      icon: Calendar,
      flows: [
        'Botox, Filler & Laser Appointment Booking with Smart Duration',
        'Chemical Peel & Treatment Rescheduling with Prep Reminders',
        'Same-Day Availability & Waitlist for Cancellations',
        'Multi-Service Booking (Botox + Filler + Microneedling Combo)',
        'Consultation & Treatment Coordination with Multiple Providers',
      ],
    },
    {
      category: 'Patient Engagement',
      icon: Heart,
      flows: [
        'Treatment Consultation Intake & Service Recommendation',
        'Post-Treatment Aftercare Follow-up with Customized Tips',
        'No-Show Recovery with Rebooking Incentives',
        'Seasonal Promotion Campaigns (Holiday Glow, Summer Body)',
        'VIP & Loyalty Program Management with Priority Booking',
      ],
    },
    {
      category: 'Spa Operations',
      icon: Workflow,
      flows: [
        'Deposit & Cancellation Fee Processing for High-Value Treatments',
        'New Patient Lead Qualification & Treatment Intake Forms',
        'Product Reorder & Retail Sales Follow-up',
        'Provider Schedule Sync & Multi-Provider Coordination',
        'Review Request & Referral Program Automation',
      ],
    },
  ]

  return (
    <section id="flows" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Workflows</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Customizable <span className="purple-gradient-text">AI Flows</span>
            </h2>
            <p className="text-lg text-gray-500">
              Pre-built workflows designed for med spa operations — from Botox prep reminders to body contouring coordination. Deploy as-is or we customize for your unique services.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {flowCategories.map((cat, i) => (
            <FadeIn key={cat.category} delay={i * 0.1}>
              <Card className="h-full border-purple-100 bg-gradient-to-b from-white to-purple-50/30 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl purple-gradient flex items-center justify-center shadow-lg shadow-purple-200/50 mb-2">
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{cat.category}</CardTitle>
                  <CardDescription className="text-gray-500">
                    {cat.flows.length} pre-built workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {cat.flows.map((flow) => (
                      <li key={flow} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ChevronRight className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{flow}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Industry customization callout */}
        <FadeIn delay={0.3}>
          <div className="mt-12 rounded-2xl purple-gradient p-8 lg:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/medspa-interior.png')] bg-cover bg-center opacity-5" />
            <div className="relative">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-purple-200" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Built for Med Spas</h3>
              <p className="text-purple-100 max-w-2xl mx-auto text-lg">
                Every flow is customized for med spa workflows — from Botox prep instructions to filler aftercare reminders, from treatment consultation intakes to body contouring scheduling. Your AI speaks your med spa&apos;s language.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Pricing Section ──────────────────── */
function PricingSection({ onOpenForm }: { onOpenForm: () => void }) {
  const tiers = [
    {
      name: 'Basic',
      price: '$500',
      period: '/month',
      description:
        'Perfect for independent med spas and small practices offering Botox, fillers, and chemical peels with a single location.',
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
    },
    {
      name: 'Professional',
      price: '$1,200',
      period: '/month',
      description:
        'Ideal for busy med spas with multiple providers, premium treatments like laser resurfacing and body contouring, and higher patient volume.',
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
    },
    {
      name: 'Enterprise',
      price: '$2,000',
      period: '/month',
      description:
        'Designed for multi-location med spa brands, medical-aesthetic hybrid clinics, or high-volume practices needing VIP concierge-level service.',
      features: [
        '3+ Skills included',
        'Unlimited Flows/Tasks',
        '10,000+ interactions/month',
        'Dedicated AI optimization team',
        'Custom integrations (PatientNow, Aesthetix CRM, Zenoti, Book4Time)',
        'Multi-language support (2+ languages)',
        'White-glove VIP concierge service',
        'Multi-location management',
        'No setup fee (min 3 months)',
      ],
      highlight: false,
      badge: '',
    },
  ]

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Simple, <span className="purple-gradient-text">Transparent</span> Pricing
            </h2>
            <p className="text-lg text-gray-500">
              No setup fee. Minimum 3-month agreement. Inbound communications included. Outbound credits billed separately at cost.
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
                    : 'border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50'
                } transition-all duration-300`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="purple-gradient text-white px-4 py-1 text-xs font-bold shadow-lg shadow-purple-300/30">
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
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
                  <Button
                    className={`w-full ${
                      tier.highlight
                        ? 'purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                    onClick={onOpenForm}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Add-ons */}
        <FadeIn delay={0.3}>
          <div className="mt-20">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              <span className="purple-gradient-text">Add-ons</span> for Every Tier
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { title: 'Additional Skill', price: '+$400/mo', icon: Zap, desc: 'Add another skill to your plan' },
                { title: 'Extra 1,000 Interactions', price: '+$150/mo', icon: BarChart3, desc: 'Scale your interaction capacity' },
                { title: 'Custom Voice Cloning', price: 'One-time $750', icon: Mic, desc: 'Clone your brand voice' },
                { title: '24/7 Human Escalation', price: '+$300/mo', icon: Shield, desc: 'Seamless handoff to real humans' },
              ].map((addon, i) => (
                <Card
                  key={addon.title}
                  className="group border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 bg-white/80"
                >
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-600 flex items-center justify-center transition-colors duration-300">
                      <addon.icon className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-base">{addon.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{addon.desc}</p>
                    <p className="text-lg font-bold text-purple-700 mt-2">{addon.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Testimonials Section ──────────────────── */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "We were missing 15+ calls a day during peak hours — providers can't stop mid-Botox session to answer the phone. MassaPro now captures every single call and books consultations, fillers, and laser appointments on the spot. We recovered over $22K in the first month alone.",
      name: 'Dr. Amara Johnson',
      role: 'Owner, Radiance Med Spa',
      photo: '/review-medspa-1.png',
    },
    {
      quote:
        "Our VIP patients expect instant, personalized service. MassaPro recognizes them by name, knows their treatment history, and books their favorite treatments without any back-and-forth. It's luxury-level service at scale — our retention rate jumped from 45% to 72%.",
      name: 'Sophia Reynolds',
      role: 'Director, Glow Aesthetics',
      photo: '/review-medspa-2.png',
    },
    {
      quote:
        "The aftercare follow-ups with customized treatment tips have been a game-changer for our laser and filler patients. They feel cared for between visits, and our rebooking rate for premium treatments went from 30% to over 60%. Best investment we've made.",
      name: 'Dr. Michelle Tran',
      role: 'Founder, Skin & Beauty Clinic',
      photo: '/review-medspa-3.png',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Loved by <span className="purple-gradient-text">Med Spa Owners</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <Card className="h-full border-purple-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-purple-500 text-purple-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                </CardHeader>
                <CardFooter>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </CardFooter>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── CTA Section ──────────────────── */
function CTASection({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section id="contact" className="py-20 lg:py-28 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative rounded-3xl purple-gradient overflow-hidden shadow-2xl shadow-purple-300/30">
            <div className="absolute inset-0 bg-[url('/medspa-hero-v2.png')] bg-cover bg-center opacity-10" />
            <div className="relative px-8 py-16 lg:px-16 lg:py-20 text-center">
              <FadeIn>
                <Badge className="bg-white/20 text-white hover:bg-white/20 mb-4 border-0">Stop Losing Revenue</Badge>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Stop Losing $15K+/Month
                  <br />
                  in Missed Med Spa Appointments
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-8">
                  Every unanswered call is a patient who books with your competitor. Start with a free consultation — no setup fee, no hidden costs. Your AI receptionist deploys in minutes and starts capturing revenue immediately.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-purple-50 shadow-xl text-base px-8 py-6 font-semibold"
                    onClick={onOpenForm}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Get Free Consultation
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-purple-700 hover:bg-purple-50 border-white/30 text-base px-8 py-6 font-semibold"
                    onClick={onOpenForm}
                  >
                    View Pricing <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── FAQ Section ──────────────────── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'Can MassaPro handle Botox and filler appointments with different durations and provider preferences?',
      answer:
        'Absolutely. MassaPro is designed for med spas with complex multi-duration scheduling. Our AI understands that Botox needs 20-30 minutes, a full-face filler session requires 60-90 minutes, and CoolSculpting takes 45-60 minutes per area. It automatically finds the right time slots, prevents double-booking, and even handles back-to-back multi-service appointments like a Botox plus microneedling combo.',
    },
    {
      question: 'Does the AI actually understand aesthetic treatments enough to consult with patients?',
      answer:
        'Yes — MassaPro is trained on med-spa-specific knowledge. It can explain the difference between Botox and Dysport, recommend the right filler for nasolabial folds vs. lip augmentation, and answer pre- and post-treatment questions. For medical-grade consultations or complex concerns, the AI gracefully collects the patient\'s information and routes them to your provider for a personalized consultation.',
    },
    {
      question: 'How does MassaPro handle deposits for high-value treatments like laser packages and body contouring?',
      answer:
        'MassaPro manages the entire deposit workflow for high-value treatments. When a patient books a laser resurfacing or CoolSculpting package, the AI collects a deposit automatically via your integrated payment gateway. If they cancel outside the policy window, the cancellation fee is processed. This alone reduces no-shows by up to 65% for premium med spa services — protecting your revenue and provider schedules.',
    },
    {
      question: 'Does MassaPro integrate with PatientNow, Aesthetix CRM, Zenoti, or Book4Time?',
      answer:
        'Yes. MassaPro integrates with the most popular med spa management platforms including PatientNow, Aesthetix CRM, Zenoti, and Book4Time. Your AI syncs appointments, reads availability, and writes bookings directly into your existing system. No double-entry, no manual syncing — everything flows seamlessly between MassaPro and your practice management platform.',
    },
    {
      question: 'Can MassaPro send aftercare follow-ups after Botox, fillers, and laser treatments?',
      answer:
        'Definitely. Aftercare follow-up is one of our most impactful features for med spas. After each treatment, MassaPro sends customized aftercare instructions — specific to the service received. A Botox patient gets different aftercare than a chemical peel patient. The follow-up sequence includes day-1, day-3, and day-7 check-ins, skincare tips, and a rebooking prompt that typically recovers 65% of patients who would otherwise not return.',
    },
    {
      question: 'How much does MassaPro cost for a med spa, and what\'s the ROI?',
      answer:
        'Plans start at $500/month for the Basic tier. Most med spas recover that investment within the first week — a single captured Botox booking ($300+) or filler appointment ($600+) more than covers the monthly cost. With an average of $15K+/month in recovered missed revenue, the ROI is substantial. We offer a free consultation to analyze your specific call volume and booking patterns so you can see the exact impact before committing.',
    },
  ]

  return (
    <section id="faq" className="py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Med Spa <span className="purple-gradient-text">FAQ</span>
            </h2>
            <p className="text-lg text-gray-500">
              Questions specific to med spas. Can&apos;t find the answer you&apos;re looking for? Reach out to our team.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                className={`rounded-2xl border transition-all duration-300 ${
                  openIndex === i
                    ? 'border-purple-300 shadow-lg shadow-purple-100/50 bg-white'
                    : 'border-purple-100 bg-white hover:border-purple-200 hover:shadow-md hover:shadow-purple-50'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-800 pr-4">{faq.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-purple-500 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === i ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* CTA under FAQ */}
        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Still have questions?</p>
            <Button
              size="lg"
              className="purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30 text-base px-8 py-6"
              onClick={() => {
                const formOpenBtn = document.querySelector('[data-open-form]') as HTMLButtonElement | null
                if (formOpenBtn) formOpenBtn.click()
              }}
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Our Team
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────── Footer ──────────────────── */
function Footer() {
  const industries = [
    { name: 'Med Spas', href: '/med-spa', active: true, disabled: false },
    { name: 'Hair Salons', href: '/hair-salon', active: false, disabled: false },
    { name: 'Nail Studios', href: '/nail-studio', active: false, disabled: false },
    { name: 'Beauty Shops', href: '/beauty-shop', active: false, disabled: false },
    { name: 'Veterinary Clinics', href: '#', active: false, disabled: true },
    { name: 'Wellness Centers', href: '#', active: false, disabled: true },
  ]

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/massapro-logo-v2.png"
              alt="MassaPro Logo"
              width={160}
              height={48}
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm text-gray-400 leading-relaxed">
              Intelligent AI receptionists and secretaries for med spas that never want to miss a patient again.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-purple-400 transition-colors">AI Receptionist</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">AI Secretary</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">AI Concierge</a></li>
              <li><a href="#skills" className="hover:text-purple-400 transition-colors">Skills & Flows</a></li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="font-semibold text-white mb-4">Industries</h4>
            <ul className="space-y-2 text-sm">
              {industries.map((ind) => (
                <li key={ind.name}>
                  {ind.disabled ? (
                    <span className="text-gray-600 cursor-not-allowed">{ind.name} <span className="text-xs text-gray-700">(Coming Soon)</span></span>
                  ) : ind.active ? (
                    <span className="text-purple-400 font-semibold">{ind.name}</span>
                  ) : (
                    <a href={ind.href} className="hover:text-purple-400 transition-colors">{ind.name}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
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
export default function MedSpaPage() {
  const [formOpen, setFormOpen] = useState(false)

  const openForm = useCallback(() => setFormOpen(true), [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenForm={openForm} />
      <main className="flex-grow">
        <HeroSection onOpenForm={openForm} />
        <StatsBanner />
        <ChannelBar />
        <IntegrationsSection />
        <PositionsSection onOpenForm={openForm} />
        <AdvantagesSection />
        <SkillsSection />
        <FlowsSection />
        <PricingSection onOpenForm={openForm} />
        <TestimonialsSection />
        <CTASection onOpenForm={openForm} />
        <FAQSection />
      </main>
      <Footer />
      <LeadForm open={formOpen} onOpenChange={setFormOpen} prefillIndustry="Med Spa" />
    </div>
  )
}
