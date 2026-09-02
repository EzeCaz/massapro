# MassaPro UTM & Tracking Implementation — Full Specification

**Audience**: Other AI agents working on the MassaPro codebase
**Scope**: `/expert` page (`src/app/expert/page.tsx`), shared with homepage LeadForm (`src/components/LeadForm.tsx`), layout (`src/app/layout.tsx`), API (`src/app/api/submit-lead/route.ts`), Google Apps Script (`download/Massapro_GoogleSheet_Script.js`), and Backup Tracker (`src/lib/backup-tracker.ts`)
**Last updated**: 2026-06-27

---

## 1. Overview — Where Data Flows

The `/expert` page (and homepage) uses **5 parallel tracking channels** that all fire on the same user actions. Every channel is fire-and-forget — failures in one channel never block another.

```
User clicks CTA / submits form
        │
        ├─→ (1) Meta Pixel (Facebook)            → Facebook Ads Manager
        ├─→ (2) Google Analytics 4 (gtag)        → GA4 Property G-Z2TP8Y923Q
        ├─→ (3) MassaPro Affiliate Tracker       → aff.massapro.com dashboard
        ├─→ (4) Backup Tracker (local SQLite)    → /api/track/* → Prisma DB
        └─→ (5) Lead Submission API              → Google Calendar + Gmail + Google Sheet
```

All 5 channels are loaded globally in `src/app/layout.tsx` via Next.js `<Script>` tags. Page components just call `fbq()`, `gtag()`, `MassaProAffiliate.*`, and `BackupTracker.*` — these globals are guaranteed to exist (or be safely skipped if blocked).

---

## 2. UTM Parameter Capture (Frontend)

### 2.1 Standard UTM Parameters (5)

Captured from URL query string on page mount, stored in React state, sent with every lead submission.

| URL Param       | State Key        | Sent As (API)   | Sheet Column |
|-----------------|------------------|------------------|--------------|
| `?utm_source=`  | `utmParams.utm_source`  | `utm_source`  | Q |
| `?utm_medium=`  | `utmParams.utm_medium`  | `utm_medium`  | R |
| `?utm_campaign=`| `utmParams.utm_campaign`| `utm_campaign`| S |
| `?utm_content=` | `utmParams.utm_content` | `utm_content` | T |
| `?utm_term=`    | `utmParams.utm_term`    | `utm_term`    | U |

### 2.2 Affiliate ID — 3 URL Formats (Priority Order)

The Affiliate ID is **not** a standard UTM param — MassaPro uses 3 custom URL formats. The frontend resolves them in this priority order:

| Priority | URL Format               | Code Lookup                          | Example                          |
|----------|--------------------------|--------------------------------------|----------------------------------|
| 1 (highest) | `?Aff-Id=MP-XXX-001`  | `searchParams.get('Aff-Id')`         | `https://site.com/expert?Aff-Id=MP-ROBERTO-001` |
| 2 (medium)  | `?Aff+Id=MP-XXX-001`  | `searchParams.get('Aff Id')`         | `https://site.com/expert?Aff+Id=MP-ROBERTO-001` (space encoded as `+`) |
| 3 (lowest)  | `?utm=MP-XXX-001`     | `searchParams.get('utm')`            | `https://site.com/expert?utm=MP-ROBERTO-001` |

**Sent As (API)**: `affId`
**Sheet Column**: V (Affiliate ID)

### 2.3 Frontend Implementation Pattern (Expert Page)

```tsx
// src/app/expert/page.tsx — HeroSection() component
const searchParams = useSearchParams()

// Capture UTM params once on mount (useState with initializer — never re-reads URL)
const [utmParams] = useState(() => ({
  utm_source: searchParams.get('utm_source') || '',
  utm_medium: searchParams.get('utm_medium') || '',
  utm_campaign: searchParams.get('utm_campaign') || '',
  utm_content: searchParams.get('utm_content') || '',
  utm_term: searchParams.get('utm_term') || '',
}))

// Resolve Affiliate ID with priority: Aff-Id > Aff Id > utm
const [affId] = useState<string>(() => {
  const affIdHyphen = searchParams.get('Aff-Id')
  if (affIdHyphen) return affIdHyphen
  const affIdSpace = searchParams.get('Aff Id')
  if (affIdSpace) return affIdSpace
  const utmGeneric = searchParams.get('utm')
  if (utmGeneric) return utmGeneric
  return ''
})
```

