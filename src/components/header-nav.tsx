"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

interface HeaderNavProps {
  user: {
    username: string;
    name: string;
  } | null;
}

export function HeaderNav({ user }: HeaderNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  if (!user) {
    return (
      <nav className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2">
      <ThemeToggle />
      <Button asChild size="sm">
        <Link href="/groups/new">
          <Plus className="mr-1 h-4 w-4" />
          New Group
        </Link>
      </Button>
      <Link
        href="/account"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        title="Account settings"
      >
        <Settings className="h-3.5 w-3.5" />
        <span>{user.name}</span>
      </Link>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout} title="Log out">
        <LogOut className="h-4 w-4" />
      </Button>
    </nav>
  );
}
