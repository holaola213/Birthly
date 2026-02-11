"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Cake, Phone, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BirthdayPicker } from "@/components/birthday-picker";
import { PhoneInput } from "@/components/phone-input";
import { toast } from "sonner";

export function AddMemberForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!month || !day) {
      toast.error("Please select a birthday month and day");
      return;
    }
    if (phone.length !== 10) {
      toast.error("Please enter a complete 10-digit phone number");
      return;
    }
    setLoading(true);

    const birthday = `${month}-${day}`;

    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthday, phone: "+1" + phone }),
    });

    if (res.ok) {
      toast.success(`${name} added to the group!`);
      setName("");
      setMonth("");
      setDay("");
      setPhone("");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(
        typeof data.error === "string" ? data.error : "Failed to add member"
      );
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={loading} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Name
              </Label>
              <Input
                id="member-name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone
              </Label>
              <PhoneInput
                id="member-phone"
                value={phone}
                onChange={setPhone}
                required
              />
              <p className="text-xs text-muted-foreground">
                US phone number for SMS reminders
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
