import { SignIn } from "@clerk/nextjs";
import { LuLogIn } from "react-icons/lu";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function SignInPage() {
  return (
    <AuthPageLayout
      icon={LuLogIn}
      title="관리자 로그인"
      description="관리자 페이지에 접근하려면 로그인하세요"
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/admin"
        forceRedirectUrl="/admin"
      />
    </AuthPageLayout>
  );
}
