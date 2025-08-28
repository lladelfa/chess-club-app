import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUsers } from './actions'
import { UserManagement } from './user-management'
import type { User } from '@supabase/supabase-js'

// This type should ideally be in a shared file, like `src/lib/types.ts`,
// and imported in both this page and the UserManagement component.
type AppUser = User & {
  app_metadata: { role?: string; [key: string]: any }
}

interface Child {
  id: number;
  name: string;
  grade: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  volunteer: boolean;
  children: Child[];
}

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // Secure this page to only allow admin users
  if (user.app_metadata?.role !== 'admin') {
    redirect('/')
  }

  const [
    { data: parents, error: parentsError },
    { users, error: usersError }
  ] = await Promise.all([
    supabase.from('parents').select('*, children(*)'),
    getUsers()
  ])

  if (parentsError) {
    console.error("Error fetching parents:", parentsError.message);
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <p className="text-red-500">Error fetching data: {parentsError.message}</p>
      </div>
    )
  }

  const volunteers = parents?.filter((parent: Parent) => parent.volunteer) || [];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {users && <UserManagement users={users as AppUser[]} currentUserId={user.id} />}
      {usersError && <p className="text-red-500">Error fetching users: {usersError.message}</p>}
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Registered Students</h2>
          <Link href="/register">
            <Button>Register a New Student</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Parent Name</th>
                <th className="py-2 px-4 border-b">Parent Email</th>
                <th className="py-2 px-4 border-b">Child Name</th>
                <th className="py-2 px-4 border-b">Child Grade</th>
              </tr>
            </thead>
            <tbody>
              {parents?.map((parent: Parent) => (
                parent.children.map((child: Child) => (
                  <tr key={child.id}>
                    <td className="py-2 px-4 border-b">{parent.name}</td>
                    <td className="py-2 px-4 border-b">{parent.email}</td>
                    <td className="py-2 px-4 border-b">{child.name}</td>
                    <td className="py-2 px-4 border-b">{child.grade}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Volunteers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Phone</th>
              </tr>
            </thead>
            <tbody>
              {volunteers?.map((volunteer: Parent) => (
                <tr key={volunteer.id}>
                  <td className="py-2 px-4 border-b">{volunteer.name}</td>
                  <td className="py-2 px-4 border-b">{volunteer.email}</td>
                  <td className="py-2 px-4 border-b">{volunteer.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}