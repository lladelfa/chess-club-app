"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type ChildData = {
  name: string;
  dob: string;
};

export type RegistrationData = {
  parentName: string;
  phone: string;
  email: string;
  password: string;
  children: ChildData[];
};

export async function registerUserAndFamily(formData: RegistrationData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (signUpError) {
    console.error("Error signing up:", signUpError.message);
    return { data: null, error: signUpError };
  }

  if (!signUpData.user) {
    return { data: null, error: { name: 'AuthApiError', message: "Sign up did not return a user." } };
  }

  const user = signUpData.user;

  // 2. Upsert the parent profile
  const { data: parent, error: parentError } = await supabase
    .from("parents")
    .upsert({
      user_id: user.id,
      name: formData.parentName,
      phone: formData.phone,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('id')
    .single();

  if (parentError) {
    console.error("Error creating parent profile:", parentError.message);
    return { data: null, error: parentError };
  }

  // 3. Insert the children
  if (formData.children && formData.children.length > 0) {
    const childrenToInsert = formData.children.map((child) => ({
      parent_id: parent.id,
      name: child.name,
      dob: child.dob,
    }));

    const { error: childrenError } = await supabase.from("children").insert(childrenToInsert);

    if (childrenError) {
      console.error("Error inserting children:", childrenError.message);
      return { data: null, error: childrenError };
    }
  }

  return { data: { user: signUpData.user }, error: null };
}