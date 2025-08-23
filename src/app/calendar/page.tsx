import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceSelector } from "@/components/attendance-selector";
import { EventCalendar } from "@/components/event-calendar";
import type { AttendanceStatus } from "./actions";
import { getChildrenForParent } from "./actions";

export default async function CalendarPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login?message=You must be logged in to view the calendar");
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  const children = await getChildrenForParent();

  const { data: attendanceData } = await supabase
    .from("child_attendance")
    .select("event_id, child_id, user_id, status")
    .eq("user_id", user.id);

  if (!events || events.length === 0) {
    return <div className="container mx-auto py-10">No events scheduled.</div>;
  }

  const attendanceMap = new Map<string, AttendanceStatus>();
  if (attendanceData) {
    for (const record of attendanceData) {
      const key = record.child_id
        ? `${record.event_id}-${record.child_id}`
        : `${record.event_id}-${record.user_id}`;
      attendanceMap.set(key, record.status as AttendanceStatus);
    }
  }

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.name,
    start: new Date(event.event_date),
    end: new Date(event.event_date),
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>
                  {new Date(event.event_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{event.description}</p>
                <div className="space-y-4">
                  <h4 className="font-semibold">Set Attendance:</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Me</span>
                    <AttendanceSelector
                      userId={user.id}
                      eventId={event.id}
                      currentStatus={
                        attendanceMap.get(`${event.id}-${user.id}`) ?? "tbd"
                      }
                    />
                  </div>
                  {children &&
                    children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium">{child.name}</span>
                        <AttendanceSelector
                          childId={child.id}
                          eventId={event.id}
                          currentStatus={
                            attendanceMap.get(`${event.id}-${child.id}`) ??
                            "tbd"
                          }
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="md:col-span-2">
          <EventCalendar events={calendarEvents} />
        </div>
      </div>
    </div>
  );
}