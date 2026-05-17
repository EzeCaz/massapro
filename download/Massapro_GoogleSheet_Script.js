/**
 * MassaPro Lead Form — Google Apps Script
 * 
 * This script writes form submissions to the "Site" tab of your Google Sheet.
 * Columns A–P = form data, Columns Q–U = UTM tracking parameters.
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
 *           If UTM headers are missing, they will be added automatically.
 *
 * UTM COLUMNS (Q–U):
 *   Q = UTM Source    (e.g. facebook, google, instagram)
 *   R = UTM Medium    (e.g. paid_social, cpc, email, organic)
 *   S = UTM Campaign  (e.g. spring_sale, medspa_q2_launch)
 *   T = UTM Content   (e.g. hero_cta, sidebar_ad, video_v2)
 *   U = UTM Term      (e.g. ai+receptionist+med+spa)
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
  'UTM Term'
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

  // If headers exist but are missing UTM columns (only 16 columns = no UTMs)
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

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();

    // Ensure headers are complete (adds UTM columns if missing)
    ensureHeaders(sheet);

    var data = JSON.parse(e.postData.contents);

    // Append the data as a new row to the "Site" sheet (columns Q–U = UTM params)
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
      data.utm_term || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Lead added successfully to Site tab' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'MassaPro Lead Form', sheet: SHEET_NAME }))
    .setMimeType(ContentService.MimeType.JSON);
}
