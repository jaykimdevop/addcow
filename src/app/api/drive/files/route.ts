import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleDriveClient } from "@/lib/google-drive";
import type { GoogleDriveFile } from "@/types/google-drive";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || "root";
    const pageToken = searchParams.get("pageToken");

    const drive = await getGoogleDriveClient();

    // Google Drive 파일 목록 조회
    const response = await drive.files.list({
      q: folderId === "root" 
        ? "'root' in parents and trashed=false" 
        : `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime, parents, webViewLink, webContentLink, thumbnailLink, iconLink)",
      pageSize: 50,
      pageToken: pageToken || undefined,
      orderBy: "folder,name",
    });

    const files: GoogleDriveFile[] = (response.data.files || []).map((file) => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      size: file.size,
      modifiedTime: file.modifiedTime,
      parents: file.parents,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
      iconLink: file.iconLink,
    }));

    return NextResponse.json({
      files,
      nextPageToken: response.data.nextPageToken,
    });
  } catch (error) {
    console.error("Error fetching Google Drive files:", error);
    
    if (error instanceof Error && error.message === "Google Drive not connected") {
      return NextResponse.json(
        { error: "Google Drive not connected" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch Google Drive files" },
      { status: 500 }
    );
  }
}
