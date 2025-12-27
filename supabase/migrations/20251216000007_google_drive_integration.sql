-- Google Drive 연동을 위한 테이블 및 RLS 정책 설정

-- 1. google_drive_tokens 테이블 생성
CREATE TABLE IF NOT EXISTS public.google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_google_drive_tokens_clerk_user_id ON public.google_drive_tokens(clerk_user_id);

-- 3. updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_google_drive_tokens_updated_at ON public.google_drive_tokens;
CREATE TRIGGER update_google_drive_tokens_updated_at
  BEFORE UPDATE ON public.google_drive_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS 활성화
ALTER TABLE public.google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- 6. 기존 정책 삭제 (재실행 시 충돌 방지)
DROP POLICY IF EXISTS "Users can view own tokens" ON public.google_drive_tokens;
DROP POLICY IF EXISTS "Users can insert own tokens" ON public.google_drive_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON public.google_drive_tokens;
DROP POLICY IF EXISTS "Users can delete own tokens" ON public.google_drive_tokens;

-- 7. RLS 정책 생성
-- SELECT: 사용자는 자신의 토큰만 조회 가능
CREATE POLICY "Users can view own tokens"
ON public.google_drive_tokens FOR SELECT
TO authenticated
USING (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
);

-- INSERT: 사용자는 자신의 토큰만 삽입 가능
CREATE POLICY "Users can insert own tokens"
ON public.google_drive_tokens FOR INSERT
TO authenticated
WITH CHECK (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
);

-- UPDATE: 사용자는 자신의 토큰만 업데이트 가능
CREATE POLICY "Users can update own tokens"
ON public.google_drive_tokens FOR UPDATE
TO authenticated
USING (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
)
WITH CHECK (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
);

-- DELETE: 사용자는 자신의 토큰만 삭제 가능
CREATE POLICY "Users can delete own tokens"
ON public.google_drive_tokens FOR DELETE
TO authenticated
USING (
  clerk_user_id = (SELECT auth.jwt()->>'sub')
);
