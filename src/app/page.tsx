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
          {/* Logo */}
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
                <a href="#pricing">View Plans</a>
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
                AI-Powered Business Automation
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
                MassaPro delivers intelligent, voice + text Agentic AI receptionists and secretaries tailored for
                hair salons, nail studios, beauty shops, veterinary clinics, and more.
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
                  <span className="text-sm text-gray-500">500+ businesses trust us</span>
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
                  src="/hero-secretary-v2.png"
                  alt="Professional AI Receptionist"
                  width={864}
                  height={1152}
                  className="w-full h-auto object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
              </div>

              {/* Floating card */}
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

              {/* Floating card 2 */}
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
              MassaPro connects seamlessly with the tools you already use. From calendars and CRMs to payment gateways and communication platforms — everything works together.
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

/* ──────────────────── AI Positions Section ──────────────────── */
function PositionsSection({ onOpenForm }: { onOpenForm: () => void }) {
  const positions = [
    {
      title: 'AI Receptionist',
      description:
        'Your front-line AI that answers calls, responds to messages, and routes inquiries — 24/7. Never miss a customer again with an AI receptionist that sounds natural, understands context, and handles multiple conversations simultaneously across all your channels.',
      icon: Phone,
      features: ['Answer inbound calls 24/7', 'Route messages intelligently', 'Greet customers by name', 'Transfer to human when needed'],
      image: '/vet-receptionist-v2.png',
    },
    {
      title: 'AI Secretary / Virtual Assistant',
      description:
        'A full-featured AI secretary that manages your calendar, books appointments, sends reminders, and handles administrative tasks. Think of it as having a dedicated assistant who works around the clock without breaks, ensuring nothing falls through the cracks.',
      icon: Calendar,
      features: ['Manage appointments & calendar', 'Send confirmations & reminders', 'Handle rescheduling instantly', 'Process payments & deposits'],
      image: '/team-secretaries-v4.png',
    },
    {
      title: 'AI Concierge',
      description:
        'Premium full-service AI that goes beyond basic tasks. Your AI Concierge provides personalized customer experiences, proactive outreach, loyalty management, and multi-language support — the ultimate white-glove service for discerning businesses.',
      icon: Star,
      features: ['Multi-language support (5+)', 'Proactive outreach campaigns', 'Personalized customer experiences', 'White-glove VIP service'],
      image: '/ai-concierge-v4.png',
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
              Each position is a specialized AI persona designed to handle specific business functions. Deploy one or combine them for complete coverage.
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

/* ──────────────────── Skills Section ──────────────────── */
function SkillsSection() {
  const skills = [
    {
      title: 'Appointment Management',
      description:
        'Full lifecycle appointment handling — from booking and confirmation to reminders and follow-ups. Reduce no-shows by up to 40% with automated reminders and easy rescheduling.',
      icon: Calendar,
    },
    {
      title: 'Customer Support & FAQ',
      description:
        'Instantly answer common questions about services, pricing, hours, and policies. Your AI learns from every interaction, getting smarter and more accurate over time.',
      icon: Headphones,
    },
    {
      title: 'Payment & Billing Handling',
      description:
        'Securely process payments, handle deposits, send invoices, and manage billing inquiries. Integrated with your preferred payment gateways for seamless transactions.',
      icon: CreditCard,
    },
    {
      title: 'Lead Qualification & Sales',
      description:
        'Qualify incoming leads automatically with smart questionnaires, score them based on your criteria, and route hot leads to your team for immediate follow-up.',
      icon: Users,
    },
    {
      title: 'Marketing & Follow-up',
      description:
        'Automate post-service follow-ups, review requests, loyalty campaigns, and re-engagement sequences. Turn one-time visitors into loyal customers effortlessly.',
      icon: Megaphone,
    },
    {
      title: 'Multi-Channel Orchestration',
      description:
        'Unify conversations across phone, SMS, WhatsApp, Telegram, social media, and web chat. One consistent AI experience across every touchpoint your customers use.',
      icon: Globe,
    },
  ]

  return (
    <section id="skills" className="py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Core Skills</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Powerful <span className="purple-gradient-text">AI Skills</span> for Your Business
            </h2>
            <p className="text-lg text-gray-500">
              Each skill costs $500/month in the Basic tier. Mix and match to build the perfect AI assistant for your unique needs.
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
      category: 'Appointment Management',
      icon: Calendar,
      flows: [
        'Appointment Booking, Confirmation & Reminders',
        'Cancellation & Rescheduling',
        'Pre-Appointment Preparation Calls',
        'Availability & Waitlist Management',
      ],
    },
    {
      category: 'Customer Engagement',
      icon: Heart,
      flows: [
        'Customer Support & FAQ Handling',
        'Post-Service Follow-up & Review Requests',
        'No-Show Recovery',
        'Loyalty & Promotion Campaigns',
      ],
    },
    {
      category: 'Business Operations',
      icon: Workflow,
      flows: [
        'Payment Processing & Deposit Confirmation',
        'Lead Qualification',
        'Emergency Handling (especially for vets)',
        'Marketing & Follow-up Automation',
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
              Pre-built workflows ready to deploy, or we customize flows for your industry — from hair color consultations for salons to pet vaccination reminders for veterinary clinics.
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
            <div className="absolute inset-0 bg-[url('/salon-interior-v2.png')] bg-cover bg-center opacity-10" />
            <div className="relative">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-purple-200" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Industry-Customized Flows</h3>
              <p className="text-purple-100 max-w-2xl mx-auto text-lg">
                We customize flows for your industry — hair color consultation for salons, pet vaccination reminders
                for vets, treatment follow-ups for beauty clinics, and more. Your AI speaks your industry&apos;s language.
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
        'Perfect for small single-location businesses such as independent hair salons, nail studios, or small beauty shops.',
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
        'Ideal for growing businesses with moderate volume. Great for busier salons or clinics handling more daily inquiries.',
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
        'Designed for multi-location businesses, high-volume practices, or brands needing VIP concierge-level service.',
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
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
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

function Mic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

/* ──────────────────── How It Works ──────────────────── */
function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Consult & Customize',
      description:
        'We start with a free consultation to understand your business, customers, and workflows. Together, we choose the right AI position, skills, and flows tailored to your industry.',
      icon: MessageSquare,
    },
    {
      step: '02',
      title: 'Deploy & Connect',
      description:
        'Your AI is configured and connected to your channels — phone, SMS, WhatsApp, social media, CRM, and more. We handle the technical setup so you can focus on what you do best.',
      icon: Zap,
    },
    {
      step: '03',
      title: 'Monitor & Optimize',
      description:
        'Our team continuously monitors your AI performance, fine-tunes responses, and optimizes workflows. With advanced analytics, you always know how your AI is performing.',
      icon: BarChart3,
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Up and Running <span className="purple-gradient-text">in 3 Steps</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200" />

          {steps.map((step, i) => (
            <FadeIn key={step.step} delay={i * 0.15}>
              <div className="text-center relative">
                <div className="w-16 h-16 rounded-2xl purple-gradient flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200/50 relative z-10">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">Step {step.step}</span>
                <h3 className="text-xl font-bold mt-2 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Stats Section ──────────────────── */
function StatsSection() {
  const stats = [
    { value: '98.5%', label: 'Appointment Fill Rate', icon: Calendar },
    { value: '40%', label: 'No-Show Reduction', icon: Clock },
    { value: '24/7', label: 'Always Available', icon: Globe },
    { value: '<3s', label: 'Average Response Time', icon: Zap },
  ]

  return (
    <section className="py-16 purple-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/multi-channel-v2.png')] bg-cover bg-center opacity-5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center text-white">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-200" />
                <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-purple-200 text-sm font-medium">{stat.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Testimonials Section ──────────────────── */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "MassaPro's AI receptionist has transformed our salon. We never miss a booking anymore, and our clients love the instant confirmation and reminders. Our no-show rate dropped by 45%!",
      name: 'Sarah Mitchell',
      role: 'Owner, Luxe Hair Studio',
      photo: '/testimonial-1-v3.png',
    },
    {
      quote:
        "As a busy veterinary clinic, we needed 24/7 coverage. MassaPro handles emergency triage, appointment scheduling, and follow-ups flawlessly. It's like having three extra staff members.",
      name: 'Dr. James Rodriguez',
      role: 'Director, Paws & Claws Vet',
      photo: '/testimonial-2-v3.png',
    },
    {
      quote:
        'The multi-channel support is incredible. Our clients reach us on WhatsApp, Instagram, phone — and MassaPro handles it all seamlessly. Best investment we made this year.',
      name: 'Lisa Chen',
      role: 'Manager, Glow Beauty Bar',
      photo: '/testimonial-3-v3.png',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Loved by <span className="purple-gradient-text">Businesses</span>
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

/* ──────────────────── Industries Section ──────────────────── */
function IndustriesSection() {
  const industries = [
    {
      name: 'Hair Salons',
      image: '/industry-hair-salon-v2.png',
      description:
        'MassaPro transforms hair salons by handling the full appointment lifecycle — from booking and confirmation to reminders and follow-ups. Your AI receptionist answers calls, responds to texts, and manages your calendar so your stylists can focus on what they do best: creating beautiful hair.',
      advantages: [
        'Reduce no-shows by up to 40% with automated SMS reminders',
        'Handle color consultation requests and pre-appointment questions',
        'Manage rebooking and loyalty campaigns automatically',
        'Process deposit payments and cancellation fees seamlessly',
      ],
      services: ['Appointment Booking & Reminders', 'Color Consultation Intake', 'Deposit & Payment Handling', 'Post-Visit Follow-up & Reviews', 'Rebooking & Loyalty Campaigns'],
      reviews: [
        {
          quote: 'Our no-show rate dropped from 30% to under 10%. The AI handles all appointment calls and texts so my stylists never have to stop mid-cut to answer the phone.',
          name: 'Jessica Torres',
          role: 'Owner, Luxe Hair Studio',
          photo: '/review-hair-1.png',
          stars: 5,
        },
        {
          quote: 'I used to miss 15+ calls a day during peak hours. Now MassaPro books appointments while I focus on my clients. Revenue is up 25% in just two months.',
          name: 'Amanda Chen',
          role: 'Manager, Style & Co. Salon',
          photo: '/review-hair-2.png',
          stars: 5,
        },
        {
          quote: 'The deposit handling alone saved us thousands. No more wasted time slots from no-shows. Clients love the instant confirmation and reminder texts.',
          name: 'Rachel Morrison',
          role: 'Founder, The Hair Lounge',
          photo: '/review-hair-3.png',
          stars: 5,
        },
      ],
    },
    {
      name: 'Nail Studios',
      image: '/industry-nail-studio-v3.png',
      description:
        'Nail studios thrive on repeat bookings and walk-in traffic. MassaPro captures every call and message, books appointments around your technicians\' availability, and keeps your chairs full. From gel manicures to intricate nail art consultations, your AI handles it all with a personal touch.',
      advantages: [
        'Capture every walk-in inquiry even during busy hours',
        'Automate appointment confirmations and same-day reminders',
        'Handle nail art consultation requests with pre-set Q&A',
        'Run seasonal promotion campaigns automatically',
      ],
      services: ['Appointment Booking & Reminders', 'Walk-In Inquiry Handling', 'Service & Pricing FAQ', 'Promotion & Seasonal Campaigns', 'Post-Service Follow-up'],
      reviews: [
        {
          quote: 'We get so many texts asking about availability and pricing. MassaPro handles all of them instantly and books appointments directly into our calendar. It\'s like having a 24/7 front desk.',
          name: 'Sophia Williams',
          role: 'Owner, Diamond Nails',
          photo: '/review-nail-1.png',
          stars: 5,
        },
        {
          quote: 'Our seasonal promotions used to require manual texting to hundreds of clients. Now MassaPro sends personalized offers automatically, and our rebooking rate jumped 35%.',
          name: 'Mia Johnson',
          role: 'Manager, Pink Petals Studio',
          photo: '/review-nail-2.png',
          stars: 5,
        },
        {
          quote: 'Clients love that they can book at midnight after seeing our Instagram posts. MassaPro captures those late-night inquiries that we used to lose completely.',
          name: 'Emily Park',
          role: 'Founder, Nail Artistry Co.',
          photo: '/review-nail-3.png',
          stars: 5,
        },
      ],
    },
    {
      name: 'Beauty Shops',
      image: '/industry-beauty-shop.png',
      description:
        'Beauty shops and spas juggle multiple services, varied appointment durations, and a clientele that expects premium communication. MassaPro\'s AI Concierge handles complex booking scenarios, package deals, and VIP client management — delivering the white-glove experience your brand promises.',
      advantages: [
        'Manage multi-service bookings with correct time slots',
        'Handle VIP and loyalty program inquiries automatically',
        'Send personalized post-treatment care instructions',
        'Coordinate multi-stylist bookings for bridal and group packages',
      ],
      services: ['Multi-Service Booking', 'VIP & Loyalty Management', 'Package & Gift Card Sales', 'Post-Treatment Follow-up', 'Bridal & Group Booking Coordination'],
      reviews: [
        {
          quote: 'Managing bridal party bookings used to be a nightmare of back-and-forth calls. MassaPro coordinates the entire group — multiple services, multiple stylists, one seamless booking experience.',
          name: 'Olivia Grant',
          role: 'Owner, Glow Beauty Bar',
          photo: '/review-beauty-1.png',
          stars: 5,
        },
        {
          quote: 'Our VIP clients expect instant responses. MassaPro recognizes them by name, knows their preferences, and books their favorite treatments without any friction. It\'s luxury service at scale.',
          name: 'Isabella Martinez',
          role: 'Director, Serene Spa & Beauty',
          photo: '/review-beauty-2.png',
          stars: 5,
        },
        {
          quote: 'The post-treatment follow-ups with care instructions and rebooking prompts have been a game-changer. Our client retention went from 45% to over 70% in three months.',
          name: 'Hannah Brooks',
          role: 'Founder, Aura Aesthetics',
          photo: '/review-beauty-3.png',
          stars: 5,
        },
      ],
    },
    {
      name: 'Veterinary Clinics',
      image: '/industry-vet-clinic.png',
      description:
        'Veterinary clinics face unique challenges — emergency triage, vaccination schedules, and worried pet owners who need reassurance at all hours. MassaPro\'s AI handles emergency call routing, appointment scheduling, and prescription refill requests, ensuring no pet owner is left waiting when it matters most.',
      advantages: [
        'Triage emergency calls and route to on-call vets immediately',
        'Automate vaccination reminders and annual checkup scheduling',
        'Handle prescription refill requests without staff intervention',
        'Send pre-appointment preparation instructions to pet owners',
      ],
      services: ['Emergency Triage & Routing', 'Vaccination & Checkup Reminders', 'Appointment Scheduling', 'Prescription Refill Handling', 'Pre-Visit Preparation Instructions'],
      reviews: [
        {
          quote: 'Before MassaPro, emergency calls after hours went to voicemail. Now our AI triages the call, gathers critical info, and routes emergencies to the on-call vet instantly. It\'s been life-saving — literally.',
          name: 'Dr. Marcus Webb',
          role: 'Director, Paws & Claws Veterinary',
          photo: '/review-vet-1.png',
          stars: 5,
        },
        {
          quote: 'Vaccination reminders alone have increased our preventive care visits by 40%. Pet owners appreciate the timely texts, and our revenue from wellness visits has grown significantly.',
          name: 'Dr. Sarah Kim',
          role: 'Owner, Healthy Paws Clinic',
          photo: '/review-vet-2.png',
          stars: 5,
        },
        {
          quote: 'We handle 200+ calls daily. MassaPro now manages the routine ones — prescription refills, appointment confirmations, and basic questions — freeing our staff for the patients in front of us.',
          name: 'Dr. David Patel',
          role: 'Lead Vet, Greenfield Animal Hospital',
          photo: '/review-vet-3.png',
          stars: 5,
        },
      ],
    },
    {
      name: 'Wellness Centers',
      image: '/industry-wellness.png',
      description:
        'Wellness centers offer diverse services — yoga classes, meditation sessions, massage therapy, and holistic treatments. MassaPro unifies all your booking channels, manages class capacities, handles waitlists, and sends personalized wellness tips to keep your community engaged between visits.',
      advantages: [
        'Manage class bookings with real-time capacity tracking',
        'Automate waitlist management for popular sessions',
        'Send personalized wellness tips and content between visits',
        'Handle multi-practitioner scheduling seamlessly',
      ],
      services: ['Class & Session Booking', 'Waitlist & Capacity Management', 'Multi-Practitioner Scheduling', 'Wellness Content & Engagement', 'Membership & Package Management'],
      reviews: [
        {
          quote: 'Our yoga classes used to have 30% no-show rates. Now with automated reminders and a smart waitlist that fills cancelled spots, every class runs at capacity. Revenue per class is up 45%.',
          name: 'Lindsay Fowler',
          role: 'Owner, ZenFlow Wellness Center',
          photo: '/review-wellness-1.png',
          stars: 5,
        },
        {
          quote: 'Managing 8 different practitioners with varying schedules was overwhelming. MassaPro handles all the scheduling complexity — clients book the right therapist at the right time, every time.',
          name: 'Ryan Cooper',
          role: 'Director, Harmony Wellness Hub',
          photo: '/review-wellness-2.png',
          stars: 5,
        },
        {
          quote: 'The personalized wellness tips between visits keep our clients engaged and coming back. It feels like we have a dedicated community manager working around the clock.',
          name: 'Maya Thompson',
          role: 'Founder, Bloom Holistic Center',
          photo: '/review-wellness-3.png',
          stars: 5,
        },
      ],
    },
    {
      name: 'Med Spas',
      image: '/industry-med-spa-v2.png',
      description:
        'The US Med Spa market is projected to reach $26.2 billion in 2026, yet clinics are hemorrhaging revenue through missed calls, slow lead response, and weekend gaps. Up to 39% of Med Spa calls go unanswered, and 85% of those callers will never call back. MassaPro plugs these "silent revenue leaks" by deploying a sales-oriented AI secretary that captures every lead in under 10 seconds, books high-value treatments 24/7, and converts weekend traffic that your competitors lose to voicemail.',
      advantages: [
        'Recover $30,000+/month in missed call revenue — 85% of unanswered callers never return',
        'Engage leads within 10 seconds — conversion drops 80% after 5 minutes of silence',
        'Capture 68% weekend conversion rates while your staff is off — your competitors go to voicemail',
        'Reduce no-shows from 20% to under 5% with deposit handling and intelligent re-scheduling',
      ],
      services: ['Instant Lead Qualification & Booking', 'Deposit & Payment Handling', 'No-Show Recovery & Slot Refilling', 'Weekend & After-Hours Call Capture', 'CRM Sync (Zenoti, Pabau, and more)', 'Upsell Add-On Treatments Automatically'],
      reviews: [
        {
          quote: 'We were missing 8–10 calls a day during peak hours. At an average booking value of $350, that was over $30,000 a month in lost revenue. MassaPro now answers every single call and books them on the spot — our revenue jumped 32% in the first month.',
          name: 'Dr. Vanessa Carter',
          role: 'Founder, Radiance Med Spa',
          photo: '/review-medspa-1.png',
          stars: 5,
        },
        {
          quote: 'Our weekend callers were going straight to voicemail while our competitors\' phones were silent too. Now MassaPro captures that 68% weekend conversion rate, and we\'re booking 40+ extra appointments every weekend without a single staff member on the clock.',
          name: 'Tanya Brooks',
          role: 'Operations Director, Glow Aesthetics Clinic',
          photo: '/review-medspa-2.png',
          stars: 5,
        },
        {
          quote: 'The no-show problem was killing us — 18% of slots wasted every week. MassaPro\'s deposit handling and smart re-scheduling cut that to under 4%. It doesn\'t just answer the phone; it sells. It upsells filler add-ons and secures deposits like a trained closer.',
          name: 'Dr. Markus Lindgren',
          role: 'Medical Director, Revive Wellness & Aesthetics',
          photo: '/review-medspa-3.png',
          stars: 5,
        },
      ],
    },
  ]

  return (
    <section id="industries" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Industries</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Built for <span className="purple-gradient-text">Your Industry</span>
            </h2>
            <p className="text-lg text-gray-500">
              MassaPro is tailored to the unique needs of each industry. Discover how our AI receptionist, secretary, and concierge transform businesses like yours.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-28">
          {industries.map((industry, idx) => (
            <FadeIn key={industry.name} delay={0.1}>
              <div>
                {/* Industry Header with Image */}
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? '' : ''}`}>
                  <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4">{industry.name}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">{industry.description}</p>

                    {/* Advantages */}
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">Key Advantages</h4>
                      <ul className="space-y-3">
                        {industry.advantages.map((adv) => (
                          <li key={adv} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="text-gray-700">{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Services */}
                    <div>
                      <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">AI Services Included</h4>
                      <div className="flex flex-wrap gap-2">
                        {industry.services.map((svc) => (
                          <Badge key={svc} variant="outline" className="border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100">
                            {svc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-purple-100/50 border border-purple-50">
                      <Image
                        src={industry.image}
                        alt={industry.name}
                        width={1344}
                        height={768}
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="mt-12">
                  <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-6 text-center">
                    What {industry.name} Owners Say
                  </h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    {industry.reviews.map((review) => (
                      <Card key={review.name} className="border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3 mb-2">
                            <Image
                              src={review.photo}
                              alt={review.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                            />
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{review.name}</p>
                              <p className="text-xs text-gray-500">{review.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: review.stars }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-purple-500 text-purple-500" />
                            ))}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm leading-relaxed italic">&ldquo;{review.quote}&rdquo;</p>
                        </CardContent>
                      </Card>
                    ))}
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

/* ──────────────────── CTA Section ──────────────────── */
function CTASection({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section id="contact" className="py-20 lg:py-28 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative rounded-3xl purple-gradient overflow-hidden shadow-2xl shadow-purple-300/30">
            <div className="absolute inset-0 bg-[url('/salon-interior-v2.png')] bg-cover bg-center opacity-10" />
            <div className="relative px-8 py-16 lg:px-16 lg:py-20 text-center">
              <FadeIn>
                <Badge className="bg-white/20 text-white hover:bg-white/20 mb-4 border-0">Get Started Today</Badge>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to Transform
                  <br />
                  Your Business?
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-8">
                  Start with a free consultation. No setup fee, no hidden costs. Just intelligent AI that works
                  around the clock so you can focus on what matters most — your customers.
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
                      Contact Us
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

/* ──────────────────── Key Terms Banner ──────────────────── */
function KeyTermsBanner() {
  const terms = [
    { icon: Check, text: 'No setup fee' },
    { icon: Calendar, text: '3-month minimum' },
    { icon: MessageSquare, text: '1,000 interactions included' },
    { icon: Phone, text: 'Inbound included' },
    { icon: CreditCard, text: 'Monthly billing' },
  ]

  return (
    <section className="py-8 bg-purple-50 border-y border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
          {terms.map((term) => (
            <div key={term.text} className="flex items-center gap-2 text-purple-700">
              <term.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{term.text}</span>
            </div>
          ))}
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
      question: 'Will callers notice they are speaking with an AI?',
      answer:
        'Not at all. MassaPro leverages cutting-edge voice synthesis and conversational intelligence so every interaction feels warm, fluid, and genuinely human. Your clients experience a seamless, helpful dialogue — the kind they would expect from your best team member. Natural pauses, empathetic tone, and contextual awareness make the conversation indistinguishable from a real person on the other end of the line.',
    },
    {
      question: 'Can the system manage intricate bookings and unusual requirements?',
      answer:
        'Definitely. MassaPro is purpose-built to navigate complicated reservations, last-minute modifications, bespoke service requests, and anything outside the ordinary. When a situation calls for extra clarity, the AI proactively asks follow-up questions to get every detail right. And for those truly edge-case scenarios, it smoothly hands the conversation over to a member of your staff so nothing ever slips through the cracks.',
    },
    {
      question: 'How fast can my business be up and running?',
      answer:
        'You can go live in as little as five to ten minutes. The process is straightforward: link your existing phone number (or grab a new one), tailor MassaPro\'s responses to match your brand voice and services, and you\'re all set. If you ever need a helping hand, our support team is just a click away inside the "Help" tab of your CRM dashboard, ready to walk you through anything in real time.',
    },
    {
      question: 'What happens when a conversation requires a human touch?',
      answer:
        'MassaPro is intelligent enough to sense when a caller\'s needs go beyond what automated assistance can provide. In those moments, it instantly and gracefully transfers the call to the right person on your team — no awkward pauses, no dropped connections. You stay in full control of the escalation rules, deciding exactly which situations get routed where, so your customers always feel taken care of.',
    },
    {
      question: 'How do I connect MassaPro to my current business phone line?',
      answer:
        'You have two simple options. The easiest is call forwarding: just redirect your existing business number to MassaPro, and every incoming call is answered by your AI. Alternatively, you can pick a brand-new number through MassaPro and start fresh. Either way, the setup takes only a few minutes, and we walk you through every step inside the "Call Forwarding" tab of the CRM — no technical expertise required.',
    },
  ]

  return (
    <section id="faq" className="py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-800 mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Frequently Asked <span className="purple-gradient-text">Questions</span>
            </h2>
            <p className="text-lg text-gray-500">
              Everything you need to know about MassaPro. Can&apos;t find the answer you&apos;re looking for? Reach out to our team.
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
              Intelligent AI receptionists and secretaries for businesses that never want to miss a customer again.
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
              <li>Hair Salons</li>
              <li>Nail Studios</li>
              <li>Beauty Shops</li>
              <li>Veterinary Clinics</li>
              <li>Wellness Centers</li>
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
export default function Home() {
  const [formOpen, setFormOpen] = useState(false)

  const openForm = useCallback(() => setFormOpen(true), [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenForm={openForm} />
      <main className="flex-grow">
        <HeroSection onOpenForm={openForm} />
        <ChannelBar />
        <IntegrationsSection />
        <KeyTermsBanner />
        <PositionsSection onOpenForm={openForm} />
        <HowItWorks />
        <StatsSection />
        <SkillsSection />
        <FlowsSection />
        <IndustriesSection />
        <PricingSection onOpenForm={openForm} />
        <TestimonialsSection />
        <CTASection onOpenForm={openForm} />
        <FAQSection />
      </main>
      <Footer />
      <LeadForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
