import { NextRequest, NextResponse } from 'next/server'

// Google Apps Script Web App URL - deployed from the MassaPro Google Sheet
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'country']
    const missing = requiredFields.filter((f) => !body[f])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // If no Google Script URL configured, log the data and return success
    if (!GOOGLE_SCRIPT_URL) {
      console.log('📧 Lead received (no Google Script URL configured):', JSON.stringify(body, null, 2))
      return NextResponse.json({
        success: true,
        message: 'Lead received! Google Sheet integration not yet configured.',
        data: body,
      })
    }

    // Submit to Google Apps Script Web App
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        companyName: body.companyName || '',
        companyUrl: body.companyUrl || '',
        industry: body.industry || '',
        email: body.email,
        mobile: body.mobile,
        country: body.country,
        state: body.state || '',
        appointmentDate: body.appointmentDate || '',
        appointmentTime: body.appointmentTime || '',
        timezone: body.timezone || '',
        serviceType: body.serviceType || '',
        planType: body.planType || '',
        notes: body.notes || '',
        submittedAt: new Date().toISOString(),
        utm_source: body.utm_source || '',
        utm_medium: body.utm_medium || '',
        utm_campaign: body.utm_campaign || '',
        utm_content: body.utm_content || '',
        utm_term: body.utm_term || '',
      }),
    })

    if (!response.ok) {
      throw new Error(`Google Script returned ${response.status}`)
    }

    const result = await response.text().catch(() => 'OK')

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully to Google Sheet!',
      result,
    })
  } catch (error: unknown) {
    console.error('Lead submission error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to submit lead', details: message },
      { status: 500 }
    )
  }
}
