"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Cake, Phone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BirthdayPicker } from "@/components/birthday-picker";
import { PhoneInput } from "@/components/phone-input";
import { toast } from "sonner";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUsername(data.username);
        setName(data.name);
        // Split "MM-DD" into month and day
        if (data.birthday) {
          const [m, d] = data.birthday.split("-");
          setMonth(m);
          setDay(d);
        }
        // Convert E.164 "+15551234567" to raw "5551234567"
        if (data.phone) {
          setPhone(data.phone.replace(/^\+1/, ""));
        }
      } catch {
        toast.error("Failed to load account data");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!month || !day) {
      toast.error("Please select your birthday month and day");
      return;
    }

    if (phone.length !== 10) {
      toast.error("Please enter a complete 10-digit phone number");
      return;
    }

    setSaving(true);

    const birthday = `${month}-${day}`;

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          birthday,
          phone: "+1" + phone,
        }),
      });

      if (res.ok) {
        toast.success("Account updated!");
        router.refresh();
      } else {
        const data = await res.json();
        if (typeof data.error === "object") {
          setErrors(data.error);
        } else {
          toast.error(data.error || "Failed to update account");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }

    setSaving(false);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex min-h-[50vh] items-start justify-center py-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Account Settings</CardTitle>
            <CardDescription>
              Update your profile information.
              {username && (
                <span className="block mt-1 text-xs">
                  Logged in as <span className="font-medium">{username}</span>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <fieldset disabled={saving} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="How friends will see you"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name)
                          setErrors((prev) => ({ ...prev, name: [] }));
                      }}
                      required
                    />
                    {errors.name?.map((err) => (
                      <p key={err} className="text-xs text-destructive">
                        {err}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Cake className="h-3.5 w-3.5 text-muted-foreground" />
                      Birthday
                    </Label>
                    <BirthdayPicker
                      month={month}
                      day={day}
                      onMonthChange={setMonth}
                      onDayChange={setDay}
                      disabled={saving}
                    />
                    {errors.birthday?.map((err) => (
                      <p key={err} className="text-xs text-destructive">
                        {err}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <PhoneInput
                      id="phone"
                      value={phone}
                      onChange={(val) => {
                        setPhone(val);
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: [] }));
                      }}
                      required
                      error={!!errors.phone?.length}
                    />
                    {errors.phone ? (
                      errors.phone.map((err) => (
                        <p key={err} className="text-xs text-destructive">
                          {err}
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        US phone number for SMS reminders.
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </fieldset>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
