'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [children, setChildren] = useState([{ name: '', grade: '' }])
  const supabase = createClient()

  const handleAddChild = () => {
    setChildren([...children, { name: '', grade: '' }])
  }

  const handleChildChange = (index, field, value) => {
    const newChildren = [...children]
    newChildren[index][field] = value
    setChildren(newChildren)
  }

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Error signing up:', error.message)
      return
    }

    if (data.user) {
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .insert([{ user_id: data.user.id, name: parentName, email, phone: parentPhone }])
        .select()

      if (parentError) {
        console.error('Error inserting parent:', parentError.message)
        return
      }

      if (parentData) {
        const parentId = parentData[0].id
        const childrenToInsert = children.map(child => ({
          parent_id: parentId,
          name: child.name,
          grade: parseInt(child.grade)
        }))

        const { error: childrenError } = await supabase
          .from('children')
          .insert(childrenToInsert)

        if (childrenError) {
          console.error('Error inserting children:', childrenError.message)
        }
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Create an account and register your children for the chess club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="parent-name">Your Name</Label>
              <Input id="parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent-phone">Phone Number</Label>
              <Input id="parent-phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>

            {children.map((child, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`child-name-${index}`}>Child's Name</Label>
                  <Input id={`child-name-${index}`} value={child.name} onChange={(e) => handleChildChange(index, 'name', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`child-grade-${index}`}>Child's Grade</Label>
                  <Input id={`child-grade-${index}`} type="number" value={child.grade} onChange={(e) => handleChildChange(index, 'grade', e.target.value)} />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddChild}>+ Add another child</Button>

            <Button onClick={handleSignUp} className="w-full">Register</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}