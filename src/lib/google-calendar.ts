/**
 * Google Calendar integration for MassaPro consultation booking.
 *
 * Uses a Google Cloud service account to:
 * 1. Check existing events (available-slots API)
 * 2. Create events with Google Meet links (submit-lead API)
 *
 * Setup:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a project → Enable Google Calendar API
 * 3. Create a Service Account → Download JSON key
 * 4. Share the calendar (eze@massapro.com) with the service account email
 * 5. Set environment variables:
 *    - GOOGLE_CLIENT_EMAIL: service account email
 *    - GOOGLE_PRIVATE_KEY: private key from JSON (the full key including \n)
 *    - GOOGLE_CALENDAR_ID: eze@massapro.com
 */

import { google } from 'googleapis'

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || ''

  // Remove surrounding quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    return null
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    subject: process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com',
  })
}

function getCalendar() {
  const auth = getAuth()
  if (!auth) return null
  return google.calendar({ version: 'v3', auth })
}

/**
 * Get booked event times from Google Calendar within a date range.
 * Returns an array of ISO strings representing the start times of existing events.
 */
export async function getBookedSlots(startDate: string, endDate: string): Promise<string[]> {
  const calendar = getCalendar()
  if (!calendar) {
    console.warn('Google Calendar not configured — returning empty booked slots')
    return []
  }

  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com',
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    })

    const events = response.data.items || []
    return events
      .filter((e) => e.start?.dateTime)
      .map((e) => new Date(e.start.dateTime!).toISOString())
  } catch (error) {
    console.error('Error fetching booked slots from Google Calendar:', error)
    return []
  }
}

/**
 * Create a Google Calendar event with a Google Meet link.
 * Returns the event data including the Meet link.
 */
export async function createCalendarEvent({
  summary,
  description,
  startTime,
  endTime,
  attendeeEmail,
  attendeeName,
}: {
  summary: string
  description: string
  startTime: string // ISO string
  endTime: string // ISO string
  attendeeEmail: string
  attendeeName: string
}): Promise<{ eventId: string; meetLink: string; htmlLink: string } | null> {
  const calendar = getCalendar()
  if (!calendar) {
    console.warn('Google Calendar not configured — skipping event creation')
    return null
  }

  try {
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com',
      requestBody: {
        summary,
        description,
        start: {
          dateTime: startTime,
          timeZone: 'Asia/Jerusalem',
        },
        end: {
          dateTime: endTime,
          timeZone: 'Asia/Jerusalem',
        },
        attendees: [
          { email: process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com', responseStatus: 'accepted' },
          { email: attendeeEmail, displayName: attendeeName },
        ],
        conferenceData: {
          createRequest: {
            requestId: `massapro-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 * 24 }, // 1 day before
            { method: 'email', minutes: 60 },       // 1 hour before
            { method: 'popup', minutes: 10 },        // 10 minutes before
          ],
        },
      },
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Sends invitations to attendees
    })

    const event = response.data
    const meetLink = event.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || event.hangoutLink || ''

    return {
      eventId: event.id || '',
      meetLink,
      htmlLink: event.htmlLink || '',
    }
  } catch (error) {
    console.error('Error creating Google Calendar event:', error)
    return null
  }
}

/**
 * Check if a specific time slot is available (no conflicting events).
 */
export async function isSlotAvailable(startTime: string, endTime: string): Promise<boolean> {
  const calendar = getCalendar()
  if (!calendar) return true // If not configured, assume available

  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com',
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      maxResults: 10,
    })

    const events = response.data.items || []
    return events.length === 0
  } catch (error) {
    console.error('Error checking slot availability:', error)
    return true // Assume available on error
  }
}
