/**
 * Vercel API 연결 테스트 스크립트
 * 
 * 사용법:
 *   node scripts/test-vercel-api.js
 * 
 * 또는 환경변수를 직접 지정:
 *   VERCEL_ACCESS_TOKEN=your_token node scripts/test-vercel-api.js
 */

const VERCEL_API_BASE = "https://api.vercel.com";

async function testVercelAPI() {
  const token = process.env.VERCEL_ACCESS_TOKEN;

  if (!token) {
    console.error("❌ VERCEL_ACCESS_TOKEN environment variable is not set");
    console.log("\n환경변수를 설정하는 방법:");
    console.log("1. .env.local 파일에 VERCEL_ACCESS_TOKEN=your_token 추가");
    console.log("2. 또는 명령어 실행 시: VERCEL_ACCESS_TOKEN=your_token node scripts/test-vercel-api.js");
    process.exit(1);
  }

  console.log("🔍 Vercel API 연결 테스트 시작...\n");

  try {
    // Test 1: Teams 조회
    console.log("1️⃣ Teams 정보 조회 중...");
    const teamsResponse = await fetch(`${VERCEL_API_BASE}/v2/teams`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!teamsResponse.ok) {
      const error = await teamsResponse.json().catch(() => ({ error: teamsResponse.statusText }));
      throw new Error(`Teams API error: ${JSON.stringify(error)}`);
    }

    const teamsData = await teamsResponse.json();
    console.log(`   ✅ Teams 조회 성공: ${teamsData.teams?.length || 0}개`);

    // Test 2: Projects 조회
    console.log("2️⃣ Projects 정보 조회 중...");
    const projectsResponse = await fetch(`${VERCEL_API_BASE}/v9/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!projectsResponse.ok) {
      const error = await projectsResponse.json().catch(() => ({ error: projectsResponse.statusText }));
      throw new Error(`Projects API error: ${JSON.stringify(error)}`);
    }

    const projectsData = await projectsResponse.json();
    console.log(`   ✅ Projects 조회 성공: ${projectsData.projects?.length || 0}개`);

    // 결과 요약
    console.log("\n" + "=".repeat(50));
    console.log("✅ Vercel API 연결 테스트 성공!");
    console.log("=".repeat(50));
    console.log(`\n📊 요약:`);
    console.log(`   - Teams: ${teamsData.teams?.length || 0}개`);
    if (teamsData.teams && teamsData.teams.length > 0) {
      teamsData.teams.forEach((team) => {
        console.log(`     • ${team.name} (${team.slug})`);
      });
    } else {
      console.log(`     • Personal Account 사용 중`);
    }
    console.log(`   - Projects: ${projectsData.projects?.length || 0}개`);
    if (projectsData.projects && projectsData.projects.length > 0) {
      projectsData.projects.slice(0, 5).forEach((project) => {
        console.log(`     • ${project.name} (${project.id})`);
      });
      if (projectsData.projects.length > 5) {
        console.log(`     ... 외 ${projectsData.projects.length - 5}개`);
      }
    }

    console.log("\n✨ 모든 테스트가 성공적으로 완료되었습니다!");
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ Vercel API 연결 테스트 실패");
    console.error("=".repeat(50));
    console.error(`\n오류: ${error.message}`);
    
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      console.error("\n💡 가능한 원인:");
      console.error("   - VERCEL_ACCESS_TOKEN이 유효하지 않습니다");
      console.error("   - 토큰이 만료되었거나 삭제되었습니다");
      console.error("   - Vercel Dashboard에서 새 토큰을 생성하세요");
    } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
      console.error("\n💡 가능한 원인:");
      console.error("   - 토큰에 필요한 권한이 없습니다");
      console.error("   - Full Account 권한이 필요합니다");
    }
    
    process.exit(1);
  }
}

// 실행
testVercelAPI();

