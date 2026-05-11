'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
function Navbar() {
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
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
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
            <Button className="purple-gradient text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-300/30">
              <a href="#contact" className="flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </a>
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
              <Button className="purple-gradient text-white w-full" asChild>
                <a href="#contact">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ──────────────────── Hero Section ──────────────────── */
function HeroSection() {
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
                  asChild
                >
                  <a href="#pricing">
                    Start Free Consultation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
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

/* ──────────────────── AI Positions Section ──────────────────── */
function PositionsSection() {
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
      image: '/team-secretaries-v2.png',
    },
    {
      title: 'AI Concierge',
      description:
        'Premium full-service AI that goes beyond basic tasks. Your AI Concierge provides personalized customer experiences, proactive outreach, loyalty management, and multi-language support — the ultimate white-glove service for discerning businesses.',
      icon: Star,
      features: ['Multi-language support (5+)', 'Proactive outreach campaigns', 'Personalized customer experiences', 'White-glove VIP service'],
      image: '/ai-assistant-salon-v3.png',
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
                  <Button className="mt-8 purple-gradient text-white hover:opacity-90 shadow-lg shadow-purple-200/30" asChild>
                    <a href="#pricing">
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
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
function PricingSection() {
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
        '1,000 interactions/month',
        'Full platform connectivity',
        'Standard AI voice & text',
        'No setup fee',
      ],
      highlight: false,
      badge: '',
    },
    {
      name: 'Growth',
      price: '$900',
      period: '/month',
      description:
        'Ideal for growing businesses with moderate volume. Great for busier salons or veterinary clinics handling more daily inquiries.',
      features: [
        '2 Skills included',
        'Up to 8 Flows/Tasks',
        '3,000 interactions/month',
        'Priority support',
        'Advanced analytics',
        'Custom AI personality tuning',
      ],
      highlight: true,
      badge: 'Most Popular',
    },
    {
      name: 'Premium',
      price: '$1,500',
      period: '/month',
      description:
        'Designed for medium-sized or multi-location businesses with higher demand. White-glove service with dedicated optimization.',
      features: [
        '3 Skills included',
        'Unlimited Flows/Tasks',
        '8,000 interactions/month',
        'Dedicated AI optimization',
        'Custom integrations',
        'Multi-language (5 languages)',
        'Proactive outreach tools',
        'White-glove service',
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
                    asChild
                  >
                    <a href="#contact">
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
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
      photo: '/testimonial-1-v2.png',
    },
    {
      quote:
        "As a busy veterinary clinic, we needed 24/7 coverage. MassaPro handles emergency triage, appointment scheduling, and follow-ups flawlessly. It's like having three extra staff members.",
      name: 'Dr. James Rodriguez',
      role: 'Director, Paws & Claws Vet',
      photo: '/testimonial-2-v2.png',
    },
    {
      quote:
        'The multi-channel support is incredible. Our clients reach us on WhatsApp, Instagram, phone — and MassaPro handles it all seamlessly. Best investment we made this year.',
      name: 'Lisa Chen',
      role: 'Manager, Glow Beauty Bar',
      photo: '/testimonial-3-v2.png',
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

/* ──────────────────── CTA Section ──────────────────── */
function CTASection() {
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
                  >
                    <a href="mailto:hello@massapro.ai" className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Contact Us
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 text-base px-8 py-6"
                    asChild
                  >
                    <a href="#pricing">
                      View Pricing <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
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
              className="h-10 w-auto brightness-0 invert mb-4"
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
                hello@massapro.ai
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" />
                +1 (800) 555-0199
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
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ChannelBar />
        <KeyTermsBanner />
        <PositionsSection />
        <HowItWorks />
        <StatsSection />
        <SkillsSection />
        <FlowsSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
