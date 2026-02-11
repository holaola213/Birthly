"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TimezonePicker } from "@/components/timezone-picker";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reminderDays, setReminderDays] = useState<number[]>([7, 1]);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [newDay, setNewDay] = useState("");

  useEffect(() => {
    fetch(`/api/groups/${groupId}/reminders`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reminderDays) setReminderDays(data.reminderDays);
        if (data.reminderTime) setReminderTime(data.reminderTime);
        if (data.timezone) setTimezone(data.timezone);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  function addDay() {
    const day = parseInt(newDay);
    if (isNaN(day) || day < 0 || day > 30) {
      toast.error("Enter a number between 0 and 30");
      return;
    }
    if (reminderDays.includes(day)) {
      toast.error("This reminder day already exists");
      return;
    }
    setReminderDays([...reminderDays, day].sort((a, b) => b - a));
    setNewDay("");
  }

  function removeDay(day: number) {
    if (reminderDays.length <= 1) {
      toast.error("You need at least one reminder day");
      return;
    }
    setReminderDays(reminderDays.filter((d) => d !== day));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/groups/${groupId}/reminders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderDays, reminderTime, timezone }),
    });

    if (res.ok) {
      toast.success("Settings saved!");
      router.refresh();
    } else {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-4 w-24" />
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link
        href={`/groups/${groupId}`}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to group
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset disabled={saving} className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                Reminder Days (days before birthday)
              </Label>
              <div className="flex flex-wrap gap-2">
                {reminderDays.map((day) => (
                  <Badge
                    key={day}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => removeDay(day)}
                  >
                    {day === 0
                      ? "Day of"
                      : `${day} day${day !== 1 ? "s" : ""}`}{" "}
                    before
                    <span className="ml-1 text-xs">&times;</span>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Days before"
                  type="number"
                  min={0}
                  max={30}
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-32"
                />
                <Button variant="outline" size="sm" onClick={addDay}>
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Reminder Time
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Timezone
              </Label>
              <TimezonePicker
                value={timezone}
                onChange={setTimezone}
                disabled={saving}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}