**Why `useState(() => ...)`**: This initializer runs once on mount and caches the value. If the user navigates with different UTMs (client-side navigation), the original UTMs are preserved — this is intentional, so we always attribute to the **first** landing URL.

---

## 3. Event Flow — 4 Phases (Chronological Order)

### Phase 1: CTA Click (`handleGetNowClick()`)

Triggered when user clicks any "Get Started" / "Get Now" button. Scrolls to the form AND fires 3 tracking events.

| Channel | Code | Event Name | Parameters |
|---------|------|------------|------------|
| Meta Pixel | `fbq('trackCustom', 'FreeConsultClick', {...})` | `FreeConsultClick` (custom) | `button_location`, `page_name: 'Expert'`, `cta: 'consultation'` |
| MassaPro Affiliate | `MassaProAffiliate.trackEvent('btn_get_now')` | `btn_get_now` | (none) |
| GA4 | `gtag('event', 'get_now', {...})` | `get_now` | `button_location`, `page_name: 'Expert'` |

```tsx
function handleGetNowClick(location: string) {
  // Meta Pixel
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    ;(window as any).fbq('trackCustom', 'FreeConsultClick', {
      button_location: location,
      page_name: 'Expert',
      cta: 'consultation'
    })
  }
  // MassaPro Affiliate Tracker
  safeMassaProCall(() => {
    if (typeof (window as any).MassaProAffiliate?.trackEvent === 'function') {
      ;(window as any).MassaProAffiliate.trackEvent('btn_get_now')
    }
  })
  // GA4
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('event', 'get_now', {
      button_location: location,
      page_name: 'Expert'
    })
  }
  // Scroll to form
  document.getElementById('expert-lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
```

### Phase 2: Form Open (on mount)

Fires once when the HeroSection mounts (form is always visible on `/expert`, unlike homepage where form is in a dialog).

| Channel | Code | Event Name | Parameters |
|---------|------|------------|------------|
| MassaPro Affiliate | `MassaProAffiliate.trackLeadFormOpen()` | `lead_form_open` | (none) |
| Meta Pixel | `fbq('trackCustom', 'LeadFormOpen')` | `LeadFormOpen` (custom) | (none) |
| GA4 | `gtag('event', 'lead_form_open', {...})` | `lead_form_open` | `event_category: 'engagement'`, `event_label: 'Lead Form Opened'`, `page_name: 'Expert'` |

```tsx
const [formOpenTracked, setFormOpenTracked] = useState(false)

useEffect(() => {
  if (!formOpenTracked) {
    setFormOpenTracked(true)
    safeMassaProCall(() => MassaProAffiliate.trackLeadFormOpen())
    fbq('trackCustom', 'LeadFormOpen')
    gtag('event', 'lead_form_open', {
      event_category: 'engagement',
      event_label: 'Lead Form Opened',
      page_name: 'Expert',
    })
  }
}, [formOpenTracked])
```

### Phase 3: Form Submit (Step 1 → Step 2 → API)

The expert form is a **2-step wizard**:
- **Step 1**: Personal info (firstName, lastName, email, mobile, companyUrl) — client-side validation only, no API call, no tracking
- **Step 2**: Calendar slot + notes — calls `/api/submit-lead` on submit

#### Request Body Sent to `/api/submit-lead`:

```typescript
{
  // Personal info
  firstName, lastName, email, mobile, companyUrl,
  // Hardcoded defaults (expert page doesn't collect these)
  industry: 'Other',
  country: 'United States',
  // Appointment
  appointmentDate, appointmentTime, appointmentSlotId, timezone,
  serviceType: 'AI Secretary / Virtual Assistant',
  planType: 'Not Sure Yet',
  notes: notes || 'Lead from /expert page',
  // UTM + Affiliate (critical — spread last so they're always included)
  ...utmParams,   // utm_source, utm_medium, utm_campaign, utm_content, utm_term
  affId,          // resolved Affiliate ID
}
```

### Phase 4: Post-Submit Tracking (after successful API response)

Fires **only if** the API returns `res.ok`. This is the conversion event — the user has successfully booked.

