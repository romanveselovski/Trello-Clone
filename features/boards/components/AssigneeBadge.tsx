"use client";

import { MemberProfile } from "@/lib/assignee-display";
import { User } from "lucide-react";

function TinyAvatar({ src, alt }: { src?: string | null; alt?: string }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      className="h-4 w-4 rounded-full object-cover shrink-0 ring-1 ring-black/5"
      width={16}
      height={16}
    />
  );
}

export function AssigneeBadge({
  profile,
  className = "",
  showUserIconWhenNoPhoto = false,
}: {
  profile: MemberProfile | null;
  className?: string;
  showUserIconWhenNoPhoto?: boolean;
}) {
  if (!profile) return null;

  return (
    <div
      className={`flex items-center space-x-1 text-xs text-gray-500 min-w-0 ${className}`}
    >
      {profile.imageUrl ? (
        <TinyAvatar src={profile.imageUrl} />
      ) : showUserIconWhenNoPhoto ? (
        <User className="size-3.5 shrink-0" />
      ) : null}
      <span className="truncate">{profile.displayName}</span>
    </div>
  );
}

export { TinyAvatar };
