import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

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
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Sanitize user inputs to prevent XSS
    const sanitizedName = escapeHtml(name);
    const sanitizedEmail = escapeHtml(email);
    const sanitizedMessage = escapeHtml(message).replace(/\n/g, "<br>");

    // Send email notification to admin
    // Use SMTP_USER as admin email (same Gmail account used for sending)
    const adminEmail = process.env.SMTP_USER || process.env.EMAIL_FROM || "admin@yourdomain.com";
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

    // Optionally save to database
    const supabase = await createServiceClient();
    await supabase.from("submissions").insert({
      email,
      metadata: {
        type: "contact",
        name,
        message,
      },
    });

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

