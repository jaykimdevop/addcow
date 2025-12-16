import { SignUp } from "@clerk/nextjs";
import { LuUserPlus } from "react-icons/lu";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function SignUpPage() {
  return (
    <AuthPageLayout
      icon={LuUserPlus}
      title="관리자 회원가입"
      description="새 계정을 만들어 관리자 페이지에 접근하세요"
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/admin"
        forceRedirectUrl="/admin"
      />
    </AuthPageLayout>
  );
}
