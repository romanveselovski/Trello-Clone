export type ClerkUserProfile = {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

/** "Roman V." — first name + first letter of last name with a period */
export function formatShortName(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null
): string {
  const first = firstName?.trim() || "";
  const last = lastName?.trim() || "";

  if (first && last) {
    return `${first} ${last.charAt(0).toUpperCase()}.`;
  }
  if (first) return first;
  if (last) return `${last.charAt(0).toUpperCase()}.`;
  return (fallback || "").trim();
}

export type MemberProfile = {
  email: string;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  displayName: string;
};

export function buildMemberProfile(
  email: string,
  userId: string | null,
  clerk?: ClerkUserProfile | null
): MemberProfile {
  const firstName = clerk?.firstName ?? null;
  const lastName = clerk?.lastName ?? null;
  return {
    email,
    userId,
    firstName,
    lastName,
    imageUrl: clerk?.imageUrl ?? null,
    displayName: formatShortName(firstName, lastName, email.split("@")[0] || email),
  };
}
