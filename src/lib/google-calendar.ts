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
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com'

  // Remove surrounding quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    console.warn('[google-calendar] Auth not configured. Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.')
    return null
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    subject: calendarId,
  })
}

function getCalendar() {
  const auth = getAuth()
  if (!auth) return null
  return google.calendar({ version: 'v3', auth })
}

/**
 * Get booked event times from Google Calendar within a date range.
 * Returns an array of objects with start/end timestamps (ms) for precise overlap comparison.
 * Filters out all-day events, cancelled events, and declined events.
 */
export async function getBookedSlots(startDate: string, endDate: string): Promise<Array<{ startMs: number; endMs: number }>> {
  const calendar = getCalendar()
  if (!calendar) {
    console.warn('[google-calendar] getBookedSlots: Google Calendar not configured — returning empty booked slots')
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
      .filter((e) => {
        // Skip cancelled events
        if (e.status === 'cancelled') return false
        // Skip all-day events (no dateTime)
        if (!e.start?.dateTime || !e.end?.dateTime) return false
        // Skip events where the calendar owner declined
        const selfResponse = e.attendees?.find(
          (a) => a.email === (process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com')
              || a.self === true
        )
        if (selfResponse?.responseStatus === 'declined') return false
        return true
      })
      .map((e) => ({
        startMs: new Date(e.start.dateTime!).getTime(),
        endMs: new Date(e.end.dateTime!).getTime(),
      }))
  } catch (error) {
    console.error('[google-calendar] getBookedSlots FAILED:', error)
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
    console.warn('[google-calendar] createCalendarEvent: Google Calendar not configured — skipping event creation. Set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_CALENDAR_ID.')
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
  } catch (error: any) {
    console.error('[google-calendar] createCalendarEvent FAILED:', error?.message || error)
    if (error?.code) console.error('[google-calendar] Error code:', error.code)
    if (error?.errors) console.error('[google-calendar] Error details:', JSON.stringify(error.errors))
    return null
  }
}

/**
 * Check if a specific time slot is available (no conflicting events).
 * Only blocks on timed events (not all-day) that are confirmed or tentative.
 * Cancelled, all-day, and declined events are ignored.
 */
export async function isSlotAvailable(startTime: string, endTime: string): Promise<boolean> {
  const calendar = getCalendar()
  if (!calendar) {
    console.warn('[google-calendar] isSlotAvailable: Google Calendar not configured — assuming available')
    return true
  }

  try {
    const slotStart = new Date(startTime).getTime()
    const slotEnd = new Date(endTime).getTime()

    // Query with a wider window to catch events that overlap
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com',
      timeMin: new Date(slotStart - 30 * 60 * 1000).toISOString(),
      timeMax: new Date(slotEnd + 30 * 60 * 1000).toISOString(),
      singleEvents: true,
      maxResults: 50,
    })

    const events = response.data.items || []

    // Filter to only events that truly overlap with the requested slot
    const conflictingEvents = events.filter((event) => {
      // Skip cancelled events
      if (event.status === 'cancelled') return false

      // Skip all-day events (they have 'date' instead of 'dateTime')
      if (!event.start?.dateTime || !event.end?.dateTime) return false

      // Skip events where the calendar owner declined
      const selfResponse = event.attendees?.find(
        (a) => a.email === (process.env.GOOGLE_CALENDAR_ID || 'eze@massapro.com')
            || a.self === true
      )
      if (selfResponse?.responseStatus === 'declined') return false

      // Check actual time overlap
      const eventStart = new Date(event.start.dateTime!).getTime()
      const eventEnd = new Date(event.end.dateTime!).getTime()

      // Two ranges overlap if: start1 < end2 && start2 < end1
      return slotStart < eventEnd && eventStart < slotEnd
    })

    if (conflictingEvents.length > 0) {
      console.log('Slot conflict detected:', {
        slotStart,
        slotEnd,
        conflicts: conflictingEvents.map(e => ({
          summary: e.summary,
          start: e.start?.dateTime,
          end: e.end?.dateTime,
          status: e.status,
        })),
      })
    }

    return conflictingEvents.length === 0
  } catch (error) {
    console.error('[google-calendar] isSlotAvailable FAILED:', error)
    return true // Assume available on error
  }
}
