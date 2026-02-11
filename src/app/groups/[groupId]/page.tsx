import { notFound } from "next/navigation";
import { ArrowLeft, PartyPopper } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatBirthday, daysUntilBirthday } from "@/lib/dates";
import { MemberList } from "@/components/member-list";
import { AddMemberForm } from "@/components/add-member-form";
import { InviteSection } from "@/components/invite-section";
import { GroupActions } from "@/components/group-actions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { orderBy: { birthday: "asc" } },
      inviteLinks: { orderBy: { createdAt: "desc" }, take: 5 },
      reminderConfig: true,
    },
  });

  if (!group) notFound();

  const timezone = group.reminderConfig?.timezone || "America/New_York";
  const reminderDays = group.reminderConfig
    ? JSON.parse(group.reminderConfig.reminderDays)
    : [7, 1];

  // Compute days until birthday for each member
  const membersWithCountdown = group.members.map((m) => ({
    ...m,
    formattedBirthday: formatBirthday(m.birthday),
    daysUntil: daysUntilBirthday(m.birthday, timezone),
  }));

  // Find members with upcoming birthdays (within 7 days)
  const upcomingSoon = membersWithCountdown
    .filter((m) => m.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground mt-1">
            {group.members.length}{" "}
            {group.members.length === 1 ? "member" : "members"} &middot;
            Reminders: {reminderDays.map((d: number) => `${d}d`).join(", ")}{" "}
            before
          </p>
        </div>
        <GroupActions groupId={groupId} />
      </div>

      {upcomingSoon.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <PartyPopper className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-sm">Upcoming Birthdays</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {upcomingSoon.map((m) => (
              <Badge
                key={m.id}
                variant={m.daysUntil === 0 ? "default" : "secondary"}
              >
                {m.name}
                {m.daysUntil === 0
                  ? " — Today!"
                  : m.daysUntil === 1
                    ? " — Tomorrow"
                    : ` — in ${m.daysUntil} days`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MemberList
            members={membersWithCountdown}
            groupId={groupId}
          />
        </div>

        <div className="space-y-6">
          <AddMemberForm groupId={groupId} />
          <InviteSection
            groupId={groupId}
            inviteLinks={group.inviteLinks}
          />
        </div>
      </div>
    </div>
  );
}
