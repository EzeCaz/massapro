'use client'

import { useState, useMemo, useEffect } from 'react'
import { Check, ChevronLeft, ChevronRight, Clock, ChevronDown } from 'lucide-react'

const ISRAEL_TZ = 'Asia/Jerusalem'
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']

// Israel business hours
const MORNING_SLOTS = [
  { h: 10, m: 0 }, { h: 10, m: 30 },
  { h: 11, m: 0 }, { h: 11, m: 30 },
  { h: 12, m: 0 }, { h: 12, m: 30 },
  { h: 13, m: 0 }, { h: 13, m: 30 },
  { h: 14, m: 0 }, { h: 14, m: 30 },
  { h: 15, m: 0 }, { h: 15, m: 30 },
]
const EVENING_SLOTS = [
  { h: 20, m: 30 }, { h: 21, m: 0 }, { h: 21, m: 30 },
]

export interface SlotInfo {
  id: string // ISO string of the slot start time (UTC)
  localLabel: string // e.g. "10:00 AM"
  isPast: boolean
  isBooked: boolean
}

export interface DaySlots {
  dateISO: string // e.g. "2026-05-19"
  dayLabel: string // e.g. "Sun"
  dateLabel: string // e.g. "May 19"
  morning: SlotInfo[]
  evening: SlotInfo[]
  hasAvailableSlots: boolean // at least one non-past, non-booked slot
}

interface WeeklySlotPickerProps {
  selectedSlot: string
  onSelectSlot: (slotId: string, dateISO: string, timeIsrael: string) => void
  bookedSlots: string[]
}

/**
 * Get the UTC offset (in ms) for Israel timezone on a specific date.
 * Handles DST correctly (IST = UTC+2, IDT = UTC+3).
 */
function getIsraelOffsetMs(year: number, month0: number, day: number): number {
  const noonUTC = new Date(Date.UTC(year, month0, day, 12, 0, 0))
  const israelStr = noonUTC.toLocaleString('en-US', { timeZone: ISRAEL_TZ })
  const israelDate = new Date(israelStr)
  return israelDate.getTime() - noonUTC.getTime()
}

/**
 * Create a JS Date object for a specific date+time in Israel timezone.
 */
function createIsraelDate(year: number, month0: number, day: number, hours: number, minutes: number): Date {
  const offset = getIsraelOffsetMs(year, month0, day)
  const utcMs = Date.UTC(year, month0, day, hours, minutes, 0) - offset
  return new Date(utcMs)
}

/**
 * Format a Date in the user's local timezone as "10:00 AM" style.
 */
function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/**
 * Get the user's timezone name.
 */
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

/**
 * Get the Sunday that starts the week containing `date`.
 */
