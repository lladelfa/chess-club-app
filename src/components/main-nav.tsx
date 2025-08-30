import Link from "next/link"
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { logout } from "@/app/auth/actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export async function MainNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser()

  console.log(data.user);

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
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src={data.user.user_metadata.avatar_url || '/user-avatar.svg'} />
                    <AvatarFallback>{data.user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <form action={logout}>
                      <Button variant="ghost" className="w-full">Logout</Button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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