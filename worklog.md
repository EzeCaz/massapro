---
Task ID: 1
Agent: Main Agent
Task: Update LeadForm and Google Apps Script for MassaPro landing page

Work Log:
- Read current project files: LeadForm.tsx, api/submit-lead/route.ts, page.tsx, Massapro_GoogleSheet_Script.js, .env
- Updated LeadForm.tsx Company URL field: changed from `type="url"` to `type="text"` with regex pattern `^(https?://)?([\w-]+\.)+[\w-]+(/.*)?$` to accept both `www.site.com` and `https://www.site.com` formats
- Added helper text under Company URL field: "e.g. www.site.com or https://www.site.com"
- Removed manual date entry Input field from appointment date section, keeping only the calendar Popover picker
- Removed "Use the calendar or type manually (MM/DD/YYYY)" helper text
- Updated Google Apps Script to target the "Site" sheet tab instead of active sheet using `getOrCreateSheet()` function with `SHEET_NAME = 'Site'`
- Added auto-creation of "Site" sheet if it doesn't exist
- Verified page compiles and loads successfully (200 status)
- Restarted dev server

Stage Summary:
- LeadForm.tsx: URL validation now accepts www.site.com and https://www.site.com
- LeadForm.tsx: Date picker is calendar-only (manual entry removed)
- Massapro_GoogleSheet_Script.js: Now writes to "Site" tab specifically
- All "Get Started" and "Contact Us" buttons already connected to form via onOpenForm prop
- User still needs to deploy Google Apps Script and set GOOGLE_SCRIPT_URL in .env
