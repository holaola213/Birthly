"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface InviteLink {
  id: string;
  token: string;
  expiresAt: Date | string | null;
  maxUses: number | null;
  useCount: number;
}

export function InviteSection({
  groupId,
  inviteLinks,
}: {
  groupId: string;
  inviteLinks: InviteLink[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function generateInvite() {
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      toast.success("Invite link created!");
      router.refresh();
    } else {
      toast.error("Failed to generate invite link");
    }
    setLoading(false);
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied to clipboard!");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Invite Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={generateInvite}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          {loading ? "Generating..." : "Generate New Link"}
        </Button>

        {inviteLinks.length === 0 ? (
          <p className="text-muted-foreground text-xs text-center py-2">
            Share an invite link so friends can join and add their birthday
          </p>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {inviteLinks.map((link) => (
                <div key={link.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={`/join/${link.token}`}
                      className="text-xs"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="shrink-0 h-9 w-9"
                          onClick={() => copyLink(link.token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy link</TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Used {link.useCount} time{link.useCount !== 1 ? "s" : ""}
                    {link.maxUses ? ` / ${link.maxUses} max` : ""}
                    {link.expiresAt
                      ? ` · Expires ${new Date(link.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
