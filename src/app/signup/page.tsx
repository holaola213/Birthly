"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Cake, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BirthdayPicker } from "@/components/birthday-picker";
import { PhoneInput } from "@/components/phone-input";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: ["Passwords do not match"] });
      return;
    }

    if (!month || !day) {
      toast.error("Please select your birthday month and day");
      return;
    }

    if (phone.length !== 10) {
      toast.error("Please enter a complete 10-digit phone number");
      return;
    }

    setLoading(true);

    const birthday = `${month}-${day}`;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name, birthday, phone: "+1" + phone }),
      });

      if (res.ok) {
        toast.success("Account created!");
        router.push(redirect || "/welcome");
        router.refresh();
      } else {
        const data = await res.json();
        if (typeof data.error === "object") {
          setErrors(data.error);
        } else {
          toast.error(data.error || "Failed to create account");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl font-bold"
        >
          <Cake className="h-5 w-5" />
          BDay Reminder
        </Link>
      </div>

      <div className="flex min-h-[60vh] items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <UserPlus className="h-5 w-5" />
              Create Account
            </CardTitle>
            <CardDescription>
              Sign up to track birthdays and get reminders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <fieldset disabled={loading} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: [] }));
                    }}
                    required
                    autoFocus
                  />
                  {errors.username?.map((err) => (
                    <p key={err} className="text-xs text-destructive">{err}</p>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {errors.password?.map((err) => (
                    <p key={err} className="text-xs text-destructive">{err}</p>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: [] }));
                    }}
                    required
                  />
                  {errors.confirmPassword?.map((err) => (
                    <p key={err} className="text-xs text-destructive">{err}</p>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="How friends will see you"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {errors.name?.map((err) => (
                    <p key={err} className="text-xs text-destructive">{err}</p>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Cake className="h-3.5 w-3.5 text-muted-foreground" />
                    Your Birthday
                  </Label>
                  <BirthdayPicker
                    month={month}
                    day={day}
                    onMonthChange={setMonth}
                    onDayChange={setDay}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <PhoneInput
                    id="phone"
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: [] }));
                    }}
                    required
                    error={!!errors.phone?.length}
                  />
                  {errors.phone ? (
                    errors.phone.map((err) => (
                      <p key={err} className="text-xs text-destructive">{err}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Where you&apos;ll receive birthday reminders via SMS.
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
