/**
 * MassaPro Lead Form — Google Apps Script
 *
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Pzm2p-QrgqYY-98SIQDWIvY8igF1ex22qdQ6BnEvleQ/edit
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code in the script editor
 * 4. Paste this entire script
 * 5. Click Deploy > New deployment
 * 6. Select type: "Web app"
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click Deploy
 * 10. Copy the Web App URL
 * 11. Add it to your .env file as: GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
 * 12. Restart the dev server
 */

function initializeSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

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
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If headers aren't set yet, initialize
    if (sheet.getRange(1, 1).getValue() === '') {
      initializeSheet();
    }

    var data = JSON.parse(e.postData.contents);

    // Append the data as a new row
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
      .createTextOutput(JSON.stringify({ success: true, message: 'Lead added successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'MassaPro Lead Form' }))
    .setMimeType(ContentService.MimeType.JSON);
}
