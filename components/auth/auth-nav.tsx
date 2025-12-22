"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
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
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  if (!user) {
    return (
      <>
        <Link href="/signin">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button>Sign Up</Button>
        </Link>
      </>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Avatar className="h-8 w-8">
            {user.profilePicture ? (
              <AvatarImage
                src={user.profilePicture}
                alt={user.name || "Profile"}
              />
            ) : (
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="bottom" forceMount>
        <DropdownMenuLabel>
          {user.name}
          <br />
          <span className="text-muted-foreground text-sm">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role && user.role !== 'USER' && (
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
        <DropdownMenuItem onClick={() => { handleLinkClick(); logout(); }}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
