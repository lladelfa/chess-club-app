'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VolunteerPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const supabase = createClient()

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('volunteers')
      .insert([{ name, email, phone }])

    if (error) {
      console.error('Error inserting volunteer:', error.message)
    } else {
      // Clear form or show success message
      setName('')
      setEmail('')
      setPhone('')
      alert('Thank you for volunteering!')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Volunteer Registration</CardTitle>
          <CardDescription>
            Sign up to be a volunteer for the chess club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button onClick={handleSubmit} className="w-full">Sign Up to Volunteer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}