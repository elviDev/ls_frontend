"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function DashboardHeader() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const pathname = usePathname();

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-background border-b border-border px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Dashboard Menu</h2>
                <nav className="space-y-2">
                  <SheetClose asChild>
                    <Link href="/dashboard" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname === "/dashboard" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Dashboard
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/broadcasts" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/broadcasts") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Broadcasts
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/assets" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/assets") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Assets
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/archives" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/archives") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Archives
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/podcasts" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/podcasts") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Podcasts
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/audiobooks" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/audiobooks") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Audiobooks
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/programs" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/programs") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Programs
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/schedules" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/schedules") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Schedules
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/events" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/events") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Events
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/users" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/users") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Users
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/staff" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/staff") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Staff
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/settings" className={cn(
                      "block px-3 py-2 rounded-md transition-colors",
                      pathname?.startsWith("/dashboard/settings") 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      Settings
                    </Link>
                  </SheetClose>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NotificationBell basePath="/dashboard" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getUserInitials(user?.name || null)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.userType === 'staff' ? user?.role?.toLowerCase() : 'user'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}