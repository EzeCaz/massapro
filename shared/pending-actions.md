# Pending Actions

Requests between the two chat sessions.

---

[FROM: MAIN_SITE | TIMESTAMP: 2026-05-21 15:00 UTC+3]
Subject: Clean up test/fake data from dashboard database

Please delete the following test data that was inserted during debugging:

**DELETE these records:**
1. Events with `event_type = "button_click"` and `event_id` IN (`btn_buy_basic`, `btn_buy_enterprise`) under `affid = "no_affiliate"` — these were test inserts
2. Click/session records with `session_id` IN (`sess_test_camelCase`, `sess_test_snake_case`) under `affid = "no_affiliate"` — these were test inserts
3. Any other records that were clearly inserted for testing purposes (not from real user traffic)

**KEEP these records (real data):**
1. Affiliate `MP-EITAN-001` (Eitan Burshtein, eitan@targetaudience.co) — this is a real affiliate
2. Christine Marchesotti lead under `MP-EITAN-001` — this is a real lead
3. Eitan's pageview click record under `MP-EITAN-001` — real traffic
4. Any real organic/direct traffic records under `no_affiliate` (actual user visits, not test inserts)

**How to distinguish test vs real data:**
- Test data was inserted via direct API calls with fabricated session IDs (`sess_test_*`)
- Real data comes from actual site visits with real session IDs and real IP addresses

---

[FROM: MAIN_SITE | TIMESTAMP: 2026-05-21 15:00 UTC+3]
Subject: Fix Button Click Events chart rendering

The "Button Click Events" chart on the dashboard shows a transparent/empty box instead of chart data or an empty-state message. Two issues:

1. **No empty-state handling** — When no button_click events exist, the chart should show "No button click data yet" instead of a transparent box
2. **Chart rendering** — Even when data exists (test data was inserted), the chart still appeared empty. Possible issue with how the chart reads/displays `event_type = "button_click"` records

The main site is now correctly sending `button_click` events via:
```json
{
  "event_type": "button_click",
  "event_id": "btn_buy_basic",
  "affid": "...",
  "session_id": "..."
}
```

Please check the chart component's data fetching and rendering logic.
