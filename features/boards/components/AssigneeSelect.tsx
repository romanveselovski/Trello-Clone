"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberProfile } from "@/lib/assignee-display";
import { useOptionalMemberProfiles } from "../context/MemberProfilesContext";
import { TinyAvatar } from "./AssigneeBadge";
import { useMemo } from "react";

const UNASSIGNED = "__unassigned__";

interface AssigneeSelectProps {
  boardId: string;
  value: string;
  onChange?: (value: string) => void;
  name?: string;
  label?: string;
  required?: boolean;
  id?: string;
}

export function AssigneeSelect({
  boardId: _boardId,
  value,
  onChange,
  name = "assignee",
  label = "Assignee",
  required = false,
  id = "assignee",
}: AssigneeSelectProps) {
  const ctx = useOptionalMemberProfiles();
  const profilesByEmail = ctx?.profilesByEmail || {};
  const loading = ctx?.loading ?? false;
  const members = useMemo(
    () => Object.values(profilesByEmail),
    [profilesByEmail]
  );

  const selectValue = value?.trim() ? value : UNASSIGNED;

  const selected = useMemo(() => {
    if (!value?.trim()) return null;
    return (
      profilesByEmail[value.trim().toLowerCase()] ||
      ({
        email: value.trim(),
        userId: null,
        firstName: null,
        lastName: null,
        imageUrl: null,
        displayName: value.trim(),
      } satisfies MemberProfile)
    );
  }, [profilesByEmail, value]);

  const extraOption =
    value &&
    !profilesByEmail[value.toLowerCase()] &&
    value !== UNASSIGNED
      ? value
      : null;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Select
        value={selectValue}
        onValueChange={(v) => onChange?.(v === UNASSIGNED ? "" : v)}
        disabled={loading}
      >
        <SelectTrigger id={id} className="w-full cursor-pointer">
          {selectValue !== UNASSIGNED && selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <TinyAvatar src={selected.imageUrl} />
              <span className="truncate">{selected.displayName}</span>
            </span>
          ) : (
            <SelectValue
              placeholder={loading ? "Loading team..." : "Select assignee"}
            />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED} className="cursor-pointer">
            Unassigned
          </SelectItem>
          {extraOption && (
            <SelectItem value={extraOption} className="cursor-pointer">
              {extraOption} (current)
            </SelectItem>
          )}
          {members.map((m) => (
            <SelectItem key={m.email} value={m.email} className="cursor-pointer">
              <span className="flex items-center gap-2 min-w-0">
                <TinyAvatar src={m.imageUrl} />
                <span className="truncate">{m.displayName}</span>
                <span className="text-muted-foreground text-xs truncate">
                  ({m.email})
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value || ""} />
    </div>
  );
}
