import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { logout } from "@/app/auth/actions"

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2">
          <span className="text-xl font-bold">Chess Club</span>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/" className="px-4 py-2 hover:bg-gray-800 rounded-md">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/calendar" className="px-4 py-2 hover:bg-gray-800 rounded-md">Calendar</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/volunteer" className="px-4 py-2 hover:bg-gray-800 rounded-md">Volunteer</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              {data.user ? (
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={data.user.user_metadata.avatar_url} />
                    <AvatarFallback>{data.user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <form action={logout}>
                    <Button variant="ghost" className="px-4 py-2 hover:bg-gray-800 rounded-md">Logout</Button>
                  </form>
                </div>
              ) : (
                <NavigationMenuLink asChild>
                  <Link href="/login" className="px-4 py-2 hover:bg-gray-800 rounded-md">Login</Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <main className="flex-1">
        <section className="bg-gray-900 text-white py-20 px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to the Chess Club</h1>
          <p className="text-lg mb-8">Sharpen your mind, one move at a time.</p>
          <Link href="/register">
            <Button>Register Now</Button>
          </Link>
        </section>
        <section id="about" className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">About Us</h2>
            <p className="text-lg max-w-3xl mx-auto">
              Our chess club is dedicated to providing a fun and educational environment for students to learn and play chess. We welcome players of all skill levels, from beginners to seasoned tournament veterans.
            </p>
          </div>
        </section>
        <section id="get-started" className="bg-gray-100 dark:bg-gray-800 py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-4">Register Your Child</h3>
                <p className="mb-4">Ready to join the club? Register your child today to get started.</p>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-4">Become a Volunteer</h3>
                <p className="mb-4">We're always looking for volunteers to help out. Sign up to make a difference.</p>
                <Link href="/volunteer">
                  <Button>Volunteer</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 text-white py-6 px-6 text-center">
        <p>&copy; 2025 Chess Club. All rights reserved.</p>
      </footer>
    </div>
  )
}