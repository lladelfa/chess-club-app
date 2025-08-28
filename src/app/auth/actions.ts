'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

interface ChildData {
  name: string
  grade: string
}

export type RegistrationData = {
  parentName: string
  phone: string
  email: string
  password: string
  isVolunteer: boolean
  children: ChildData[]
}

export async function registerUserAndFamily(formData: RegistrationData) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  let user = session?.user

  // If no user is in session, sign them up.
  if (!user) {
    // Password is required for new users
    if (!formData.password) {
      return { data: null, error: { name: 'AuthApiError', message: 'Password is required for new user registration.' } }
    }
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (signUpError) {
      console.error('Error signing up:', signUpError.message)
      return { data: null, error: signUpError }
    }
    if (!signUpData.user) {
      return { data: null, error: { name: 'AuthApiError', message: 'Could not sign up user. Please check your email for a confirmation link.' } }
    }
    user = signUpData.user
  }

  // Upsert parent information
  const { data: parentData, error: parentError } = await supabase
    .from('parents')
    .upsert(
      {
        user_id: user.id,
        name: formData.parentName,
        email: user.email,
        phone: formData.phone,
        volunteer: formData.isVolunteer,
      },
      { onConflict: 'user_id' }
    )
    .select('id')
    .single()

  if (parentError || !parentData) {
    const message = parentError?.message || 'No parent data returned.'
    console.error('Error saving parent details:', message)
    return { data: null, error: parentError || { name: 'CustomError', message } }
  }

  // Insert children information
  if (formData.children.length > 0) {
    const childrenToInsert = formData.children
      .filter((child) => child.name.trim() !== '')
      .map((child) => ({
        parent_id: parentData.id,
        name: child.name.trim(),
        grade: parseInt(child.grade, 10) || null,
      }))

    if (childrenToInsert.length > 0) {
      const { error: childrenError } = await supabase.from('children').insert(childrenToInsert)

      if (childrenError) {
        console.error('Error registering children:', childrenError.message)
        return { data: null, error: childrenError }
      }
    }
  }

  return { data: { user }, error: null }
}