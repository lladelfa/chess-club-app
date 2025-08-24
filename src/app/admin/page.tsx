import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: parents, error: parentsError } = await supabase.from('parents').select('*, children(*)')

  if (parentsError) {
    console.error("Error fetching parents:", parentsError.message);
    // Handle error appropriately, e.g., display an error message or redirect
  }

  const volunteers = parents?.filter((parent: Parent) => parent.volunteer) || [];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
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
              {parents?.map(parent => (
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