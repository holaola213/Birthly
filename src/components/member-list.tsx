"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowUpDown, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MemberSearch } from "@/components/member-search";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

interface MemberWithFormatted {
  id: string;
  name: string;
  birthday: string;
  birthdayYear: number | null;
  formattedBirthday: string;
  phone: string;
  isCreator: boolean;
  daysUntil: number;
}

type SortKey = "name" | "birthday" | "daysUntil";
type SortDir = "asc" | "desc";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function CountdownBadge({ days }: { days: number }) {
  if (days === 0) {
    return (
      <Badge className="bg-green-600 hover:bg-green-600 text-white">
        <PartyPopper className="mr-1 h-3 w-3" />
        Today!
      </Badge>
    );
  }
  if (days === 1) {
    return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Tomorrow</Badge>;
  }
  if (days <= 7) {
    return <Badge variant="secondary">In {days} days</Badge>;
  }
  return <Badge variant="outline">In {days} days</Badge>;
}

export function MemberList({
  members,
  groupId,
}: {
  members: MemberWithFormatted[];
  groupId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("daysUntil");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [removing, setRemoving] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filteredMembers = useMemo(() => {
    let result = members;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "birthday":
          cmp = a.birthday.localeCompare(b.birthday);
          break;
        case "daysUntil":
          cmp = a.daysUntil - b.daysUntil;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [members, search, sortKey, sortDir]);

  async function handleRemove(memberId: string, memberName: string) {
    if (!confirm(`Remove ${memberName} from this group?`)) return;

    setRemoving(memberId);
    const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success(`${memberName} removed from group`);
      router.refresh();
    } else {
      toast.error("Failed to remove member");
    }
    setRemoving(null);
  }

  const SortButton = ({
    label,
    sortKeyValue,
  }: {
    label: string;
    sortKeyValue: SortKey;
  }) => (
    <button
      onClick={() => toggleSort(sortKeyValue)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`h-3 w-3 ${sortKey === sortKeyValue ? "text-foreground" : "text-muted-foreground/50"}`}
      />
    </button>
  );

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>
          Members
          {members.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({members.length})
            </span>
          )}
        </CardTitle>
        {members.length > 0 && (
          <MemberSearch value={search} onChange={setSearch} />
        )}
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="No members yet"
            description="Add someone or share an invite link to get started!"
          />
        ) : filteredMembers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No members match &quot;{search}&quot;
          </p>
        ) : (
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton label="Name" sortKeyValue="name" />
                  </TableHead>
                  <TableHead>
                    <SortButton label="Birthday" sortKeyValue="birthday" />
                  </TableHead>
                  <TableHead>
                    <SortButton label="Next Birthday" sortKeyValue="daysUntil" />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{member.name}</span>
                          {member.isCreator && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              Creator
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>{member.formattedBirthday}</span>
                      {member.birthdayYear && (
                        <span className="text-muted-foreground text-xs ml-1.5">
                          (turning{" "}
                          {new Date().getFullYear() -
                            member.birthdayYear +
                            (member.daysUntil === 0 ? 0 : 1)}
                          )
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <CountdownBadge days={member.daysUntil} />
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleRemove(member.id, member.name)
                            }
                            disabled={removing === member.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove member</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
