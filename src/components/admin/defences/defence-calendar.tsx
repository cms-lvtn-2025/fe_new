'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Clock, Users, BookOpen } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { Council, DefenceEvent } from '@/types/defence'

interface DefenceCalendarProps {
  councils: Council[]
  onEventClick?: (event: DefenceEvent) => void
}

// Cấu hình localizer cho calendar
const locales = {
  'vi': vi,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function DefenceCalendar({ councils, onEventClick }: DefenceCalendarProps) {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setView(newView)
  }, [])

  // Chuyển đổi councils thành events cho calendar
  // Mỗi council = 1 event (không hiển thị từng topic)
  const events = useMemo(() => {
    const calendarEvents: DefenceEvent[] = []

    councils.forEach((council) => {
      // Chỉ hiển thị council nếu có timeStart
      if (!council.timeStart) return

      const startDate = new Date(council.timeStart)

      // Tính end time: mặc định 3 giờ sau start time của council
      // (hội đồng bảo vệ cho toàn bộ các topic)
      const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000) // +3 hours

      // Đếm số topics và students
      const topicCount = council.topicCouncils?.length || 0
      const studentCount = council.topicCouncils?.reduce(
        (sum, tc) => sum + (tc.enrollments?.length || 0),
        0
      ) || 0

      // Lấy stage từ topics (nếu có nhiều stage khác nhau thì lấy cái đầu)
      const stages = council.topicCouncils?.map(tc => tc.stage) || []
      const uniqueStages = Array.from(new Set(stages))
      const primaryStage = uniqueStages[0] || 'STAGE_DACN'

      calendarEvents.push({
        id: council.id,
        councilId: council.id,
        councilTitle: council.title,
        title: council.title,
        topicTitle: `${council.title} (${topicCount} đề tài)`,
        start: startDate,
        end: endDate,
        stage: primaryStage,
        students: [], // Không hiển thị students trong event title
        majorCode: council.majorCode,
        allDay: false,
        resource: {
          singleDay: true,
          topicCount,
          studentCount,
        },
      })
    })

    return calendarEvents
  }, [councils])

  // Custom event component with tooltip
  const EventComponent = ({ event }: { event: DefenceEvent }) => {
    const timeRange = `${format(event.start, 'HH:mm', { locale: vi })} - ${format(event.end, 'HH:mm', { locale: vi })}`
    const tooltipText = [
      event.councilTitle,
      `${event.resource?.topicCount || 0} đề tài`,
      `${event.resource?.studentCount || 0} sinh viên`,
      timeRange,
    ].filter(Boolean).join(' | ')

    return (
      <div
        className="overflow-hidden"
        style={{ maxWidth: '100%' }}
        title={tooltipText}
      >
        <div className="font-medium truncate text-xs leading-tight">
          {event.topicTitle}
        </div>
      </div>
    )
  }

  // Custom event style getter
  const eventStyleGetter = (event: DefenceEvent) => {
    let backgroundColor = '#3b82f6' // blue-500

    // Màu khác nhau cho từng stage
    if (event.stage === 'STAGE_DACN') {
      backgroundColor = '#10b981' // green-500
    } else if (event.stage === 'STAGE_LVTN') {
      backgroundColor = '#6366f1' // indigo-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg p-4">
      <style jsx global>{`
        /* Custom styles cho react-big-calendar với dark mode */
        .rbc-calendar {
          font-family: inherit;
        }

        /* Header */
        .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .dark .rbc-header {
          border-bottom-color: #374151;
          background-color: #1f2937;
          color: #f3f4f6;
        }

        /* Week view header */
        .rbc-time-header {
          border-bottom: 1px solid #e5e7eb;
          overflow: visible !important;
        }

        .dark .rbc-time-header {
          border-bottom-color: #374151;
        }

        .rbc-time-header-content {
          overflow: visible !important;
        }

        .rbc-time-header-gutter {
          overflow: visible !important;
        }

        .rbc-allday-cell {
          overflow: visible !important;
        }

        .rbc-header + .rbc-header {
          border-left: 1px solid #e5e7eb;
        }

        .dark .rbc-header + .rbc-header {
          border-left-color: #374151;
        }

        /* Fix header row overflow */
        .rbc-time-view .rbc-row {
          overflow: visible !important;
        }

        .rbc-time-header .rbc-row {
          overflow: visible !important;
        }

        /* Toolbar */
        .rbc-toolbar {
          padding: 12px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
          background-color: #f9fafb;
          border-radius: 8px;
        }

        .dark .rbc-toolbar {
          background-color: #1f2937;
        }

        .rbc-toolbar .rbc-btn-group {
          display: flex;
          gap: 4px;
        }

        .rbc-toolbar button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background-color: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }

        .dark .rbc-toolbar button {
          background-color: #374151;
          border-color: #4b5563;
          color: #f3f4f6;
        }

        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        .dark .rbc-toolbar button:hover {
          background-color: #4b5563;
          border-color: #6b7280;
        }

        .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .dark .rbc-toolbar button.rbc-active {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .rbc-toolbar .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          padding: 0 16px;
        }

        .dark .rbc-toolbar .rbc-toolbar-label {
          color: #f9fafb;
        }

        /* Month view */
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .dark .rbc-month-view {
          border-color: #374151;
        }

        .rbc-month-row {
          border-top: 1px solid #e5e7eb;
        }

        .dark .rbc-month-row {
          border-top-color: #374151;
        }

        .rbc-day-bg {
          border-left: 1px solid #e5e7eb;
        }

        .dark .rbc-day-bg {
          border-left-color: #374151;
          background-color: #1f2937;
        }

        .rbc-off-range-bg {
          background-color: #f9fafb;
        }

        .dark .rbc-off-range-bg {
          background-color: #111827;
        }

        .rbc-today {
          background-color: #dbeafe;
        }

        .dark .rbc-today {
          background-color: #1e3a8a;
        }

        /* Today in week/day view header */
        .rbc-time-header .rbc-today,
        .rbc-header.rbc-today {
          min-height: 50px;
          overflow: visible;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Date cell */
        .rbc-date-cell {
          padding: 4px 8px;
          text-align: right;
        }

        .dark .rbc-date-cell {
          color: #d1d5db;
        }

        .rbc-off-range {
          color: #9ca3af;
        }

        .dark .rbc-off-range {
          color: #6b7280;
        }

        /* Events */
        .rbc-event {
          padding: 2px 4px;
          cursor: pointer;
          font-size: 11px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rbc-event:hover {
          opacity: 1 !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          z-index: 10;
        }

        .rbc-event-label {
          font-size: 10px;
          display: none;
        }

        .rbc-event-content {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        /* Month view events */
        .rbc-month-view .rbc-event {
          border-radius: 3px;
          margin: 1px 0;
          padding: 2px 4px;
          max-width: calc(100% - 2px);
          overflow: hidden;
          display: block;
          position: relative;
        }

        /* CRITICAL: Force events to stay within their cell */
        .rbc-month-view .rbc-row-segment {
          position: relative;
          overflow: hidden;
        }

        .rbc-month-view .rbc-row-segment .rbc-event {
          left: 0 !important;
          right: auto !important;
          width: 100% !important;
          max-width: 100% !important;
          position: relative !important;
        }

        /* Remove any absolute positioning that causes spanning */
        .rbc-month-view .rbc-event-content {
          position: relative !important;
        }

        /* Improve event spacing in month view */
        .rbc-row-segment {
          padding: 0 1px;
        }

        .rbc-month-row {
          overflow: visible;
          min-height: 100px;
        }

        /* Fix for events in date cells */
        .rbc-row-content {
          position: relative;
          user-select: none;
          z-index: 4;
        }

        .rbc-addons-dnd .rbc-row-segment {
          flex: 1 1 0;
          overflow: hidden;
        }

        /* Prevent events from spanning multiple days visually */
        .rbc-event-continues-prior,
        .rbc-event-continues-after,
        .rbc-event-continues-earlier,
        .rbc-event-continues-later {
          border-radius: 3px !important;
        }

        .rbc-event-continues-prior::before,
        .rbc-event-continues-after::after,
        .rbc-event-continues-earlier::before,
        .rbc-event-continues-later::after {
          display: none !important;
        }

        /* Force single-day events - override any multi-day styling */
        .rbc-month-view .rbc-event-allday,
        .rbc-month-view .rbc-event {
          display: block !important;
          width: 100% !important;
          left: 0 !important;
          right: 0 !important;
        }

        /* Each event should be contained in its cell */
        .rbc-row-bg + .rbc-row-content {
          position: absolute;
          width: 100%;
          pointer-events: none;
        }

        .rbc-row-content > * {
          pointer-events: auto;
        }

        /* Make sure events are properly contained */
        .rbc-month-view .rbc-row {
          position: relative;
          overflow: hidden;
        }

        /* Override any flex that might cause spanning */
        .rbc-month-view .rbc-row-segment {
          flex: 0 0 14.2857% !important;
        }

        /* Time view */
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .dark .rbc-time-view {
          border-color: #374151;
        }

        .rbc-time-header {
          border-bottom: 1px solid #e5e7eb;
        }

        .dark .rbc-time-header {
          border-bottom-color: #374151;
        }

        .rbc-time-content {
          border-top: 1px solid #e5e7eb;
        }

        .dark .rbc-time-content {
          border-top-color: #374151;
          background-color: #1f2937;
        }

        .rbc-timeslot-group {
          border-left: 1px solid #e5e7eb;
        }

        .dark .rbc-timeslot-group {
          border-left-color: #374151;
        }

        .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }

        .dark .rbc-time-slot {
          border-top-color: #374151;
        }

        .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }

        /* Week/Day view - Allow overlapping events to display side by side */
        .rbc-day-slot .rbc-events-container {
          margin-right: 0;
        }

        .rbc-day-slot .rbc-event {
          border: 1px solid #fff;
          padding: 2px 5px;
        }

        /* Ensure events can overlap and display side-by-side */
        .rbc-addons-dnd .rbc-addons-dnd-resizable {
          position: relative;
        }

        .rbc-time-column {
          position: relative;
        }

        /* Show more link */
        .rbc-show-more {
          background-color: transparent;
          color: #3b82f6;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 4px;
        }

        .dark .rbc-show-more {
          color: #60a5fa;
        }

        /* Agenda view */
        .rbc-agenda-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .dark .rbc-agenda-view {
          border-color: #374151;
          background-color: #1f2937;
        }

        .rbc-agenda-view table {
          border-spacing: 0;
        }

        .rbc-agenda-table {
          border: none;
        }

        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell,
        .rbc-agenda-event-cell {
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .dark .rbc-agenda-date-cell,
        .dark .rbc-agenda-time-cell,
        .dark .rbc-agenda-event-cell {
          border-bottom-color: #374151;
          color: #f3f4f6;
        }

        .rbc-agenda-date-cell {
          font-weight: 600;
        }

        .rbc-agenda-time-cell {
          white-space: nowrap;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
        view={view}
        date={date}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={(event) => onEventClick?.(event as DefenceEvent)}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        messages={{
          next: 'Sau',
          previous: 'Trước',
          today: 'Hôm nay',
          month: 'Tháng',
          week: 'Tuần',
          day: 'Ngày',
          agenda: 'Lịch trình',
          date: 'Ngày',
          time: 'Thời gian',
          event: 'Sự kiện',
          noEventsInRange: 'Không có lịch bảo vệ trong khoảng thời gian này.',
          showMore: (total) => `+${total} lịch khác`,
        }}
        views={['month', 'week', 'day', 'agenda']}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-700 dark:text-gray-300">ĐACN (Đồ án chuyên ngành)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-500"></div>
          <span className="text-gray-700 dark:text-gray-300">LVTN (Luận văn tốt nghiệp)</span>
        </div>
      </div>
    </div>
  )
}
