import Link from "next/link"
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { logout } from "@/app/auth/actions"

export async function MainNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser()

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
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
              <>
                <NavigationMenuLink asChild>
                  <Link href="/login" className="px-4 py-2 hover:bg-gray-800 rounded-md">Login</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="/register" className="px-4 py-2 hover:bg-gray-800 rounded-md">Register</Link>
                </NavigationMenuLink>
              </>
            )}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}