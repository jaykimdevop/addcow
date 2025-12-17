import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Insert submission
    const { error: insertError } = await supabase
      .from("submissions")
      .insert({
        email: email.toLowerCase().trim(),
        metadata: {
          user_agent: request.headers.get("user-agent"),
          referer: request.headers.get("referer"),
        },
      });

    if (insertError) {
      // Check if it's a duplicate email error
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 409 }
        );
      }

      console.error("Database error:", insertError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    // 대기자 등록 카운터 증가
    try {
      const { data: waitlistData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "waitlist_data")
        .single();

      if (waitlistData) {
        const currentData = waitlistData.value as {
          start_date: string;
          actual_registrations: number;
        };
        await supabase
          .from("site_settings")
          .update({
            value: {
              ...currentData,
              actual_registrations: (currentData.actual_registrations || 0) + 1,
            },
          })
          .eq("key", "waitlist_data");
      }
    } catch (error) {
      console.error("Failed to update waitlist count:", error);
      // 카운터 업데이트 실패해도 제출은 성공으로 처리
    }

    return NextResponse.json(
      { message: "Email submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

