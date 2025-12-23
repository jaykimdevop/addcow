import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/clerk";
import { generateMVPNotificationEmail, sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdminAuth();

    // Get all submissions that haven't been notified
    const { data: submissions, error: fetchError } = await supabase
      .from("submissions")
      .select("id, email")
      .eq("notified", false);

    if (fetchError) {
      console.error("Database error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 },
      );
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        message: "No pending notifications",
        count: 0,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signupUrl = `${appUrl}/sign-up`;

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Send emails in batches (to avoid rate limiting)
    for (const submission of submissions) {
      try {
        await sendEmail({
          to: submission.email,
          subject: "드디어 출시되었습니다! 🎉",
          html: generateMVPNotificationEmail(submission.email, signupUrl),
        });

        // Mark as notified
        await supabase
          .from("submissions")
          .update({
            notified: true,
            notified_at: new Date().toISOString(),
          })
          .eq("id", submission.id);

        successCount++;
      } catch (error) {
        failCount++;
        errors.push(
          `Failed to send to ${submission.email}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
        console.error(`Failed to notify ${submission.email}:`, error);
      }
    }

    return NextResponse.json({
      message: "Notification process completed",
      success: successCount,
      failed: failCount,
      total: submissions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
