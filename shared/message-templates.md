# Message Templates for Dashboard Chat

Copy the template you need, fill in the blanks, and paste it into the affiliate dashboard chat.

---

## 1. Create a New Affiliate

```
Please read /home/z/my-project/shared/README.md for context if you haven't already.

ACTION: Create a new affiliate in the dashboard database with the following details:

- Affiliate ID: [AFFILIATE_ID]
- Name: [FULL_NAME]
- Email: [EMAIL]
- Password: [PASSWORD]

After creating, confirm the affiliate appears in the dashboard and update /home/z/my-project/shared/pending-actions.md with the result.
```

**Example filled in:**
```
Please read /home/z/my-project/shared/README.md for context if you haven't already.

ACTION: Create a new affiliate in the dashboard database with the following details:

- Affiliate ID: MP-ROBERTO-001
- Name: Roberto Singler
- Email: rsingler18@gmail.com
- Password: soyelmejor

After creating, confirm the affiliate appears in the dashboard and update /home/z/my-project/shared/pending-actions.md with the result.
```

---

## 2. Add a Lead Under an Affiliate

```
Please read /home/z/my-project/shared/README.md for context if you haven't already.

ACTION: Add a lead under affiliate [AFFILIATE_ID] with the following details:

- Name: [LEAD_NAME]
- Email: [LEAD_EMAIL]
- Phone: [LEAD_PHONE]
- Company: [LEAD_COMPANY]
- Plan: [Basic / Professional / Enterprise]
- Message: [LEAD_MESSAGE]

After adding, confirm the lead appears in the dashboard under the correct affiliate and update /home/z/my-project/shared/pending-actions.md with the result.
```

---

## 3. Delete Specific Data

```
Please read /home/z/my-project/shared/README.md for context if you haven't already.

ACTION: Delete the following records from the dashboard database:

- Record type: [clicks / leads / events / affiliates]
- Filter: [e.g. affid = "MP-ROBERTO-001" OR session_id = "sess_test_123"]
- Reason: [e.g. test data / incorrect entry / cleanup]

IMPORTANT: Do NOT delete any other records. Only delete what is specified above.

After deleting, confirm what was removed and update /home/z/my-project/shared/pending-actions.md with the result.
```

---

## 4. Check Dashboard Data / Debug

```
Please read /home/z/my-project/shared/README.md for context if you haven't already.

ACTION: Investigate the following issue on the dashboard:

- Problem: [DESCRIBE THE PROBLEM]
- Page/Section: [e.g. Button Click Events chart / Leads table / Affiliates list]
- Expected: [WHAT SHOULD HAPPEN]
- Actual: [WHAT IS HAPPENING INSTEAD]

Relevant API spec: /home/z/my-project/shared/dashboard-api-spec.md

After investigating, report findings and update /home/z/my-project/shared/pending-actions.md with the result.
```

---

## 5. Fix Dashboard Bug

```
Please read /home/z/my-project/shared/README.md for context if you haven't already.

ACTION: Fix the following bug in the dashboard:

- Bug: [DESCRIBE THE BUG]
- Location: [e.g. Button Click Events chart component / Leads API route]
- Steps to reproduce: [1. Go to X, 2. Click Y, 3. See Z]

Relevant API spec: /home/z/my-project/shared/dashboard-api-spec.md
Integration status: /home/z/my-project/shared/integration-status.md

After fixing, confirm the fix works and update /home/z/my-project/shared/pending-actions.md with the result.
```

---

## 6. General Request (Custom)

```
Please read /home/z/my-project/shared/README.md for context if you haven't already.

ACTION: [DESCRIBE WHAT YOU NEED]

Details:
- [DETAIL 1]
- [DETAIL 2]
- [DETAIL 3]

Relevant files:
- /home/z/my-project/shared/dashboard-api-spec.md
- /home/z/my-project/shared/integration-status.md

After completing, update /home/z/my-project/shared/pending-actions.md with the result.
```
