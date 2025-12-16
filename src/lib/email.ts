import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    throw new Error("Email service not configured");
  }

  const fromEmail =
    options.from ||
    process.env.EMAIL_FROM ||
    "noreply@yourdomain.com";
  const fromName =
    options.fromName || process.env.EMAIL_FROM_NAME || "Your App";

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export function generateMVPNotificationEmail(
  email: string,
  signupUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">드디어 출시되었습니다! 🎉</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      안녕하세요,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      대기자 명단에 등록해주셔서 감사합니다. 드디어 서비스를 출시하게 되어 기쁘게 알려드립니다!
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; font-size: 16px; font-weight: bold;">
        지금 바로 시작하세요!
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${signupUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        계정 만들기
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      링크가 작동하지 않으시나요? 아래 URL을 복사하여 브라우저에 붙여넣으세요:<br>
      <a href="${signupUrl}" style="color: #667eea;">${signupUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666; margin: 0;">
      질문이 있으시면 언제든지 연락주세요.<br>
      감사합니다!
    </p>
  </div>
</body>
</html>
  `;
}

