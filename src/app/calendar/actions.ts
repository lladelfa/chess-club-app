
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { revalidatePath } from "next/cache";

export type AttendanceStatus = "attending" | "not_attending" | "tbd";

export async function getAttendanceForChild(childId: number, eventId: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("child_attendance")
    .select("status")
    .eq("child_id", childId)
    .eq("event_id", eventId)
    .single();

  return data;
}

export async function getAttendanceForParent(userId: string, eventId: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("parent_attendance")
    .select("status")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .is("child_id", null)
    .single();

  return data;
}

export async function updateParentAttendance(
  eventId: number,
  status: AttendanceStatus
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const { error } = await supabase.from("parent_attendance").upsert(
    {
      user_id: user.id,
      event_id: eventId,
      status: status,
    },
    {
      onConflict: "user_id, event_id",
    }
  );

  if (error) {
    console.error("Error updating parent attendance:", error.message);
    throw new Error(`Error updating parent attendance: ${error.message}`);
  }
  revalidatePath("/calendar");
}

export async function getChildrenForParent() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const { data: children, error } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user.id);

  if (error) {
    console.error("Error fetching children:", error.message);
    throw new Error(`Error fetching children: ${error.message}`);
  }

  return children;
}

export async function updateAttendance(
  childId: number,
  eventId: number,
  status: AttendanceStatus
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  // Verify child belongs to the user
  const { data: child, error: childError } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single();

  if (childError || !child) {
    throw new Error(
      "Child not found or you do not have permission to update this child's attendance."
    );
  }

  const { error } = await supabase.from("child_attendance").upsert(
    {
      user_id: user.id,
      child_id: childId,
      event_id: eventId,
      status: status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id, event_id" }
  );

  if (error) {
    console.error("Error updating attendance:", error);
    throw new Error("Error updating child attendance");
  }

  revalidatePath("/calendar");
}
