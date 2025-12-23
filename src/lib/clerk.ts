import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export async function getAuth() {
  return await auth();
}

export async function getUser() {
  return await currentUser();
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}

/**
 * Clerk API를 통해 사용자 정보를 가져옵니다
 * @param userId - Clerk User ID
 * @returns 사용자 정보 (이름, 이메일, 프로필 사진 등)
 */
export async function getClerkUser(userId: string) {
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    console.error("[getClerkUser] CLERK_SECRET_KEY is not set");
    return null;
  }

  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // 캐싱 방지
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getClerkUser] Clerk API error for userId ${userId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      if (response.status === 404) {
        return null;
      }
      return null;
    }

    const user = await response.json();

    if (!user) {
      console.warn(`[getClerkUser] Empty response for userId ${userId}`);
      return null;
    }

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      emailAddresses:
        user.email_addresses?.map((email: any) => ({
          id: email.id,
          emailAddress: email.email_address,
          verification: email.verification,
        })) || [],
      imageUrl: user.image_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  } catch (error) {
    console.error(`[getClerkUser] Error fetching Clerk user ${userId}:`, error);
    return null;
  }
}

/**
 * Check if current user is an admin (does not throw error)
 * @returns Object with isAdmin boolean and role, or null if not authenticated
 */
export async function checkIsAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const supabase = await createServiceClient();
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !adminUser) {
    return null;
  }

  return {
    isAdmin: adminUser.role === "admin",
    role: adminUser.role as "admin" | "viewer",
  };
}

/**
 * Requires admin authentication for API routes
 * @returns Object with userId, adminUser, and supabase client
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdminAuth() {
  const userId = await requireAuth();
  const supabase = await createServiceClient();

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return { userId, adminUser, supabase };
}
