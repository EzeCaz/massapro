# Dashboard API Specification

This document defines the contract between the MassaPro main website (sender) and the affiliate dashboard (receiver).

## Base URL
`https://aff.massapro.com`

---

## 1. Track Click (Pageview)
**POST** `/api/track/click`

Sends a pageview/click event when a user visits the site with an affiliate ID.

```json
{
  "affid": "MP-EITAN-001",
  "landing_page": "/all",
  "ip": "auto",
  "user_agent": "auto",
  "referer": "https://google.com"
}
```

- If no `affid` URL parameter, the dashboard auto-assigns `no_affiliate`
- Returns: `{ success: true, click_id: "...", session_id: "..." }`

---

## 2. Track Lead
**POST** `/api/leads`

Sends a lead form submission.

```json
{
  "affid": "MP-EITAN-001",
  "name": "Christine Marchesotti",
  "email": "christine@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "plan_type": "Enterprise",
  "message": "Interested in the Enterprise plan"
}
```

- Fires for ALL traffic (including `no_affiliate`)
- The `affid` comes from `MassaProAffiliate.getAttribution().affid`

---

## 3. Track Event (Button Click)
**POST** `/api/events`

Sends a button click / CTA interaction event.

```json
{
  "affid": "MP-EITAN-001",
  "event_type": "button_click",
  "event_id": "btn_buy_basic",
  "session_id": "sess_abc123",
  "metadata": {
    "plan": "Basic",
    "page": "/all"
  }
}
```

**Known event_ids from the main site:**
- `btn_buy_basic` — Buy Now button for Basic plan ($500)
- `btn_buy_professional` — Buy Now button for Professional plan ($1,200)
- `btn_buy_enterprise` — Buy Now button for Enterprise plan ($2,000)
- `btn_book_demo` — Book a Demo button (lead form open)

---

## 4. Track Cart (AddToCart)
**POST** `/api/events`

Fires when a user clicks a Buy Now button (maps to Meta Pixel `AddToCart` + GA4 `add_to_cart`).

```json
{
  "affid": "MP-EITAN-001",
  "event_type": "add_to_cart",
  "event_id": "cart_basic",
  "session_id": "sess_abc123",
  "plan_type": "Basic",
  "cart_value": 500
}
```

**Plan mapping:**
| Plan | plan_type | cart_value |
|------|-----------|------------|
| Basic | Basic | 500 |
| Professional | Professional | 1200 |
| Enterprise | Enterprise | 2000 |

---

## 5. Track Purchase
**POST** `/api/stats`

Fires on the `/all-TY` thank-you page after ClickBank redirect.

```json
{
  "affid": "MP-EITAN-001",
  "event_type": "purchase",
  "plan_type": "Basic",
  "revenue": 500
}
```

- Fires for ALL traffic (no affid guard)
- The `affid` is retrieved from `MassaProAffiliate.getAttribution().affid`

---

## ClickBank Integration

The main site appends `cvendthru=affid` to ClickBank checkout URLs so ClickBank can pass the affid back via server-side postback.

**ClickBank item mapping:**
| cbitems | Plan | Price |
|---------|------|-------|
| 1000 | Basic | $500 |
| 1001 | Professional | $1,200 |
| 1002 | Enterprise | $2,000 |

**URL format:**
```
https://massapro.pay.clickbank-secure.com/?cbitems=1000&cvendthru=MP-EITAN-001
```

`cvendthru` is ONLY appended for real affiliates (not `no_affiliate`).

---

## No Affiliate Handling

- Direct/organic traffic (no `?affid=` param) gets `affid = "no_affiliate"` automatically
- All tracking calls still fire for `no_affiliate` traffic
- Dashboard should display "No Affiliate" as a row in the affiliate list
