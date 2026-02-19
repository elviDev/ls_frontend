"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export function AuthNav() {
  const { user, isStaff, isAdmin } = useAuthStore();
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    handleLinkClick();
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <>
        <Link href="/signin">
          <Button variant="ghost">Acceder</Button>
        </Link>
        <Link href="/register">
          <Button>Registrarse</Button>
        </Link>
      </>
    );
  }

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  const avatarFallback = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Avatar className="h-8 w-8">
            {user.profileImage ? (
              <AvatarImage
                src={user.profileImage}
                alt={displayName}
              />
            ) : (
              <AvatarFallback>
                {avatarFallback}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="bottom" forceMount>
        <DropdownMenuLabel>
          {displayName}
          <br />
          <span className="text-muted-foreground text-sm">{user.email}</span>
          {user.userType === 'staff' && user.role && (
            <>
              <br />
              <span className="text-xs text-blue-600 font-medium">{user.role}</span>
            </>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(isStaff() || isAdmin()) && (
          <DropdownMenuItem onClick={handleLinkClick}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <Link href="/dashboard" className="w-full">
              Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleLinkClick}>
          <User className="mr-2 h-4 w-4" />
          <Link href="/profile" className="w-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkClick}>
          <Settings className="mr-2 h-4 w-4" />
          <Link href="/settings" className="w-full">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
