import { UserProfile } from "@clerk/nextjs";
import { LuUser } from "react-icons/lu";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function UserProfilePage() {
  return (
    <AuthPageLayout
      icon={LuUser}
      title="프로필 수정"
      description="계정 정보를 관리하세요"
    >
      <UserProfile
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/user-profile"
      />
    </AuthPageLayout>
  );
}
