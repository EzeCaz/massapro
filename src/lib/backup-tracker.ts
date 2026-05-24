/**
 * MassaPro Backup Tracker
 * Sends all tracking events to the local backup database (SQLite via Prisma)
 * alongside the MassaPro Affiliate Tracker that sends to aff.massapro.com
 */

const LOCAL_API_BASE = '/api/track'

// Generate or retrieve a persistent session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  const key = 'massapro_session_id'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
    sessionStorage.setItem(key, sid)
  }
  return sid
}

// Get current UTM params from URL
function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmContent: params.get('utm_content') || '',
    utmTerm: params.get('utm_term') || '',
  }
}

// Get affid from URL or from MassaProAffiliate attribution
function getAffid(): string {
  if (typeof window === 'undefined') return 'no_affiliate'
  // First check URL param
  const params = new URLSearchParams(window.location.search)
  const urlAffid = params.get('affid')
  if (urlAffid) return urlAffid
  // Then try MassaProAffiliate attribution
  try {
    if (typeof MassaProAffiliate !== 'undefined') {
      const attr = MassaProAffiliate.getAttribution()
      if (attr?.affid) return attr.affid
    }
  } catch {}
  return 'no_affiliate'
}

// Get current page path
function getPage(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

// Send data to local backup API (fire-and-forget)
async function sendLocal(endpoint: string, data: Record<string, any>) {
  try {
    await fetch(`${LOCAL_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    })
  } catch (e) {
    // Silent fail — backup tracker should never break the site
    console.debug('[BackupTracker] Failed:', endpoint, e)
  }
}

// ─── Public API ───

export const BackupTracker = {
  /** Track a page view */
  trackPageView() {
    const utm = getUtmParams()
    sendLocal('/pageview', {
      sessionId: getSessionId(),
      affid: getAffid(),
      page: getPage(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ip: 'auto',
      ...utm,
    })
  },

  /** Track a click/button event */
  trackClick(eventType: string, eventId: string, metadata?: Record<string, any>) {
    sendLocal('/click', {
      sessionId: getSessionId(),
      affid: getAffid(),
      eventType,
      eventId,
      page: getPage(),
      metadata,
    })
  },

  /** Track scroll depth */
  trackScroll(scrollPct: number, section?: string) {
    sendLocal('/scroll', {
      sessionId: getSessionId(),
      affid: getAffid(),
      page: getPage(),
      scrollPct,
      section,
    })
  },

  /** Track a lead form submission */
  trackLead(data: {
    name: string
    email: string
    phone?: string
    company?: string
    companyUrl?: string
    planType?: string
    message?: string
  }) {
    const utm = getUtmParams()
    sendLocal('/lead', {
      sessionId: getSessionId(),
      affid: getAffid(),
      ...data,
      ...utm,
    })
  },

  /** Track add to cart */
  trackCart(planType: string, cartValue: number) {
    sendLocal('/cart', {
      sessionId: getSessionId(),
      affid: getAffid(),
      planType,
      cartValue,
      page: getPage(),
    })
  },

  /** Track a purchase */
  trackPurchase(planType: string, revenue: number, source?: string) {
    sendLocal('/purchase', {
      sessionId: getSessionId(),
      affid: getAffid(),
      planType,
      revenue,
      source,
    })
  },
}
