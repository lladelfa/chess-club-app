"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AttendanceStatus = "attending" | "not_attending" | "tbd";

export async function getAttendanceForChild(childId: string, eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("child_attendance")
    .select("status")
    .eq("child_id", childId)
    .eq("event_id", eventId)
    .single();

  return data;
}

export async function getAttendanceForParent(userId: string, eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("parent_attendance")
    .select("status")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .single();

  return data;
}

export async function updateParentAttendance(
  eventId: string,
  status: AttendanceStatus
) {
  const supabase = await createClient();

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
      updated_at: new Date().toISOString(),
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const { data: parent, error: parentError } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (parentError) {
    // A "not found" error (PGRST116) is expected if the user has no parent profile.
    // In that case, we return an empty array of children.
    if (parentError.code === 'PGRST116') {
      return [];
    }
    // For any other unexpected database error, we should throw it.
    throw parentError;
  }

  const { data: children, error } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", parent.id);

  if (error) {
    console.error("Error fetching children:", error.message);
    throw new Error(`Error fetching children: ${error.message}`);
  }

  return children || [];
}

export async function updateAttendance(
  childId: string,
  eventId: string,
  status: AttendanceStatus
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  // Get parent id to verify child ownership
  const { data: parent, error: parentError } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (parentError || !parent) {
    throw new Error("Parent profile not found for the current user.");
  }

  // Verify child belongs to the user
  const { data: child, error: childError } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("parent_id", parent.id)
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
    console.error("Error updating child attendance:", error.message);
    throw new Error(`Error updating child attendance: ${error.message}`);
  }

  revalidatePath("/calendar");
}