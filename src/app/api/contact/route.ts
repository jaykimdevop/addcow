import { type NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { sendEmail } from "@/lib/email";
import { createErrorResponse, logError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/ratelimit";
import { createServiceClient } from "@/lib/supabase/server";
import type { ContactResponse } from "@/types/api";

// HTML sanitization function to prevent XSS attacks
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 체크
    const rateLimitResponse = await checkRateLimit(request, "contact");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { name, email, message } = await request.json();

    // 필드 검증
    if (!name || !email || !message) {
      return NextResponse.json(
        createErrorResponse("ALL_FIELDS_REQUIRED", 400),
        { status: 400 },
      );
    }

    // 이메일 검증
    const normalizedEmail = email.toLowerCase().trim();
    if (!validator.isEmail(normalizedEmail)) {
      return NextResponse.json(createErrorResponse("EMAIL_INVALID", 400), {
        status: 400,
      });
    }

    // Sanitize user inputs to prevent XSS
    const sanitizedName = escapeHtml(name.trim());
    const sanitizedEmail = escapeHtml(normalizedEmail);
    const sanitizedMessage = escapeHtml(message.trim()).replace(/\n/g, "<br>");

    // Send email notification to admin
    const adminEmail =
      process.env.SMTP_USER || process.env.EMAIL_FROM || "admin@yourdomain.com";

    try {
      await sendEmail({
        to: adminEmail,
        subject: `새 문의: ${sanitizedName}`,
        html: `
          <h2>새로운 문의가 접수되었습니다</h2>
          <p><strong>이름:</strong> ${sanitizedName}</p>
          <p><strong>이메일:</strong> ${sanitizedEmail}</p>
          <p><strong>메시지:</strong></p>
          <p>${sanitizedMessage}</p>
        `,
      });
    } catch (error) {
      logError("contact:send_email", error);
      return NextResponse.json(
        createErrorResponse("CONTACT_SEND_FAILED", 500, error),
        { status: 500 },
      );
    }

    // Save to database
    try {
      const supabase = await createServiceClient();
      await supabase.from("submissions").insert({
        email: normalizedEmail,
        metadata: {
          type: "contact",
          name: sanitizedName,
          message: message.trim(),
        },
      });
    } catch (error) {
      logError("contact:db_save", error);
      // 이메일은 전송되었으므로 DB 저장 실패는 무시
    }

    const response: ContactResponse = {
      message: "문의가 성공적으로 전송되었습니다",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logError("contact:api", error);
    return NextResponse.json(
      createErrorResponse("INTERNAL_ERROR", 500, error),
      { status: 500 },
    );
  }
}
