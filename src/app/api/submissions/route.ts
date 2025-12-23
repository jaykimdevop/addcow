import { type NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { createErrorResponse, logError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/ratelimit";
import { createServiceClient } from "@/lib/supabase/server";
import type { SubmissionResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 체크
    const rateLimitResponse = await checkRateLimit(request, "submissions");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { email } = await request.json();

    // 이메일 필수 체크
    if (!email || typeof email !== "string") {
      return NextResponse.json(createErrorResponse("EMAIL_REQUIRED", 400), {
        status: 400,
      });
    }

    // 강화된 이메일 검증
    const normalizedEmail = email.toLowerCase().trim();
    if (!validator.isEmail(normalizedEmail)) {
      return NextResponse.json(createErrorResponse("EMAIL_INVALID", 400), {
        status: 400,
      });
    }

    const supabase = await createServiceClient();

    // Insert submission
    const { error: insertError } = await supabase.from("submissions").insert({
      email: normalizedEmail,
      metadata: {
        user_agent: request.headers.get("user-agent"),
        referer: request.headers.get("referer"),
      },
    });

    if (insertError) {
      // 중복 이메일 에러 체크
      if (insertError.code === "23505") {
        return NextResponse.json(createErrorResponse("EMAIL_DUPLICATE", 409), {
          status: 409,
        });
      }

      logError("submissions:insert", insertError);
      return NextResponse.json(
        createErrorResponse("DB_SAVE_FAILED", 500, insertError),
        { status: 500 },
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
      logError("submissions:waitlist_update", error);
      // 카운터 업데이트 실패해도 제출은 성공으로 처리
    }

    const response: SubmissionResponse = {
      message: "이메일이 성공적으로 등록되었습니다",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logError("submissions:api", error);
    return NextResponse.json(
      createErrorResponse("INTERNAL_ERROR", 500, error),
      { status: 500 },
    );
  }
}
