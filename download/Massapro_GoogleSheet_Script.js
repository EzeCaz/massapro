/**
 * MassaPro Lead Form — Google Apps Script
 * 
 * This script writes form submissions to the "Site" tab of your Google Sheet.
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
 */

var SHEET_NAME = 'Site';

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  // If the "Site" sheet doesn't exist, create it
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  return sheet;
}

function initializeSheet() {
  var sheet = getOrCreateSheet();

  // Set header row
  var headers = [
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
    'Submitted At'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#7e22ce')
    .setFontColor('#ffffff')
    .setWrap(true);

  // Auto-resize columns
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  // Freeze header row
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();

    // If headers aren't set yet, initialize
    if (sheet.getRange(1, 1).getValue() === '') {
      initializeSheet();
    }

    var data = JSON.parse(e.postData.contents);

    // Append the data as a new row to the "Site" sheet
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
      data.submittedAt || new Date().toISOString()
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