| Channel | Code | Event Name | Parameters |
|---------|------|------------|------------|
| Meta Pixel | `fbq('track', 'Schedule')` | `Schedule` (STANDARD event) | (none) |
| GA4 | `gtag('event', 'schedule', {...})` | `schedule` | `event_category: 'conversion'`, `event_label: 'Consultation Scheduled'`, `page_name: 'Expert'` |
| MassaPro Affiliate | `MassaProAffiliate.trackLead({...})` | `trackLead` | `lead_name`, `lead_email`, `lead_phone`, `lead_company`, `plan_type: 'Not Sure Yet'`, `initial_status: 'Booked Call'` |
| Backup Tracker | `BackupTracker.trackLead({...})` | `trackLead` | `name`, `email`, `phone`, `company`, `planType` |

```tsx
// After setSubmitted(true):
fbq('track', 'Schedule')  // STANDARD Meta event (not trackCustom)
gtag('event', 'schedule', {
  event_category: 'conversion',
  event_label: 'Consultation Scheduled',
  page_name: 'Expert',
})
safeMassaProCall(() => {
  MassaProAffiliate.trackLead({
    lead_name: `${firstName} ${effectiveLastName}`,
    lead_email: email,
    lead_phone: mobile,
    lead_company: companyUrl || '',
    plan_type: 'Not Sure Yet',
    initial_status: 'Booked Call',
  })
})
try {
  BackupTracker.trackLead({
    name: `${firstName} ${effectiveLastName}`,
    email,
    phone: mobile,
    company: companyUrl,
    planType: 'Not Sure Yet',
  })
} catch {}
```

**Note**: `BackupTracker.trackLead()` internally reads UTMs from the URL again (via `getUtmParams()`) and the affid via `getAffid()`, so UTM data is double-captured for the local DB.

---

## 4. Server-Side Flow — `/api/submit-lead` (5 Steps)

After the frontend POSTs to `/api/submit-lead`, the server runs **5 sequential steps**. Each step is independently try/caught — failures don't block later steps (except Step 1 validation and Step 2 slot conflict).

### Step 1: Validate Required Fields
```typescript
const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'country',
                         'appointmentSlotId', 'appointmentDate', 'appointmentTime']
```
Returns `400` if any missing.

### Step 2: Check Slot Availability (Google Calendar)
Calls `isSlotAvailable()` from `src/lib/google-calendar.ts`. Returns `409` if slot is already booked.

### Step 3: Create Google Calendar Event (with Google Meet link)
Calls `createCalendarEvent()` — creates a 30-min event, adds attendee, generates Meet link. The calendar event description includes the Affiliate ID:
```
Consultation with John Smith
Industry: Other
Service: AI Secretary / Virtual Assistant
Plan: Not Sure Yet
Notes: Lead from /expert page
Company: www.example.com
Phone: 15551234567
Country: United States
Affiliate: MP-ROBERTO-001
```

### Step 4: Send Confirmation Email (Gmail SMTP)
Always attempts to send, even if Step 3 failed. Email includes the Meet link, date, and time (Israel time).

### Step 5: Submit to Google Sheet (Google Apps Script Web App)
POSTs the full lead data (including all 5 UTM params + affId) to `GOOGLE_SCRIPT_URL` (env var).

```typescript
await fetch(GOOGLE_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // ... all form fields ...
    utm_source: body.utm_source || '',
    utm_medium: body.utm_medium || '',
    utm_campaign: body.utm_campaign || '',
    utm_content: body.utm_content || '',
    utm_term: body.utm_term || '',
    affId: body.affId || '',
  }),
})
```

**Mobile Sanitization**: Before sending to the Sheet, the server strips `+`, `-`, spaces, parentheses, and leading `00` from the mobile number. Example: `+1 (555) 123-4567` → `15551234567`.

---

## 5. Google Sheet Structure (Columns A–V)

The Google Apps Script (`download/Massapro_GoogleSheet_Script.js`) writes to a sheet tab named **"Site"** (auto-created if missing).

| Col | Header | Source | Example |
|-----|--------|--------|---------|
| A | First Name | form | John |
| B | Last Name | form (or "N/A") | Smith |
| C | Company Name | form (usually empty) | |
| D | Company URL | form | www.example.com |
| E | Industry | hardcoded | Other |
| F | Email | form | john@biz.com |
| G | Mobile | form (sanitized) | 15551234567 |
| H | Country | hardcoded | United States |
| I | State | form (usually empty) | |
| J | Appointment Date | form | 2026-06-28 |
| K | Appointment Time | form | 10:00 |
| L | Timezone | auto-detected | America/New_York |
| M | Service Type | hardcoded | AI Secretary / Virtual Assistant |
| N | Plan Type | hardcoded | Not Sure Yet |
| O | Notes | form | Lead from /expert page |
| P | Submitted At | server timestamp | 2026-06-27T18:03:26.514Z |
| **Q** | **UTM Source** | URL `?utm_source=` | facebook |
| **R** | **UTM Medium** | URL `?utm_medium=` | paid_social |
| **S** | **UTM Campaign** | URL `?utm_campaign=` | spring_sale |
| **T** | **UTM Content** | URL `?utm_content=` | hero_cta |
| **U** | **UTM Term** | URL `?utm_term=` | ai+receptionist |
| **V** | **Affiliate ID** | resolved from URL | MP-ROBERTO-001 |

