import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const INITIAL_LIMIT = 300;
const DAILY_DECREASE = 50;

// 하루에 50명씩 랜덤하게 차감되는 시뮬레이션
function getSimulatedCount(initialCount: number, startDate: Date): number {
  const now = new Date();
  const daysPassed = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // 각 날짜마다 50명을 랜덤한 시간에 분산해서 차감
  let totalDecrease = 0;
  for (let day = 0; day < daysPassed; day++) {
    totalDecrease += DAILY_DECREASE;
  }

  // 오늘 하루 중 현재까지 차감된 인원 (랜덤하게 시뮬레이션)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const progressInDay = (currentHour * 60 + currentMinute) / (24 * 60); // 0~1 사이 값
  const todayDecrease = Math.floor(DAILY_DECREASE * progressInDay);
  totalDecrease += todayDecrease;

  return Math.max(0, initialCount - totalDecrease);
}

export async function GET() {
  try {
    const supabase = await createServiceClient();

    // 설정에서 waitlist 데이터 가져오기
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "waitlist_data")
      .single();

    let remaining = INITIAL_LIMIT;
    let actualRegistrations = 0;

    if (!error && data) {
      const waitlistData = data.value as {
        start_date: string;
        actual_registrations: number;
      };
      actualRegistrations = waitlistData.actual_registrations || 0;
      const startDate = new Date(waitlistData.start_date);

      // 시뮬레이션된 차감 + 실제 등록 수
      const simulatedRemaining = getSimulatedCount(INITIAL_LIMIT, startDate);
      remaining = simulatedRemaining - actualRegistrations;
    } else {
      // 처음 설정되지 않았다면 초기화
      const startDate = new Date().toISOString();
      await supabase.from("site_settings").upsert(
        {
          key: "waitlist_data",
          value: {
            start_date: startDate,
            actual_registrations: 0,
          },
        },
        { onConflict: "key" },
      );
    }

    return NextResponse.json({ remaining: Math.max(0, remaining) });
  } catch (error) {
    console.error("Failed to get waitlist count:", error);
    return NextResponse.json({ remaining: INITIAL_LIMIT }, { status: 200 });
  }
}
