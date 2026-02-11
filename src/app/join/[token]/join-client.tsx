"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LogIn, UserPlus, User, Cake, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatBirthday } from "@/lib/dates";

interface JoinClientProps {
  token: string;
  user: {
    name: string;
    birthday: string;
    phone: string;
  } | null;
}

export function JoinClient({ token, user }: JoinClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [groupInfo, setGroupInfo] = useState<{
    groupName: string;
    memberCount: number;
  } | null>(null);
  const [joined, setJoined] = useState(false);
  const [joinedGroupId, setJoinedGroupId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Invalid invite link");
          return;
        }
        const data = await res.json();
        setGroupInfo(data);
      })
      .catch(() => setError("Failed to validate invite link"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleJoin() {
    setSubmitting(true);

    try {
      const res = await fetch(`/api/invite/${token}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setJoined(true);
        setJoinedGroupId(data.groupId);
        toast.success(`Welcome to ${data.groupName}!`);
      } else {
        const data = await res.json();
        toast.error(
          typeof data.error === "string" ? data.error : "Failed to join group"
        );
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive text-lg font-medium">{error}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              This invite link may have expired or been used too many times.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-2xl font-bold">You&apos;re in!</p>
            <p className="text-muted-foreground mt-2">
              You&apos;ve joined <strong>{groupInfo?.groupName}</strong>.
              You&apos;ll receive SMS reminders when someone&apos;s birthday is
              coming up!
            </p>
            {joinedGroupId && (
              <Button asChild className="mt-4">
                <Link href={`/groups/${joinedGroupId}`}>View Group</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in — show log in / sign up prompt
  if (!user) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Join {groupInfo?.groupName}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {groupInfo?.memberCount}{" "}
              {groupInfo?.memberCount === 1 ? "member" : "members"} already in
              this group
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You need an account to join this group. Your birthday and phone
              number from your account will be added automatically.
            </p>
            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href={`/login?redirect=/join/${token}`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/signup?redirect=/join/${token}`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in — show confirmation with user data
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Join {groupInfo?.groupName}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {groupInfo?.memberCount}{" "}
            {groupInfo?.memberCount === 1 ? "member" : "members"} already in
            this group
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your information from your account will be used:
          </p>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Cake className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Birthday:</span>
              <span className="font-medium">{formatBirthday(user.birthday)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{user.phone}</span>
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Joining..." : "Join Group"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
