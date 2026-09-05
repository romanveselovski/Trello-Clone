import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export type MemberProfilePayload = {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { userIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const unique = [
    ...new Set(
      (body.userIds || []).filter((id) => typeof id === "string" && id)
    ),
  ].slice(0, 50);

  if (unique.length === 0) {
    return NextResponse.json({
      profiles: {} as Record<string, MemberProfilePayload>,
    });
  }

  const client = await clerkClient();
  const profiles: Record<string, MemberProfilePayload> = {};

  await Promise.all(
    unique.map(async (id) => {
      try {
        const user = await client.users.getUser(id);
        profiles[id] = {
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.hasImage && user.imageUrl ? user.imageUrl : null,
        };
      } catch {
        // user may have been deleted
      }
    })
  );

  return NextResponse.json({ profiles });
}