### Affiliate ID Resolution (Server-Side Fallback)

The Google Apps Script has its own fallback resolver (`resolveAffiliateId()`):
1. **Priority 1**: `data.affId` (already resolved by frontend — preferred)
2. **Priority 2**: `data.utm_source` if it matches `/^MP-/i` (legacy fallback)
3. **Priority 3**: empty string

---

## 6. Global Tracking Setup (`src/app/layout.tsx`)

All tracking scripts are loaded **globally** in the root layout, so they're available on every page. Load order matters:

### 6.1 Google Analytics 4 (gtag)
```html
<!-- Loaded twice (duplicate is intentional — both head scripts are identical) -->
<script src="https://www.googletagmanager.com/gtag/js?id=G-Z2TP8Y923Q" strategy="afterInteractive" />
<script id="google-analytics" strategy="afterInteractive">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-Z2TP8Y923Q');
</script>
```
**GA4 Property ID**: `G-Z2TP8Y923Q`

### 6.2 Meta Pixel (Facebook)
```html
<script id="meta-pixel" strategy="afterInteractive">
  !function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '25763011723375825');   // Pixel ID #1
  fbq('track', 'PageView');
  fbq('init', '4314002965514089');    // Pixel ID #2
  fbq('track', 'PageView');
</script>
```
**Two Meta Pixel IDs are initialized** (both fire on every event):
- `25763011723375825`
- `4314002965514089`

### 6.3 MassaPro Affiliate Tracker
```html
<script id="massapro-affiliate-tracker"
  src="https://aff.massapro.com/massapro-affiliate-tracker.js"
  strategy="afterInteractive" />
<script id="massapro-affiliate-config" strategy="afterInteractive">
  (function initAffiliate() {
    if (typeof MassaProAffiliate !== 'undefined') {
      MassaProAffiliate.config({ dashboardUrl: 'https://aff.massapro.com' });
    } else {
      setTimeout(initAffiliate, 100);  // Retry until loaded
    }
  })();
</script>
```

### 6.4 Console Error Suppressor (Permanent)
The tracker script at `aff.massapro.com` calls `console.error('[MassaPro] Lead tracking failed: {}')` asynchronously when its backend is unreachable. This permanent interceptor filters those messages:

```js
// Re-applied every 2s because Next.js dev tools re-wrap console.error
function applyMassaProFilter() {
  // Wraps console.error and console.warn to drop any message containing '[MassaPro]'
}
applyMassaProFilter();
setTimeout(applyMassaProFilter, 0); setTimeout(applyMassaProFilter, 50);
setTimeout(applyMassaProFilter, 200); setTimeout(applyMassaProFilter, 500);
setTimeout(applyMassaProFilter, 1000);
setInterval(applyMassaProFilter, 2000);
```

### 6.5 Global Form Submit Listener (Fallback)
A document-level `submit` listener catches ANY form submission on the site (not just the expert form). It has a `data-massapro-handled` attribute check to avoid double-tracking:

```js
document.addEventListener('submit', function(e) {
  if (formSubmitted) return;
  var form = e.target;
  // SKIP if this form handles its own tracking
  if (form.getAttribute('data-massapro-handled')) return;
  // ... extract email/name/phone/company from form fields ...
  safeTrackLead({...});
}, true);
```

**Both expert page forms have `data-massapro-handled="true"`** to prevent this fallback from double-firing.

---

## 7. Meta Pixel Event Reference

| Event Name | Type | When | Code |
|------------|------|------|------|
| `PageView` | Standard | Auto on page load | `fbq('track', 'PageView')` |
| `FreeConsultClick` | Custom | CTA click | `fbq('trackCustom', 'FreeConsultClick', { button_location, page_name: 'Expert', cta: 'consultation' })` |
| `LeadFormOpen` | Custom | Form mounts | `fbq('trackCustom', 'LeadFormOpen')` |
| `Schedule` | **Standard** | Successful booking | `fbq('track', 'Schedule')` |

