"use client";

import { BoardMember } from "@/lib/supabase/models";
import {
  MemberProfile,
  buildMemberProfile,
  ClerkUserProfile,
} from "@/lib/assignee-display";
import { memberService } from "@/lib/services";
import { useSupabase } from "@/providers/SupabaseProvider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type MemberProfilesContextValue = {
  profilesByEmail: Record<string, MemberProfile>;
  loading: boolean;
  resolve: (assignee: string | null | undefined) => MemberProfile | null;
  refresh: () => Promise<void>;
};

const MemberProfilesContext = createContext<MemberProfilesContextValue | null>(
  null
);

async function fetchClerkProfiles(userIds: string[]) {
  if (userIds.length === 0) return {} as Record<string, ClerkUserProfile>;
  const res = await fetch("/api/member-profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) return {};
  const json = (await res.json()) as {
    profiles: Record<string, ClerkUserProfile>;
  };
  return json.profiles || {};
}

function membersToProfiles(
  members: BoardMember[],
  clerkByUserId: Record<string, ClerkUserProfile>
): Record<string, MemberProfile> {
  const map: Record<string, MemberProfile> = {};
  for (const m of members) {
    const clerk = m.user_id ? clerkByUserId[m.user_id] : null;
    const profile = buildMemberProfile(m.email, m.user_id, clerk);
    map[m.email.toLowerCase()] = profile;
  }
  return map;
}

export function MemberProfilesProvider({
  boardId,
  children,
}: {
  boardId: string;
  children: React.ReactNode;
}) {
  const { supabase } = useSupabase();
  const [profilesByEmail, setProfilesByEmail] = useState<
    Record<string, MemberProfile>
  >({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase || !boardId) return;
    try {
      setLoading(true);
      const members = await memberService.listMembers(supabase, boardId);
      const userIds = members
        .map((m) => m.user_id)
        .filter((id): id is string => Boolean(id));
      const clerk = await fetchClerkProfiles(userIds);
      setProfilesByEmail(membersToProfiles(members, clerk));
    } catch (err) {
      console.error("Failed to load member profiles", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, boardId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resolve = useCallback(
    (assignee: string | null | undefined): MemberProfile | null => {
      if (!assignee?.trim()) return null;
      const key = assignee.trim().toLowerCase();
      return (
        profilesByEmail[key] ||
        buildMemberProfile(assignee.trim(), null, null)
      );
    },
    [profilesByEmail]
  );

  const value = useMemo(
    () => ({ profilesByEmail, loading, resolve, refresh }),
    [profilesByEmail, loading, resolve, refresh]
  );

  return (
    <MemberProfilesContext.Provider value={value}>
      {children}
    </MemberProfilesContext.Provider>
  );
}

export function useMemberProfiles() {
  const ctx = useContext(MemberProfilesContext);
  if (!ctx) {
    throw new Error(
      "useMemberProfiles must be used within MemberProfilesProvider"
    );
  }
  return ctx;
}

/** Safe for components that may render outside the board provider */
export function useOptionalMemberProfiles() {
  return useContext(MemberProfilesContext);
}
