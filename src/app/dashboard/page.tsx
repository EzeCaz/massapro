'use client'

import { useState, useEffect, useCallback } from 'react'
import { BackupTracker } from '@/lib/backup-tracker'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Eye, MousePointerClick, ScrollText, Users, ShoppingCart, DollarSign, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ───

interface DashboardData {
  period: { days: number; from: string; to: string }
  affid: string
  summary: {
    pageViews: number
    clicks: number
    scrollEvents: number
    leads: number
    carts: number
    purchases: number
    cartRevenueDollars: string
    purchaseRevenueDollars: string
  }
  pageViewsByPage: { page: string; _count: number }[]
  clicksByType: { eventType: string; _count: number }[]
  clicksById: { eventId: string; _count: number }[]
  leadsByAffid: { affid: string; _count: number }[]
}

interface PageViewStats {
  total: number
  byPage: { page: string; _count: number }[]
  byAffid: { affid: string; _count: number }[]
}

interface ClickStats {
  total: number
  byEventType: { eventType: string; _count: number }[]
  byEventId: { eventId: string; _count: number }[]
  byAffid: { affid: string; _count: number }[]
}

interface ScrollStats {
  totalSessions: number
  avgScroll: number
  buckets: Record<string, number>
  byPage: Record<string, { sessions: number; avgScroll: number }>
}

interface LeadStats {
  total: number
  byAffid: { affid: string; _count: number }[]
  byPlanType: { planType: string; _count: number }[]
  recent: any[]
}

interface CartStats {
  total: number
  byPlanType: { planType: string; _count: number; _sum: { cartValue: number | null } }[]
  totalRevenueDollars: string
}

interface PurchaseStats {
  total: number
  byPlanType: { planType: string; _count: number; _sum: { revenue: number | null } }[]
  totalRevenueDollars: string
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6', '#22c55e', '#eab308', '#f97316']

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/hair-salon': 'Hair Salon',
  '/med-spa': 'Med Spa',
  '/nail-studio': 'Nail Studio',
  '/beauty-shop': 'Beauty Shop',
  '/vet-clinic': 'Vet Clinic',
  '/all': 'Pricing (All)',
  '/all-TY': 'Thank You',
  '/hair-salon-TY': 'Hair Salon TY',
}

const EVENT_LABELS: Record<string, string> = {
  'btn_buy_basic': 'Buy Basic ($500)',
  'btn_buy_professional': 'Buy Professional ($1,200)',
  'btn_buy_enterprise': 'Buy Enterprise ($2,000)',
  'btn_book_demo': 'Book a Demo',
  'btn_get_now': 'Get Now',
  'btn_purchase_complete': 'Purchase Complete',
}

function pageLabel(page: string): string {
  return PAGE_LABELS[page] || page
}

function eventLabel(eventId: string): string {
  return EVENT_LABELS[eventId] || eventId
}

// ─── Dashboard Page ───

