"use client";

import Link from "next/link";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthButtons() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (isSignedIn && user) {
    const initials =
      user.fullName?.split(" ").map((n) => n[0]).join("")?.toUpperCase() ||
      user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
      "U";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl} alt={user.fullName ?? "User"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.fullName && <p className="font-medium">{user.fullName}</p>}
              {user.primaryEmailAddress && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.primaryEmailAddress.emailAddress}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/sign-up">
          <UserPlus className="mr-2 h-4 w-4" />
          Sign Up
        </Link>
      </Button>
    </div>
  );
}

// Simplified version for hero section
export function HeroAuthButtons() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="text-base px-8 py-3">
          <Link href="/dashboard">
            <User className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button asChild size="lg" className="text-base px-8 py-3">
        <Link href="/sign-up">
          <UserPlus className="mr-2 h-5 w-5" />
          Get Started
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="text-base px-8 py-3">
        <Link href="/sign-in">
          <LogIn className="mr-2 h-5 w-5" />
          Sign In
        </Link>
      </Button>
    </div>
  );
}