**Why `Schedule` is a standard event**: Meta's standard `Schedule` event is used for ad optimization (it counts as a conversion in Ads Manager). The other events are custom and only used for retargeting audiences.

---

## 8. GA4 Event Reference

| Event Name | When | Parameters |
|------------|------|------------|
| `get_now` | CTA click | `button_location`, `page_name: 'Expert'` |
| `lead_form_open` | Form mounts | `event_category: 'engagement'`, `event_label: 'Lead Form Opened'`, `page_name: 'Expert'` |
| `schedule` | Successful booking | `event_category: 'conversion'`, `event_label: 'Consultation Scheduled'`, `page_name: 'Expert'` |

**`page_name: 'Expert'`** is the differentiator — the homepage LeadForm uses `page_name: 'Home'` (or omits it), so you can segment traffic by landing page in GA4.

---

## 9. MassaPro Affiliate Tracker API Reference

Global object: `window.MassaProAffiliate` (loaded from `https://aff.massapro.com/massapro-affiliate-tracker.js`)

| Method | When | Parameters |
|--------|------|------------|
| `config({ dashboardUrl })` | On load | `{ dashboardUrl: 'https://aff.massapro.com' }` |
| `trackEvent(eventId)` | CTA click | `'btn_get_now'` |
| `trackLeadFormOpen()` | Form mounts | (none) |
| `trackLead(data)` | Successful booking | `{ lead_name, lead_email, lead_phone, lead_company, plan_type, initial_status }` |
| `getAttribution()` | Internal | Returns `{ affid }` — used by BackupTracker |

**Safe wrapper** — always wrap calls in `safeMassaProCall()` because the tracker can throw if its backend is down:
```ts
function safeMassaProCall(fn: () => void) {
  if (typeof window === 'undefined') return
  try { fn() } catch {}
}
```

---

## 10. Backup Tracker API Reference (`src/lib/backup-tracker.ts`)

Local SQLite fallback — writes to `/api/track/*` endpoints, which persist to Prisma DB (`prisma/schema.prisma`). Used as a safety net if aff.massapro.com goes down.

| Method | Endpoint | Data |
|--------|----------|------|
| `trackPageView()` | `/api/track/pageview` | sessionId, affid, page, referrer, userAgent, utmSource, utmMedium, utmCampaign, utmContent, utmTerm |
| `trackClick(eventType, eventId, metadata)` | `/api/track/click` | sessionId, affid, eventType, eventId, page, metadata |
| `trackScroll(scrollPct, section)` | `/api/track/scroll` | sessionId, affid, page, scrollPct, section |
| `trackLead(data)` | `/api/track/lead` | sessionId, affid, name, email, phone, company, planType, utm* |
| `trackCart(planType, cartValue)` | `/api/track/cart` | sessionId, affid, planType, cartValue, page |
| `trackPurchase(planType, revenue, source)` | `/api/track/purchase` | sessionId, affid, planType, revenue, source |

**Session ID**: Generated once per browser session, stored in `sessionStorage` as `massapro_session_id`. Format: `sess_<timestamp>_<random>`.

**Affid Resolution (Backup Tracker)**:
1. URL param `?affid=` (lowercase)
2. `MassaProAffiliate.getAttribution().affid`
3. `'no_affiliate'` fallback

---

## 11. Complete UTM Test URLs

Test the full UTM + Affiliate pipeline with these URLs:

```
# Full UTM + Affiliate (Aff-Id format — highest priority)
https://receptionist.massapro.com/expert?utm_source=facebook&utm_medium=paid_social&utm_campaign=spring_launch&utm_content=hero_cta&utm_term=ai+receptionist&Aff-Id=MP-ROBERTO-001

# Affiliate only (Aff+Id format — medium priority)
https://receptionist.massapro.com/expert?Aff+Id=MP-MARIA-002

# Affiliate only (utm format — lowest priority)
https://receptionist.massapro.com/expert?utm=MP-JOHN-003

# UTMs only (no affiliate)
https://receptionist.massapro.com/expert?utm_source=google&utm_medium=cpc&utm_campaign=brand_search

# No params (organic — all fields empty)
https://receptionist.massapro.com/expert
```

