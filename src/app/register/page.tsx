'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerUserAndFamily } from '@/app/auth/actions'

export default function RegisterPage() {
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [children, setChildren] = useState([{ name: '', grade: '' }])
  const [isRegistered, setIsRegistered] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isVolunteer, setIsVolunteer] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setHasMounted(true)
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setEmail(user.email ?? '')
      }
    }
    getUser()
  }, [supabase.auth])

  const handleAddChild = () => {
    setChildren([...children, { name: '', grade: '' }])
  }

  const handleChildChange = (
    index: number,
    field: 'name' | 'grade',
    value: string
  ) => {
    const newChildren = [...children]
    newChildren[index][field] = value
    setChildren(newChildren)
  }

  const handleSignUp = async () => {
    setErrorMessage('')

    const registrationData = {
      email,
      password,
      parentName,
      phone: parentPhone,
      children: children.map((child) => ({ name: child.name, grade: child.grade })),
      isVolunteer,
    }

    const { error } = await registerUserAndFamily(registrationData)
    if (error) {
      setErrorMessage(`Error registering: ${error.message}`)
    } else {
      setIsRegistered(true)
    }
  }

  if (!hasMounted) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          {isRegistered ? (
            <CardDescription>
              You and your children have been successfully registered for the Chess Club!
            </CardDescription>
          ) : (
            <CardDescription>
              Create an account and register your children for the chess club.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isRegistered ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Link href="/">
                <Button variant="outline">Go to Homepage</Button>
              </Link>
              <Link href="/calendar">
                <Button>Go to Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {!user && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="parent-name">Your Name</Label>
                    <Input id="parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="parent-phone">Phone Number</Label>
                    <Input id="parent-phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                  </div>
                </>
              )}
              {user && (
                <div className="grid gap-2">
                  <p>Registering as {user.email}</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox id="volunteer" checked={isVolunteer} onCheckedChange={(checked) => setIsVolunteer(checked === true)} />
                <Label htmlFor="volunteer">I would like to volunteer</Label>
              </div>

              {children.map((child, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`child-name-${index}`}>Child&apos;s Name</Label>
                    <Input id={`child-name-${index}`} value={child.name} onChange={(e) => handleChildChange(index, 'name', e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`child-grade-${index}`}>Child&apos;s Grade</Label>
                    <Select onValueChange={(value) => handleChildChange(index, 'grade', value)} value={child.grade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">K</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={handleAddChild}>+ Add another child</Button>

              {errorMessage && <p className="text-sm font-medium text-destructive">{errorMessage}</p>}

              <Button onClick={handleSignUp} className="w-full">Register</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}