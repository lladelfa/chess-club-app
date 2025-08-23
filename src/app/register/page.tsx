'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [children, setChildren] = useState([{ name: '', grade: '' }])
  const [isRegistered, setIsRegistered] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
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

    const processRegistration = async (userId: string) => {
      // Step 1: Upsert parent information.
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .upsert(
          { user_id: userId, name: parentName, email: email, phone: parentPhone, volunteer: isVolunteer },
          { onConflict: 'user_id' }
        )
        .select('id')
        .single()

      if (parentError || !parentData) {
        setErrorMessage(`Error saving your details: ${parentError?.message || 'No parent data returned.'}`)
        return
      }

      const actualParentId = parentData.id

      const childNamesToRegister = children
        .map((child) => child.name.trim())
        .filter((name) => name !== '')

      if (childNamesToRegister.length === 0) {
        setIsRegistered(true)
        return
      }

      // Step 2: Check for already registered children for this parent.
      const { data: existingChildren, error: fetchError } = await supabase
        .from('children')
        .select('name')
        .eq('parent_id', actualParentId)
        .in('name', childNamesToRegister)

      if (fetchError) {
        setErrorMessage(`Error checking for existing children: ${fetchError.message}`)
        return
      }

      if (existingChildren && existingChildren.length > 0) {
        const duplicateNames = existingChildren.map((c) => c.name).join(', ')
        setErrorMessage(
          `The following children are already registered: ${duplicateNames}. Please remove them or use a different name.`
        )
        return
      }

      // Step 3: Insert new children.
      const childrenToInsert = children
        .filter((child) => child.name.trim() !== '')
        .map((child) => {
          const grade = parseInt(child.grade, 10)
          return {
            parent_id: actualParentId,
            name: child.name.trim(),
            grade: !isNaN(grade) ? grade : null,
          }
        })

      if (childrenToInsert.length > 0) {
        const { error: childrenError } = await supabase.from('children').insert(childrenToInsert)

        if (childrenError) {
          if (childrenError.message.includes('duplicate key value violates unique constraint')) {
            setErrorMessage(
              'You have entered a child name that is already registered under your account. Please ensure each child has a unique name.'
            )
          } else {
            setErrorMessage(`Error registering children: ${childrenError.message}`)
          }
          return
        }
      }

      setIsRegistered(true)
    }

    if (user) {
      await processRegistration(user.id)
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setErrorMessage(`Error signing up: ${error.message}`)
        return
      }

      if (data.user) {
        await processRegistration(data.user.id)
      } else {
        setErrorMessage(
          'Sign up successful, but no user data returned. Please check your email to confirm your account.'
        )
      }
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
              <Button onClick={() => setIsRegistered(false)}>Register Another Student</Button>
              <Link href="/">
                <Button variant="outline">Go to Homepage</Button>
              </Link>
              <Link href="/calendar">
                <Button>Go to Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="parent-name">Your Name</Label>
                <Input id="parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user} />
              </div>
              {!user && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="parent-phone">Phone Number</Label>
                <Input id="parent-phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
              </div>

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
                    <Input id={`child-grade-${index}`} type="number" value={child.grade} onChange={(e) => handleChildChange(index, 'grade', e.target.value)} />
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
