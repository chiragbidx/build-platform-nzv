import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { teamMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const AUTH_COOKIE_NAME = "panda_auth_session";

const maxAgeSeconds = 60 * 60 * 24 * 7;
const authCookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: true,
  path: "/",
};

export type AuthSession = {
  userId: string;
  email: string;
  teamId: string | null;
};

// Fetch the user's teamId from team_members, prefer owner or first membership
async function fetchTeamIdForUser(userId: string): Promise<string | null> {
  const memberships = await db
    .select({ teamId: teamMembers.teamId, role: teamMembers.role })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));

  // Prefer owner, fallback to first
  const owner = memberships.find((m) => m.role === "owner");
  if (owner) return owner.teamId;

  const first = memberships[0];
  return first ? first.teamId : null;
}

export async function createAuthSession(userId: string, email: string) {
  const cookieStore = await cookies();
  // Look up user's teamId from DB for session
  const teamId = await fetchTeamIdForUser(userId);
  const payload: AuthSession = { userId, email, teamId };
  cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(payload), {
    ...authCookieOptions,
    maxAge: maxAgeSeconds,
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed.userId && parsed.email) {
      // If no teamId on session, fetch and patch in place (upgrade in background)
      if (!parsed.teamId) {
        const upgradedTeamId = await fetchTeamIdForUser(parsed.userId);
        parsed.teamId = upgradedTeamId ?? null;
        // upgrade session in background with new structure
        cookieStore.set(
          AUTH_COOKIE_NAME,
          JSON.stringify(parsed),
          {
            ...authCookieOptions,
            maxAge: maxAgeSeconds,
          }
        );
      }
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAuthSessionEmail(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.email ?? null;
}