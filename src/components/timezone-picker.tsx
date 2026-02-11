"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Get all IANA timezones and group by region
function getTimezones(): Record<string, string[]> {
  let allZones: string[];
  try {
    allZones = Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older environments
    allZones = [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Anchorage",
      "Pacific/Honolulu",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Kolkata",
      "Australia/Sydney",
      "UTC",
    ];
  }

  const grouped: Record<string, string[]> = {};
  for (const tz of allZones) {
    const region = tz.includes("/") ? tz.split("/")[0] : "Other";
    if (!grouped[region]) grouped[region] = [];
    grouped[region].push(tz);
  }
  return grouped;
}

const TIMEZONE_GROUPS = getTimezones();

interface TimezonePickerProps {
  value: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
}

export function TimezonePicker({
  value,
  onChange,
  disabled,
}: TimezonePickerProps) {
  const [open, setOpen] = useState(false);

  // Format display: "America/New_York" → "New York (America)"
  function formatDisplay(tz: string): string {
    if (!tz) return "Select timezone...";
    const parts = tz.split("/");
    if (parts.length < 2) return tz;
    const city = parts.slice(1).join("/").replace(/_/g, " ");
    return `${city} (${parts[0]})`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            {formatDisplay(value)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search timezones..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No timezone found.</CommandEmpty>
            {Object.entries(TIMEZONE_GROUPS).map(([region, zones]) => (
              <CommandGroup key={region} heading={region}>
                {zones.map((tz) => (
                  <CommandItem
                    key={tz}
                    value={tz}
                    onSelect={() => {
                      onChange(tz);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === tz ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tz.split("/").slice(1).join("/").replace(/_/g, " ") || tz}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
