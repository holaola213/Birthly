import { redirect } from "next/navigation";
import Link from "next/link";
import { PartyPopper, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { formatBirthday, daysUntilBirthday, getDateAhead } from "@/lib/dates";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      members: { orderBy: { birthday: "asc" } },
      reminderConfig: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Find upcoming birthdays across all groups (next 14 days)
  const timezone = "America/New_York";
  const upcomingDates = Array.from({ length: 14 }, (_, i) =>
    getDateAhead(i, timezone)
  );

  const upcomingBirthdays = groups.flatMap((group) =>
    group.members
      .filter((m) => upcomingDates.includes(m.birthday))
      .map((m) => ({
        ...m,
        groupName: group.name,
        groupId: group.id,
        daysAway: upcomingDates.indexOf(m.birthday),
      }))
  );

  upcomingBirthdays.sort((a, b) => a.daysAway - b.daysAway);

  // Compute next birthday per group for richer cards
  const groupsWithNext = groups.map((group) => {
    const tz = group.reminderConfig?.timezone || timezone;
    let nextMember: { name: string; daysUntil: number } | null = null;

    for (const m of group.members) {
      const days = daysUntilBirthday(m.birthday, tz);
      if (!nextMember || days < nextMember.daysUntil) {
        nextMember = { name: m.name, daysUntil: days };
      }
    }

    return { ...group, nextMember };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your birthday reminder groups
        </p>
      </div>

      {upcomingBirthdays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-amber-500" />
              Upcoming Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBirthdays.map((b) => (
                <div
                  key={`${b.id}-${b.groupName}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(b.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{b.name}</span>
                      <span className="text-muted-foreground ml-2 text-sm">
                        {formatBirthday(b.birthday)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/groups/${b.groupId}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {b.groupName}
                      </Badge>
                    </Link>
                    <Badge
                      variant={b.daysAway === 0 ? "default" : "outline"}
                    >
                      {b.daysAway === 0
                        ? "Today!"
                        : b.daysAway === 1
                          ? "Tomorrow"
                          : `In ${b.daysAway} days`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create your first group to start tracking birthdays and sending reminders!"
          action={
            <Button asChild>
              <Link href="/groups/new">Create Group</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupsWithNext.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {group.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {group.members.length}{" "}
                    {group.members.length === 1 ? "member" : "members"}
                  </p>
                  {group.nextMember && (
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">Next: </span>
                      <span className="font-medium">{group.nextMember.name}</span>
                      <span className="text-muted-foreground">
                        {group.nextMember.daysUntil === 0
                          ? " — today!"
                          : group.nextMember.daysUntil === 1
                            ? " — tomorrow"
                            : ` in ${group.nextMember.daysUntil} days`}
                      </span>
                    </p>
                  )}
                  {group.members.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.members.slice(0, 5).map((m) => (
                        <Badge key={m.id} variant="outline" className="text-xs">
                          {m.name}
                        </Badge>
                      ))}
                      {group.members.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.members.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
