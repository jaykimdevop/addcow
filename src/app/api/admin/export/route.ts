import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/clerk";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdminAuth();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    let query = supabase.from("submissions").select("*").order("created_at", {
      ascending: false,
    });

    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    // Generate CSV
    const headers = ["Email", "Submitted At", "ID"];
    const rows = (submissions || []).map((submission: any) => [
      submission.email,
      format(new Date(submission.created_at), "yyyy-MM-dd HH:mm:ss"),
      submission.id,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="submissions-${startDate || "all"}-to-${endDate || "all"}.csv"`,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

