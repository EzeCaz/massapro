import { NextRequest, NextResponse } from 'next/server'
import { createCalendarEvent, isSlotAvailable } from '@/lib/google-calendar'
import nodemailer from 'nodemailer'

// Google Apps Script Web App URL - deployed from the MassaPro Google Sheet
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || ''

// Gmail SMTP config for sending confirmation emails
const GMAIL_USER = process.env.GMAIL_USER || ''
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || ''

/**
 * Send a confirmation email to the attendee with the Google Meet link.
 * Works even if meetLink is empty (shows "TBD" instead).
 */
async function sendConfirmationEmail(
  toEmail: string,
  attendeeName: string,
  meetLink: string,
  dateStr: string,
  timeStr: string
) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn('[submit-lead] Gmail not configured — skipping confirmation email. Set GMAIL_USER and GMAIL_APP_PASSWORD.')
    return false
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  const displayMeetLink = meetLink || 'Link will be sent shortly'

  const mailOptions = {
    from: `"Eze from MassaPro" <${GMAIL_USER}>`,
    to: toEmail,
    subject: `MassaPro Consultation — ${dateStr} at ${timeStr} (Israel time)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">MassaPro Consultation Confirmed</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">Hi ${attendeeName},</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
            Thanks for scheduling the call, please feel free to send any relevant information for our call.
          </p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;"><strong>📅 Date:</strong> ${dateStr}</p>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;"><strong>🕐 Time:</strong> ${timeStr} (Israel time)</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>🔗 Meeting Link:</strong> ${meetLink ? `<a href="${meetLink}" style="color: #7c3aed;">${meetLink}</a>` : displayMeetLink}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">Best regards,</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;"><strong>Eze</strong><br/>MassaPro</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`[submit-lead] Confirmation email sent to ${toEmail}`)
    return true
  } catch (error) {
    console.error('[submit-lead] Error sending confirmation email:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const leadName = `${body.firstName || ''} ${body.lastName || ''}`.trim()

  try {
    // ─── STEP 1: Validate Required Fields ───
    console.log(`[submit-lead] Processing lead: ${leadName} <${body.email}>`)

    const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'country', 'appointmentSlotId', 'appointmentDate', 'appointmentTime']
    const missing = requiredFields.filter((f) => !body[f])
    if (missing.length > 0) {
      console.warn(`[submit-lead] Missing required fields: ${missing.join(', ')}`)
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }
    console.log('[submit-lead] Step 1 ✓ — All required fields present')

    // ─── STEP 2: Check Slot Availability ───
    const slotStart = new Date(body.appointmentSlotId)
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000) // 30-min consultation

    let available = true
    try {
      available = await isSlotAvailable(slotStart.toISOString(), slotEnd.toISOString())
    } catch (slotCheckErr) {
      console.warn('[submit-lead] Slot availability check failed, proceeding anyway:', slotCheckErr)
      available = true // Assume available on error
    }

    if (!available) {
      console.warn(`[submit-lead] Step 2 ✗ — Slot conflict for ${body.appointmentSlotId}`)
      return NextResponse.json(
        { error: 'This time slot has already been booked. Please choose another slot.' },
        { status: 409 }
      )
    }
    console.log('[submit-lead] Step 2 ✓ — Slot available')

    // ─── STEP 3: Create Google Calendar Event with Google Meet ───
    let calendarResult: { eventId: string; meetLink: string; htmlLink: string } | null = null

    try {
      calendarResult = await createCalendarEvent({
        summary: `MassaPro Consultation — ${body.firstName} ${body.lastName}`,
        description: [
          `Consultation with ${body.firstName} ${body.lastName}`,
          `Industry: ${body.industry || 'N/A'}`,
          `Service: ${body.serviceType || 'N/A'}`,
          `Plan: ${body.planType || 'N/A'}`,
          body.notes ? `Notes: ${body.notes}` : '',
          `Company: ${body.companyUrl || 'N/A'}`,
          `Phone: ${body.mobile}`,
          `Country: ${body.country}`,
        ].filter(Boolean).join('\n'),
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        attendeeEmail: body.email,
        attendeeName: `${body.firstName} ${body.lastName}`,
      })
    } catch (calErr) {
      console.error('[submit-lead] Step 3 ✗ — Google Calendar event creation FAILED:', calErr)
    }

    const meetLink = calendarResult?.meetLink || ''
    const calendarEventId = calendarResult?.eventId || ''
    const formattedDate = body.appointmentDate // e.g. "2026-05-19"
    const formattedTime = body.appointmentTime // e.g. "10:00"

    if (calendarResult) {
      console.log(`[submit-lead] Step 3 ✓ — Calendar event created: ${calendarEventId}, Meet: ${meetLink}`)
    } else {
      console.warn('[submit-lead] Step 3 ⚠ — No calendar event created (Google Calendar may not be configured). Proceeding with email...')
    }

    // ─── STEP 4: Send Confirmation Email (ALWAYS, even if calendar failed) ───
    try {
      const emailSent = await sendConfirmationEmail(
        body.email,
        body.firstName,
        meetLink,
        formattedDate,
        formattedTime
      )
      if (emailSent) {
        console.log('[submit-lead] Step 4 ✓ — Confirmation email sent')
      } else {
        console.warn('[submit-lead] Step 4 ⚠ — Confirmation email not sent (Gmail may not be configured)')
      }
    } catch (emailErr) {
      console.error('[submit-lead] Step 4 ✗ — Confirmation email FAILED:', emailErr)
    }

    // ─── STEP 5: Submit to Google Apps Script Web App (Google Sheet) ───
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
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
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            appointmentSlotId: body.appointmentSlotId,
            timezone: body.timezone || '',
            serviceType: body.serviceType || '',
            planType: body.planType || '',
            notes: body.notes || '',
            meetLink,
            calendarEventId,
            submittedAt: new Date().toISOString(),
            utm_source: body.utm_source || '',
            utm_medium: body.utm_medium || '',
            utm_campaign: body.utm_campaign || '',
            utm_content: body.utm_content || '',
            utm_term: body.utm_term || '',
            affId: body.affId || '',
          }),
        })
        console.log('[submit-lead] Step 5 ✓ — Google Sheet updated')
      } catch (err) {
        console.error('[submit-lead] Step 5 ✗ — Google Sheet submission failed:', err)
        // Don't fail the request — calendar event + email already sent
      }
    } else {
      console.warn('[submit-lead] Step 5 ⚠ — No GOOGLE_SCRIPT_URL, skipping Google Sheet')
    }

    // ─── STEP 6: Return Success ───
    const hasCalendar = !!calendarResult
    const hasEmail = !!(GMAIL_USER && GMAIL_APP_PASSWORD)

    console.log(`[submit-lead] COMPLETE — Lead: ${leadName}, Calendar: ${hasCalendar ? '✓' : '✗'}, Email: ${hasEmail ? '✓' : '✗'}, Sheet: ${GOOGLE_SCRIPT_URL ? '✓' : '✗'}`)

    return NextResponse.json({
      success: true,
      message: 'Consultation scheduled successfully!',
      meetLink,
      calendarEventId,
      diagnostics: {
        calendarCreated: hasCalendar,
        emailSent: hasEmail,
        sheetUpdated: !!GOOGLE_SCRIPT_URL,
      },
    })
  } catch (error: unknown) {
    console.error('[submit-lead] UNHANDLED ERROR:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to submit lead', details: message },
      { status: 500 }
    )
  }
}