function getWeekSunday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun ... 6=Sat
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function WeeklySlotPicker({ selectedSlot, onSelectSlot, bookedSlots }: WeeklySlotPickerProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [userTz] = useState(getUserTimezone)
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const now = useMemo(() => new Date(), [])

  // Calculate the start (Sunday) of the displayed week
  const weekSunday = useMemo(() => {
    const base = getWeekSunday(now)
    base.setDate(base.getDate() + weekOffset * 7)
    return base
  }, [now, weekOffset])

  // Generate all slots for the week
  const days = useMemo<DaySlots[]>(() => {
    const result: DaySlots[] = []

    for (let i = 0; i < 5; i++) { // Sun=0 to Thu=4
      const dayDate = new Date(weekSunday)
      dayDate.setDate(weekSunday.getDate() + i)

      const year = dayDate.getFullYear()
      const month = dayDate.getMonth()
      const day = dayDate.getDate()

      const morningSlots: SlotInfo[] = []
      const eveningSlots: SlotInfo[] = []

      for (const { h, m } of MORNING_SLOTS) {
        const slotDate = createIsraelDate(year, month, day, h, m)
        const id = slotDate.toISOString()
        const isPast = slotDate.getTime() < now.getTime()
        const isBooked = bookedSlots.includes(id)
        morningSlots.push({
          id,
          localLabel: formatLocalTime(slotDate),
          isPast,
          isBooked,
        })
      }

      for (const { h, m } of EVENING_SLOTS) {
        const slotDate = createIsraelDate(year, month, day, h, m)
        const id = slotDate.toISOString()
        const isPast = slotDate.getTime() < now.getTime()
        const isBooked = bookedSlots.includes(id)
        eveningSlots.push({
          id,
          localLabel: formatLocalTime(slotDate),
          isPast,
          isBooked,
        })
      }

      const hasAvailableSlots = [...morningSlots, ...eveningSlots].some(s => !s.isPast && !s.isBooked)

      result.push({
        dateISO: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        dayLabel: DAY_LABELS[i],
        dateLabel: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        morning: morningSlots,
        evening: eveningSlots,
        hasAvailableSlots,
      })
    }

    // Filter out days with no available slots at all (all past/booked)
    return result.filter(d => d.hasAvailableSlots)
  }, [weekSunday, now, bookedSlots])

  // Week label
  const weekLabel = useMemo(() => {
    if (days.length === 0) return ''
    const start = days[0]?.dateLabel || ''
    const end = days[days.length - 1]?.dateLabel || ''
    return `${start} — ${end}`
  }, [days])

  // Check if all remaining days are unavailable (to auto-advance)
  const allUnavailable = days.length === 0

  // Auto-advance week if all slots are unavailable
  useEffect(() => {
    if (allUnavailable && weekOffset < 8) {
      setWeekOffset(prev => prev + 1)
    }
  }, [allUnavailable, weekOffset])

  // Find the selected slot's display info
  const selectedSlotInfo = useMemo(() => {
    if (!selectedSlot) return null
    for (const d of days) {
      for (const s of [...d.morning, ...d.evening]) {
        if (s.id === selectedSlot) {
          return { dayLabel: d.dayLabel, dateLabel: d.dateLabel, time: s.localLabel }
        }
      }
    }
    return null
  }, [selectedSlot, days])

  const handleSlotClick = (slot: SlotInfo, day: DaySlots) => {
    if (slot.isPast || slot.isBooked) return
    if (selectedSlot === slot.id) {
      // Deselect
      onSelectSlot('', '', '')
    } else {
      // Find the Israel time string for the backend
      const slotDate = new Date(slot.id)
      const israelStr = slotDate.toLocaleString('en-US', {
        timeZone: ISRAEL_TZ,
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
      const timeParts = israelStr.match(/(\d{1,2}):(\d{2})/)
      const timeIsrael = timeParts ? `${timeParts[1].padStart(2, '0')}:${timeParts[2]}` : ''
      onSelectSlot(slot.id, day.dateISO, timeIsrael)
    }
  }

  const toggleDayExpand = (dateISO: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(dateISO)) {
        next.delete(dateISO)
      } else {
        next.add(dateISO)
      }
      return next
    })
  }

  // Get visible slots for a day (collapsed = 2 morning + 2 evening; expanded = all)
  const getVisibleSlots = (day: DaySlots) => {
    const isExpanded = expandedDays.has(day.dateISO)

    // Filter out past/booked slots for display
    const availableMorning = day.morning.filter(s => !s.isPast && !s.isBooked)
    const availableEvening = day.evening.filter(s => !s.isPast && !s.isBooked)

    if (isExpanded) {
      // Show all non-past, non-booked slots
      return {
        morning: availableMorning,
        evening: availableEvening,
        hasMoreMorning: false,
        hasMoreEvening: false,
      }
    }

    // Collapsed: show first 2 available from each
    const morningPreview = availableMorning.slice(0, 2)
    const eveningPreview = availableEvening.slice(0, 2)
    return {
      morning: morningPreview,
      evening: eveningPreview,
      hasMoreMorning: availableMorning.length > 2,
      hasMoreEvening: availableEvening.length > 2,
    }
  }

  const renderSlot = (slot: SlotInfo, day: DaySlots) => {
    const isSelected = selectedSlot === slot.id
    const isDisabled = slot.isPast || slot.isBooked

    return (
      <button
        key={slot.id}
        type="button"
        disabled={isDisabled}
        onClick={() => handleSlotClick(slot, day)}
        className={`
          w-full py-1.5 px-2 rounded-md text-xs font-medium transition-all
          flex items-center justify-center gap-1
          ${isSelected
            ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
            : isDisabled
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 cursor-pointer border border-purple-100'
          }
        `}
      >
        {isSelected && <Check className="w-3 h-3" />}
        {slot.localLabel}
      </button>
    )
  }

  if (days.length === 0 && weekOffset >= 8) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No available slots found in the next 8 weeks.</p>
        <p className="text-sm mt-1">Please contact us directly at info@massapro.com</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label>Choose a Time Slot</Label>
        <div className="flex items-center gap-1 text-xs text-purple-500">
          <Clock className="w-3 h-3" />
          Times in {userTz}
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-purple-50/50 rounded-lg px-3 py-2">
        <button
          type="button"
          onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
          disabled={weekOffset === 0}
          className="p-1 rounded hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-purple-700" />
        </button>
        <span className="text-sm font-medium text-purple-800">{weekLabel}</span>
        <button
          type="button"
          onClick={() => setWeekOffset(prev => prev + 1)}
          disabled={weekOffset >= 8}
          className="p-1 rounded hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-purple-700" />
        </button>
      </div>

      {/* Weekly grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        {/* Desktop: horizontal grid */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-2 min-w-[600px]">
          {days.map((day) => {
            const { morning, evening, hasMoreMorning, hasMoreEvening } = getVisibleSlots(day)
            const isExpanded = expandedDays.has(day.dateISO)
            const hasMore = hasMoreMorning || hasMoreEvening

            return (
              <div key={day.dateISO} className="space-y-2">
                {/* Day header */}
                <div className="text-center pb-1 border-b border-purple-100">
                  <div className="text-xs font-bold text-purple-800">{day.dayLabel}</div>
                  <div className="text-[11px] text-purple-500">{day.dateLabel}</div>
                </div>

                {/* Morning */}
                {morning.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Morning</div>
                    {morning.map(slot => renderSlot(slot, day))}
                  </div>
                )}

                {/* Evening */}
                {evening.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Evening</div>
                    {evening.map(slot => renderSlot(slot, day))}
                  </div>
                )}

                {/* See more / Show less */}
                {hasMore && !isExpanded && (
                  <button
                    type="button"
                    onClick={() => toggleDayExpand(day.dateISO)}
                    className="w-full text-[11px] font-medium text-purple-600 hover:text-purple-800 flex items-center justify-center gap-0.5 py-1 transition-colors"
                  >
                    See more <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                {isExpanded && (
                  <button
                    type="button"
                    onClick={() => toggleDayExpand(day.dateISO)}
                    className="w-full text-[11px] font-medium text-gray-400 hover:text-gray-600 flex items-center justify-center gap-0.5 py-1 transition-colors"
                  >
                    Show less
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile: vertical list */}
        <div className="sm:hidden space-y-3">
          {days.map((day) => {
            const { morning, evening, hasMoreMorning, hasMoreEvening } = getVisibleSlots(day)
            const isExpanded = expandedDays.has(day.dateISO)
            const hasMore = hasMoreMorning || hasMoreEvening

            return (
              <div key={day.dateISO} className="bg-white rounded-lg border border-purple-100 p-3">
                <div className="font-semibold text-purple-800 text-sm mb-2">
                  {day.dayLabel}, {day.dateLabel}
                </div>

                {morning.length > 0 && (
                  <div className="space-y-1 mb-2">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Morning</div>
                    <div className="grid grid-cols-3 gap-1">
                      {morning.map(slot => renderSlot(slot, day))}
                    </div>
                  </div>
                )}

                {evening.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Evening</div>
                    <div className="grid grid-cols-3 gap-1">
                      {evening.map(slot => renderSlot(slot, day))}
                    </div>
                  </div>
                )}

                {hasMore && !isExpanded && (
                  <button
                    type="button"
                    onClick={() => toggleDayExpand(day.dateISO)}
                    className="w-full text-[11px] font-medium text-purple-600 hover:text-purple-800 flex items-center justify-center gap-0.5 py-1 mt-1 transition-colors"
                  >
                    See more <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                {isExpanded && (
                  <button
                    type="button"
                    onClick={() => toggleDayExpand(day.dateISO)}
                    className="w-full text-[11px] font-medium text-gray-400 hover:text-gray-600 flex items-center justify-center gap-0.5 py-1 mt-1 transition-colors"
                  >
                    Show less
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected slot confirmation */}
      {selectedSlotInfo && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium">
          <Check className="w-4 h-4" />
          Selected: {selectedSlotInfo.dayLabel}, {selectedSlotInfo.dateLabel} at {selectedSlotInfo.time}
        </div>
      )}

      {/* Timezone note */}
      <p className="text-[11px] text-gray-400 text-center">
        Business hours: Sun–Thu, 10:00–16:00 &amp; 20:30–22:00 Israel time
      </p>
    </div>
  )
}

/* Reusable Label component (matches the LeadForm style) */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}