**Verification**: After submitting the form, check:
1. **Google Sheet "Site" tab** — columns Q–V should be populated
2. **Google Calendar event description** — should contain `Affiliate: MP-XXX-001`
3. **GA4 Realtime** — should show `schedule` event with `page_name: Expert`
4. **Meta Pixel Helper** (Chrome extension) — should show `Schedule` event
5. **aff.massapro.com dashboard** — should show the new lead attributed to the affiliate

---

## 12. Critical Implementation Notes for Other Agents

### 12.1 Never Remove `data-massapro-handled="true"`
Both expert page forms (`<form>` elements in Step 1 and Step 2) have this attribute. The global form submit listener in `layout.tsx` checks for it to avoid double-tracking. If you create a new form, either:
- Add `data-massapro-handled="true"` and handle tracking yourself, OR
- Don't add it and let the global listener handle tracking (but you lose granular control)

### 12.2 Always Spread `...utmParams` and `affId` LAST in API Body
When adding new fields to the `/api/submit-lead` request, always put `...utmParams` and `affId` at the END of the object literal. This ensures they're never accidentally overwritten by other fields.

### 12.3 Use `safeMassaProCall()` for All Tracker Calls
The external tracker script can throw if:
- Its backend is unreachable
- The script hasn't loaded yet
- The browser blocks third-party scripts

Always wrap calls in the safe wrapper. The console error suppressor handles the async `.catch()` errors from the tracker's internal fetch.

### 12.4 The `lastName` Fallback
The expert page form makes lastName optional (UI-wise), but the API requires it. The frontend uses `effectiveLastName = lastName.trim() || 'N/A'` to satisfy the API validation. Don't remove this without also updating the API's required fields list.

### 12.5 Duplicate GA4 Script in Layout
The GA4 gtag script is loaded **twice** in `layout.tsx` (lines 54-65 and 100-111). This is a known duplicate — both are identical. It doesn't cause double-tracking (gtag deduplicates by measurement ID), but you can remove one if cleaning up.

### 12.6 Mobile Sanitization Happens Twice
The mobile number is sanitized in **two places**:
1. **Server-side** (`/api/submit-lead/route.ts` → `sanitizeMobile()`) before sending to Google Sheet
2. **Server-side** (Google Apps Script → `sanitizeMobile()`) as a final safety net

Don't rely on frontend sanitization — the server always re-sanitizes.

### 12.7 Timezone Auto-Detection
The expert form auto-detects the user's timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` on mount. The slot picker (`WeeklySlotPicker`) uses **Israel time** for display, but the stored timezone is the user's local zone. The confirmation email shows Israel time.

---

## 13. File Reference Map

| File | Role |
|------|------|
| `src/app/layout.tsx` | Global script loading (GA4, Meta Pixel, MassaPro tracker, console suppressor, form listener) |
| `src/app/expert/page.tsx` | `/expert` page — 2-step form, UTM capture, all 4 tracking phases |
| `src/components/LeadForm.tsx` | Homepage lead form — same tracking pattern as expert page (parity) |
| `src/app/api/submit-lead/route.ts` | Server-side: validate → slot check → calendar → email → Google Sheet |
| `src/lib/google-calendar.ts` | Google Calendar API wrapper (`isSlotAvailable`, `createCalendarEvent`) |
| `src/lib/backup-tracker.ts` | Local SQLite backup tracker (fires to `/api/track/*`) |
| `download/Massapro_GoogleSheet_Script.js` | Google Apps Script — writes to "Site" tab, columns A–V |
| `prisma/schema.prisma` | Local DB schema for backup tracking (PageView, ClickEvent, ScrollEvent, Lead, CartEvent, PurchaseEvent) |

---

## 14. Adding a New Tracking Channel

To add a new channel (e.g., TikTok Pixel, LinkedIn Insight Tag):

1. **Load the script globally** in `src/app/layout.tsx` using `<Script strategy="afterInteractive">`
2. **Add tracking calls** in the 4 phases:
   - Phase 1 (CTA click): in `handleGetNowClick()`
   - Phase 2 (Form open): in the `useEffect` that fires `trackLeadFormOpen`
   - Phase 4 (Submit success): after `setSubmitted(true)` in `handleStep2Submit`
3. **Wrap calls in a safe helper** (like `safeMassaProCall`) if the script can throw
4. **Update this document** with the new channel's event names and parameters
5. **Test** with the URLs in section 11

---

**End of spec.** Questions? Check the worklog at `/home/z/my-project/worklog.md` for historical context on why certain decisions were made.
