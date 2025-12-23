import { NextResponse } from "next/server";
import { getProjects, getTeams } from "@/lib/vercel";

/**
 * Vercel API 연결 테스트 엔드포인트
 * GET /api/admin/vercel-test
 */
export async function GET() {
  try {
    // 환경변수 확인
    if (!process.env.VERCEL_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "VERCEL_ACCESS_TOKEN environment variable is not set",
        },
        { status: 500 },
      );
    }

    // Team 정보 조회 테스트
    const teamsResult = await getTeams();
    const teams = teamsResult.teams || [];

    // 프로젝트 목록 조회 테스트
    const projectsResult = await getProjects();
    const projects = projectsResult.projects || [];

    return NextResponse.json({
      success: true,
      message: "Vercel API connection successful",
      data: {
        teams: {
          count: teams.length,
          teams: teams.map((team) => ({
            id: team.id,
            name: team.name,
            slug: team.slug,
          })),
        },
        projects: {
          count: projects.length,
          projects: projects.map((project) => ({
            id: project.id,
            name: project.name,
            accountId: project.accountId,
            createdAt: new Date(project.createdAt).toISOString(),
          })),
        },
      },
    });
  } catch (error) {
    console.error("Vercel API test error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    );
  }
}
