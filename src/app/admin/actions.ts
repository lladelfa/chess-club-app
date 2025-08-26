'use server'

import { AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Action to get all users. Only admins can call this.
export async function getUsers() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user: adminUser } } = await supabase.auth.getUser()

  if (!adminUser || adminUser.app_metadata?.role !== 'admin') {
    const error = new AuthError('You do not have permission to perform this action.', 403)
    error.name = 'NotAuthorizedError'
    return { users: [], error }
  }

  const supabaseAdmin = createAdminClient()
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    return { users: [], error }
  }

  return { users, error: null }
}

// Action to update a user's role. Only admins can call this.
export async function updateUserRole(userId: string, role: string | null) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    const error = new AuthError('You do not have permission to perform this action.', 403)
    error.name = 'NotAuthorizedError'
    return { error }
  }

  if (user.id === userId && role !== 'admin') {
    const error = new AuthError('Admins cannot revoke their own role.', 400)
    error.name = 'OperationNotAllowedError'
    return { error }
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  })

  if (error) {
    return { error }
  }

  revalidatePath('/admin')
  return { error: null }
}