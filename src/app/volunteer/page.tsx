'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VolunteerPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubmit = async () => {
    if (!user) {
      // Redirect to login page if user is not logged in
      window.location.href = '/login'
      return
    }

    const { error } = await supabase
      .from('volunteers')
      .insert([{ user_id: user.id, name, email, phone }])

    if (error) {
      console.error('Error inserting volunteer:', error.message)
    } else {
      // Clear form or show success message
      setName('')
      setEmail('')
      setPhone('')
      setIsSubmitted(true)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Volunteer Registration</CardTitle>
          {isSubmitted ? (
            <CardDescription>
              Thank you for volunteering!
            </CardDescription>
          ) : (
            <CardDescription>
              Sign up to be a volunteer for the chess club.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}