'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function handlePasswordReset(email: string) {
  const supabase = createClient()
  const headersList = headers()
  const origin = headersList.get('origin')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/`,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
