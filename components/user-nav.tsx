"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserNav() {
  // In a real app, you would check if the user is authenticated
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Sign up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/avatars/01.png" alt="@user" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  );
}