import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Link2, PartyPopper } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function WelcomePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-8">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div>
          <PartyPopper className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Your account is all set. Here&apos;s how to get started:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/groups/new">
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Create a Group
                </CardTitle>
                <CardDescription>
                  Start a new birthday group for friends, family, or coworkers.
                  You&apos;ll be added automatically.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-lg">
                <Link2 className="h-5 w-5 text-primary" />
                Join via Invite
              </CardTitle>
              <CardDescription>
                Got an invite link from a friend? Open it and you&apos;ll be
                added to their group with one click.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard" className="text-muted-foreground">
              or go to your dashboard →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
