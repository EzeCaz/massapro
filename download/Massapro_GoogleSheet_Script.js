/**
 * MassaPro Lead Form — Google Apps Script
 *
 * This script writes form submissions to the "Site" tab of your Google Sheet.
 * Columns A–P = form data, Columns Q–U = UTM tracking parameters, Column V = Affiliate ID.
 *
 * COLUMN V — AFFILIATE ID:
 *   The Affiliate ID is captured from the URL in three different UTM parameter formats:
 *     1. ?utm=MP-ROBERTO-001          (generic utm param)
 *     2. ?Aff+Id=MP-ROBERTO-001       (Aff Id with space encoded as +)
 *     3. ?Aff-Id=MP-ROBERTO-001       (Aff-Id with hyphen)
 *   All three resolve to the same Affiliate ID value in column V.
 *   Priority: Aff-Id > Aff Id > utm  (most specific wins)
 *
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Pzm2p-QrgqYY-98SIQDWIvY8igF1ex22qdQ6BnEvleQ/edit
 * 2. Make sure there is a tab/sheet named exactly "Site" (create one if it doesn't exist)
 * 3. Go to Extensions > Apps Script
 * 4. Delete any existing code in the script editor
 * 5. Paste this entire script
 * 6. Click Deploy > New deployment
 * 7. Select type: "Web app"
 * 8. Set "Execute as" to "Me"
 * 9. Set "Who has access" to "Anyone"
 * 10. Click Deploy
 * 11. Copy the Web App URL
 * 12. Add it to your .env file as: GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
 * 13. Restart the dev server
 *
 * IMPORTANT: The script writes to the sheet named "Site".
 *           If that sheet doesn't exist, it will be created automatically.
 *           If UTM/Affiliate headers are missing, they will be added automatically.
 *
 * COLUMNS:
 *   A  = First Name
 *   B  = Last Name
 *   C  = Company Name
 *   D  = Company URL
 *   E  = Industry
 *   F  = Email
 *   G  = Mobile
 *   H  = Country
 *   I  = State
 *   J  = Appointment Date
 *   K  = Appointment Time
 *   L  = Timezone
 *   M  = Service Type
 *   N  = Plan Type
 *   O  = Notes
 *   P  = Submitted At
 *   Q  = UTM Source      (e.g. facebook, google, instagram)
 *   R  = UTM Medium      (e.g. paid_social, cpc, email, organic)
 *   S  = UTM Campaign    (e.g. spring_sale, medspa_q2_launch)
 *   T  = UTM Content     (e.g. hero_cta, sidebar_ad, video_v2)
 *   U  = UTM Term        (e.g. ai+receptionist+med+spa)
 *   V  = Affiliate ID    (e.g. MP-ROBERTO-001, from ?utm= / ?Aff+Id= / ?Aff-Id=)
 */

var SHEET_NAME = 'Site';

var HEADERS = [
  'First Name',
  'Last Name',
  'Company Name',
  'Company URL',
  'Industry',
  'Email',
  'Mobile',
  'Country',
  'State',
  'Appointment Date',
  'Appointment Time',
  'Timezone',
  'Service Type',
  'Plan Type',
  'Notes',
  'Submitted At',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'UTM Term',
  'Affiliate ID'
];

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  // If the "Site" sheet doesn't exist, create it
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function ensureHeaders(sheet) {
  // Check if headers exist and are complete
  var lastColumn = sheet.getLastColumn();
  var firstCellValue = sheet.getRange(1, 1).getValue();

  // If sheet has no headers at all, initialize everything
  if (firstCellValue === '' || lastColumn === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#7e22ce')
      .setFontColor('#ffffff')
      .setWrap(true);
    for (var i = 1; i <= HEADERS.length; i++) {
      sheet.autoResizeColumn(i);
    }
    sheet.setFrozenRows(1);
    return;
  }

  // If headers exist but are missing columns (e.g. old sheet without Affiliate ID column)
  if (lastColumn < HEADERS.length) {
    // Get existing headers
    var existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

    // Add only the missing headers starting from the next column
    var newHeaders = HEADERS.slice(lastColumn);
    sheet.getRange(1, lastColumn + 1, 1, newHeaders.length).setValues([newHeaders]);
    sheet.getRange(1, lastColumn + 1, 1, newHeaders.length)
      .setFontWeight('bold')
      .setBackground('#7e22ce')
      .setFontColor('#ffffff')
      .setWrap(true);

    // Auto-resize new columns
    for (var j = lastColumn + 1; j <= HEADERS.length; j++) {
      sheet.autoResizeColumn(j);
    }
  }
}

/**
 * Resolve the Affiliate ID from the request data.
 * Checks three URL parameter formats in priority order:
 *   1. affId — directly passed from the frontend (already resolved)
 *   2. Fallback: check the raw UTM params for affiliate-style values
 *
 * On the frontend, the affiliate ID is extracted from URL params:
 *   ?Aff-Id=MP-ROBERTO-001  (highest priority)
 *   ?Aff+Id=MP-ROBERTO-001  (medium priority, space encoded as +)
 *   ?utm=MP-ROBERTO-001     (lowest priority, generic utm param)
 */
function resolveAffiliateId(data) {
  // 1. Direct affId field from frontend (preferred — already resolved)
  if (data.affId && data.affId.trim() !== '') {
    return data.affId.trim();
  }

  // 2. Fallback: check utm_source for known affiliate patterns (MP-XXXX-NNN)
  if (data.utm_source && /^MP-/i.test(data.utm_source.trim())) {
    return data.utm_source.trim();
  }

  // 3. No affiliate ID found
  return '';
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();

    // Ensure headers are complete (adds UTM + Affiliate ID columns if missing)
    ensureHeaders(sheet);

    var data = JSON.parse(e.postData.contents);

    // Resolve the Affiliate ID from the three supported URL param formats
    var affiliateId = resolveAffiliateId(data);

    // Append the data as a new row to the "Site" sheet (columns A–V)
    sheet.appendRow([
      data.firstName || '',
      data.lastName || '',
      data.companyName || '',
      data.companyUrl || '',
      data.industry || '',
      data.email || '',
      data.mobile || '',
      data.country || '',
      data.state || '',
      data.appointmentDate || '',
      data.appointmentTime || '',
      data.timezone || '',
      data.serviceType || '',
      data.planType || '',
      data.notes || '',
      data.submittedAt || new Date().toISOString(),
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.utm_content || '',
      data.utm_term || '',
      affiliateId
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Lead added successfully to Site tab', affiliateId: affiliateId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'MassaPro Lead Form', sheet: SHEET_NAME, columns: HEADERS.length }))
    .setMimeType(ContentService.MimeType.JSON);
}
