import { requireAdminAuth } from "@/lib/clerk";
import { deployFromGitHub, getDeployments } from "@/lib/vercel";
import { NextResponse } from "next/server";

/**
 * POST /api/admin/deploy
 * GitHub 최신 코드로 Vercel 배포 트리거
 * 관리자 권한 필요
 */
export async function POST() {
  try {
    await requireAdminAuth();

    // GitHub에서 최신 코드로 배포
    const deployment = await deployFromGitHub({
      org: "jaykimdevop",
      repo: "addcow",
      branch: "main",
      projectName: "addcow",
    });

    return NextResponse.json({
      success: true,
      message: "배포가 시작되었습니다",
      deployment: {
        id: deployment.id,
        url: deployment.url,
        state: deployment.state,
        createdAt: deployment.createdAt,
      },
    });
  } catch (error) {
    console.error("[Deploy API] Error:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "관리자 권한이 필요합니다" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "배포 중 오류가 발생했습니다" 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/deploy
 * 최근 배포 상태 조회
 * 관리자 권한 필요
 */
export async function GET() {
  try {
    await requireAdminAuth();

    const { deployments } = await getDeployments({ limit: 5 });

    return NextResponse.json({
      success: true,
      deployments: deployments.map((d) => ({
        id: d.uid,
        name: d.name,
        url: d.url,
        state: d.state,
        target: d.target,
        createdAt: d.createdAt,
        readyAt: d.readyAt,
      })),
    });
  } catch (error) {
    console.error("[Deploy API] Error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "관리자 권한이 필요합니다" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "배포 상태 조회 중 오류가 발생했습니다" 
      },
      { status: 500 }
    );
  }
}

