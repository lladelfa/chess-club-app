'use client'

import { Button } from '@/components/ui/button'
import { updateUserRole } from './actions'
import { useTransition } from 'react'
import type { User } from '@supabase/supabase-js'

type AppUser = User & {
  app_metadata: {
    role?: string
    [key: string]: any // Changed back to 'any' to match Supabase types and avoid casting issues.
  }
}

export function UserManagement({ users, currentUserId }: { users: AppUser[], currentUserId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, newRole: string | null) => {
    startTransition(async () => {
      const { error } = await updateUserRole(userId, newRole)
      if (error) {
        // You can use a toast library like sonner to show this error
        alert(`Error: ${error.message}`)
        console.error(error.message)
      }
    })
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.app_metadata.role || 'user'}</td>
                <td className="py-2 px-4 border-b">
                  {user.app_metadata.role === 'admin' ? (
                    <Button
                      variant="outline"
                      onClick={() => handleRoleChange(user.id, null)}
                      disabled={isPending || user.id === currentUserId}
                      title={user.id === currentUserId ? "You cannot revoke your own admin role" : "Revoke admin role"}
                    >
                      Revoke Admin
                    </Button>
                  ) : (
                    <Button onClick={() => handleRoleChange(user.id, 'admin')} disabled={isPending}>Make Admin</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}