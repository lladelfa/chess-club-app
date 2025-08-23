"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { updateAttendance, updateParentAttendance, type AttendanceStatus } from "@/app/calendar/actions";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface AttendanceSelectorProps {
  childId?: number;
  userId?: string;
  eventId: number;
  currentStatus: AttendanceStatus;
}

export function AttendanceSelector({
  childId,
  userId,
  eventId,
  currentStatus,
}: AttendanceSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (value: string) => {
    startTransition(async () => {
      if (childId) {
        await updateAttendance(childId, eventId, value as AttendanceStatus);
      } else if (userId) {
        await updateParentAttendance(eventId, value as AttendanceStatus);
      }
    });
  };

  const idSuffix = childId ? `${childId}-${eventId}` : `${userId}-${eventId}`;

  return (
    <RadioGroup
      defaultValue={currentStatus}
      onValueChange={handleValueChange}
      className={cn("flex items-center gap-4", isPending && "opacity-50")}
      disabled={isPending}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="attending" id={`attending-${idSuffix}`} />
        <Label htmlFor={`attending-${idSuffix}`}>Attending</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="not_attending" id={`not-attending-${idSuffix}`} />
        <Label htmlFor={`not-attending-${idSuffix}`}>Not Attending</Label>
      </div>
    </RadioGroup>
  );
}