'use client'

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const chessClubDates = [
    new Date(2025, 8, 5),
    new Date(2025, 8, 12),
    new Date(2025, 8, 19),
    new Date(2025, 8, 26),
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Chess Club Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Meeting Dates</h2>
          <ul className="space-y-2">
            {chessClubDates.map((d, i) => (
              <li key={i} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                {d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <Calendar
            mode="multiple"
            selected={chessClubDates}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
      </div>
    </div>
  )
}