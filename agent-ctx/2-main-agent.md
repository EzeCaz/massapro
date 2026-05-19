---
Task ID: 2
Agent: Main Agent
Task: Create /all page with purchase flow, PurchaseForm component, submit-purchase API, and /all-TY thank you page

Work Log:
- Read existing files: page.tsx (home page ~1745 lines), hair-salon-TY/page.tsx, api/submit-lead/route.ts, google-calendar.ts, LeadForm.tsx, package.json
- Created PurchaseForm.tsx component with:
  - Dialog modal similar to LeadForm pattern
  - Product summary section showing plan name and price
  - Form fields: firstName, lastName, email, phone, company, country, cardNumber, cardExpiry, CVV, cardholderName
  - Card number formatting with spaces (XXXX XXXX XXXX XXXX)
  - Expiry formatting (MM/YY)
  - CVV masked as type="password"
  - Security notice with Lock icon near CC fields
  - Analytics: fbq('track', 'AddToCart') + fbq('trackCustom', 'CartClick', {plan_name, price, cta: 'buynow', page_name: 'All'}) on open
  - MassaProAffiliate.trackEvent('btn_cart') on open
  - UTM collection from URL params + affid from cookie/MassaProAffiliate
  - POST to /api/submit-purchase on submit
  - Redirect to /all-TY?plan={name}&price={price} via window.location.href on success
- Created /all page (src/app/all/page.tsx):
  - Copy of home page with purchase flow changes
  - All CTA buttons changed from "Get Started"/"Start Free Consultation" to "Get Now"
  - All CTAs scroll to #pricing instead of opening LeadForm
  - No LeadForm import or formOpen state
  - page_name: 'All' in all analytics events
  - cta: 'getnow' in all fbq trackCustom events
  - Pricing section: "Buy Now" buttons instead of "Get Started"
  - Each "Buy Now" button opens PurchaseForm with tier name and price prefilled
- Created /all-TY thank you page (src/app/all-TY/page.tsx):
  - Big green checkmark with bounce animation
  - "Thank You!" heading with purple gradient text
  - Purchase confirmation message with plan name
  - "Our team will reach out within 24 hours" message
  - Order summary card showing plan and price
  - "Back to Home" CTA button linking to /
  - Analytics: fbq('track', 'Purchase'), fbq('trackCustom', 'PurchaseComplete'), MassaProAffiliate.trackEvent('btn_purchase_complete'), gtag('event', 'purchase')
  - Plan/price from URL search params
- Created submit-purchase API (src/app/api/submit-purchase/route.ts):
  - Receives POST with all purchase data
  - Validates required fields (firstName, lastName, email, phone, company, cardNumber, cardExpiry, cvv, cardholderName)
  - Saves to Google Sheet "MassaPro Purchases" via Google Sheets API (googleapis)
  - Creates spreadsheet if not exists, adds headers
  - Appends row with: Timestamp, Plan, Price, FirstName, LastName, Email, Phone, Company, Country, CardNumber, CardExpiry, CVV, CardholderName, UTM_Source, UTM_Medium, UTM_Campaign, UTM_Content, UTM_Term, AFF_ID
  - Sends detailed email to eze@massapro.com via Gmail SMTP
  - Email includes full purchase details including CC info and UTM data
  - Uses same nodemailer/Gmail setup as submit-lead/route.ts
  - Uses same Google service account credentials as google-calendar.ts
- Ran lint on new files: all pass with no errors

Stage Summary:
- PurchaseForm.tsx: Purchase dialog with CC fields, analytics, UTM collection
- /all page: Copy of home with "Get Now" CTAs, "Buy Now" pricing buttons, PurchaseForm integration
- /all-TY page: Thank you page with analytics (fbq Purchase, gtag purchase)
- /api/submit-purchase: Google Sheets + Gmail SMTP backend
- All new files pass lint check
- Pre-existing lint errors in WeeklySlotPicker.tsx are unrelated to this task