export default function DashboardPage() {
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [pageViews, setPageViews] = useState<PageViewStats | null>(null)
  const [clicks, setClicks] = useState<ClickStats | null>(null)
  const [scrolls, setScrolls] = useState<ScrollStats | null>(null)
  const [leads, setLeads] = useState<LeadStats | null>(null)
  const [carts, setCarts] = useState<CartStats | null>(null)
  const [purchases, setPurchases] = useState<PurchaseStats | null>(null)

  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.allSettled([
        fetch(`/api/track/dashboard?days=${days}`).then(r => r.ok ? r.json() : { summary: {}, pageViewsByPage: [], clicksByType: [], clicksById: [], leadsByAffid: [] }),
        fetch(`/api/track/pageview?days=${days}`).then(r => r.ok ? r.json() : { total: 0, byPage: [], byAffid: [] }),
        fetch(`/api/track/click?days=${days}`).then(r => r.ok ? r.json() : { total: 0, byEventType: [], byEventId: [], byAffid: [] }),
        fetch(`/api/track/scroll?days=${days}`).then(r => r.ok ? r.json() : { totalSessions: 0, avgScroll: 0, buckets: {}, byPage: {} }),
        fetch(`/api/track/lead?days=${days}`).then(r => r.ok ? r.json() : { total: 0, byAffid: [], byPlanType: [], recent: [] }),
        fetch(`/api/track/cart?days=${days}`).then(r => r.ok ? r.json() : { total: 0, byPlanType: [], totalRevenueDollars: '0.00' }),
        fetch(`/api/track/purchase?days=${days}`).then(r => r.ok ? r.json() : { total: 0, byPlanType: [], totalRevenueDollars: '0.00' }),
      ])
      const [dash, pv, click, scroll, lead, cart, purch] = results.map(r =>
        r.status === 'fulfilled' ? r.value : null
      )
      setDashboard(dash as DashboardData | null)
      setPageViews(pv as PageViewStats | null)
      setClicks(click as ClickStats | null)
      setScrolls(scroll as ScrollStats | null)
      setLeads(lead as LeadStats | null)
      setCarts(cart as CartStats | null)
      setPurchases(purch as PurchaseStats | null)

      const failedCount = results.filter(r => r.status === 'rejected').length
      if (failedCount > 0) {
        setError(`${failedCount} API request(s) failed. Database may not be initialized on this deployment.`)
      }
    } catch (e: any) {
      console.error('Dashboard fetch error:', e)
      setError(`Failed to load dashboard data: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Pageview + scroll backup tracking for the dashboard page itself
  useEffect(() => {
    BackupTracker.trackPageView()
  }, [])

  const summary = dashboard?.summary

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" />
                <Image
                  src="/massapro-logo-v2.png"
                  alt="MassaPro"
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
              <span className="text-gray-300 mx-2">|</span>
              <h1 className="text-lg font-semibold text-gray-900">Tracking Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      days === d ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm font-medium">⚠️ {error}</p>
            <p className="text-amber-600 text-xs mt-1">The local backup database may need to be initialized. Data will appear once the database is set up.</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <SummaryCard
            title="Page Views"
            value={summary?.pageViews ?? 0}
            icon={<Eye className="w-5 h-5" />}
            color="purple"
          />
          <SummaryCard
            title="Clicks"
            value={summary?.clicks ?? 0}
            icon={<MousePointerClick className="w-5 h-5" />}
            color="blue"
          />
          <SummaryCard
            title="Scroll Events"
            value={summary?.scrollEvents ?? 0}
            icon={<ScrollText className="w-5 h-5" />}
            color="cyan"
          />
          <SummaryCard
            title="Leads"
            value={summary?.leads ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="green"
          />
          <SummaryCard
            title="Add to Cart"
            value={summary?.carts ?? 0}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="yellow"
          />
          <SummaryCard
            title="Revenue"
            value={`$${summary?.purchaseRevenueDollars ?? '0.00'}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="pageviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pageviews">Page Views</TabsTrigger>
            <TabsTrigger value="clicks">Clicks</TabsTrigger>
            <TabsTrigger value="scrolls">Scroll Depth</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Page Views Tab */}
          <TabsContent value="pageviews">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Views by Page</CardTitle>
                  <CardDescription>Which pages get the most traffic</CardDescription>
                </CardHeader>
                <CardContent>
                  {pageViews && pageViews.byPage.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={pageViews.byPage.map((p: any) => ({ name: pageLabel(p.page), views: p._count }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Views by Affiliate</CardTitle>
                  <CardDescription>Traffic breakdown by affiliate source</CardDescription>
                </CardHeader>
                <CardContent>
                  {pageViews && pageViews.byAffid.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pageViews.byAffid.map((a: any) => ({ name: a.affid === 'no_affiliate' ? 'Direct/Organic' : a.affid, value: a._count }))}
                          cx="50%" cy="50%" outerRadius={100}
                          label={(entry: any) => `${entry.name} (${(entry.percent * 100).toFixed(0)}%)`}
                        >
                          {pageViews.byAffid.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clicks Tab */}
          <TabsContent value="clicks">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Button Clicks</CardTitle>
                  <CardDescription>Which CTAs are getting clicked</CardDescription>
                </CardHeader>
                <CardContent>
                  {clicks && clicks.byEventId.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={clicks.byEventId.map((e: any) => ({ name: eventLabel(e.eventId), clicks: e._count }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="clicks" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Clicks by Affiliate</CardTitle>
                  <CardDescription>Which affiliates drive the most engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  {clicks && clicks.byAffid.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={clicks.byAffid.map((a: any) => ({ name: a.affid === 'no_affiliate' ? 'Direct/Organic' : a.affid, value: a._count }))}
                          cx="50%" cy="50%" outerRadius={100}
                          label={(entry: any) => `${entry.name} (${(entry.percent * 100).toFixed(0)}%)`}
                        >                          {clicks.byAffid.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scroll Depth Tab */}
          <TabsContent value="scrolls">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scroll Depth Distribution</CardTitle>
                  <CardDescription>How far users scroll down the page</CardDescription>
                </CardHeader>
                <CardContent>
                  {scrolls && scrolls.totalSessions > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(scrolls.buckets).map(([range, count]) => ({ name: range, sessions: count }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sessions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Scroll Depth by Page</CardTitle>
                  <CardDescription>Average scroll depth per page</CardDescription>
                </CardHeader>
                <CardContent>
                  {scrolls && Object.keys(scrolls.byPage).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(scrolls.byPage)
                        .sort(([, a], [, b]) => b.avgScroll - a.avgScroll)
                        .map(([page, data]: [string, any]) => (
                          <div key={page} className="flex items-center gap-3">
                            <span className="w-32 text-sm font-medium text-gray-700 truncate">{pageLabel(page)}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                              <div
                                className="bg-cyan-500 h-4 rounded-full transition-all"
                                style={{ width: `${data.avgScroll}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-16 text-right">{data.avgScroll}%</span>
                            <span className="text-xs text-gray-400">({data.sessions} sessions)</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{leads?.total ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">By Plan Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {leads && leads.byPlanType.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {leads.byPlanType.map((p: any) => (
                        <Badge key={p.planType} variant="secondary">{p.planType || 'N/A'}: {p._count}</Badge>
                      ))}
                    </div>
                  ) : <span className="text-gray-400 text-sm">No leads yet</span>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">By Affiliate</CardTitle>
                </CardHeader>
                <CardContent>
                  {leads && leads.byAffid.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {leads.byAffid.map((a: any) => (
                        <Badge key={a.affid} variant="secondary">{a.affid === 'no_affiliate' ? 'Direct' : a.affid}: {a._count}</Badge>
                      ))}
                    </div>
                  ) : <span className="text-gray-400 text-sm">No leads yet</span>}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Most recent lead submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {leads && leads.recent.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Affiliate</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.recent.map((lead: any) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{lead.company || '—'}</TableCell>
                          <TableCell><Badge variant="outline">{lead.planType || 'N/A'}</Badge></TableCell>
                          <TableCell><Badge variant={lead.affid === 'no_affiliate' ? 'secondary' : 'default'}>{lead.affid}</Badge></TableCell>
                          <TableCell className="text-gray-500 text-sm">{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Events</CardTitle>
                  <CardDescription>AddToCart clicks and potential revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {carts && carts.byPlanType.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-2xl font-bold">${carts.totalRevenueDollars} potential</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={carts.byPlanType.map((p: any) => ({
                          name: p.planType,
                          count: p._count,
                          value: ((p._sum.cartValue || 0) / 100).toFixed(0),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Purchases</CardTitle>
                  <CardDescription>Confirmed purchase revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {purchases && purchases.byPlanType.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-2xl font-bold text-green-600">${purchases.totalRevenueDollars} confirmed</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={purchases.byPlanType.map((p: any) => ({
                          name: p.planType,
                          count: p._count,
                          value: ((p._sum.revenue || 0) / 100).toFixed(0),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Backup Tracking Database &middot; Last {days} days &middot; Data stored locally in SQLite</p>
        </div>
      </main>
    </div>
  )
}

// ─── Sub-components ───

function SummaryCard({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{title}</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.purple}`}>
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <Eye className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-sm">No data yet</p>
      <p className="text-xs mt-1">Data will appear as visitors interact with the site</p>
    </div>
  )
}
