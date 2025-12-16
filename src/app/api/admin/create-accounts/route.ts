import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const supabase = await createServiceClient();

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("clerk_user_id", userId)
      .single();

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all submissions that haven't had accounts created
    const { data: submissions, error: fetchError } = await supabase
      .from("submissions")
      .select("id, email")
      .eq("account_created", false);

    if (fetchError) {
      console.error("Database error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        message: "No pending accounts to create",
        count: 0,
      });
    }

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      return NextResponse.json(
        { error: "Clerk secret key not configured" },
        { status: 500 }
      );
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Create accounts using Clerk API
    for (const submission of submissions) {
      try {
        const response = await fetch("https://api.clerk.com/v1/users", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clerkSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: [submission.email],
            skip_password_requirement: true, // Send password reset email instead
            skip_password_checks: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If user already exists, that's okay
          if (errorData.errors?.[0]?.message?.includes("already exists")) {
            // Mark as created even if it already existed
            await supabase
              .from("submissions")
              .update({ account_created: true })
              .eq("id", submission.id);
            successCount++;
            continue;
          }
          throw new Error(
            errorData.errors?.[0]?.message || "Failed to create account"
          );
        }

        // Mark as created
        await supabase
          .from("submissions")
          .update({ account_created: true })
          .eq("id", submission.id);

        successCount++;
      } catch (error) {
        failCount++;
        errors.push(
          `Failed to create account for ${submission.email}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        console.error(`Failed to create account for ${submission.email}:`, error);
      }
    }

    return NextResponse.json({
      message: "Account creation process completed",
      success: successCount,
      failed: failCount,
      total: submissions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

