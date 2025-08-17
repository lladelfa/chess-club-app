import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: parents, error: parentsError } = await supabase.from('parents').select('*, children(*)')
  const { data: volunteers, error: volunteersError } = await supabase.from('volunteers').select('*')

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Registered Students</h2>
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
                parent.children.map(child => (
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
              {volunteers?.map(volunteer => (
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