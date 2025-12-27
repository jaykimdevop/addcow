import { format } from "date-fns";
import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdminAuth } from "@/lib/clerk";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdminAuth();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "submissions"; // submissions or users
    const exportFormat = searchParams.get("format") || "csv"; // csv or excel

    if (type === "submissions") {
      const startDate = searchParams.get("start");
      const endDate = searchParams.get("end");

      let query = supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

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
          { status: 500 },
        );
      }

      const headers = ["Email", "Submitted At", "ID"];
      const rows = (submissions || []).map((submission: any) => [
        submission.email,
        format(new Date(submission.created_at), "yyyy-MM-dd HH:mm:ss"),
        submission.id,
      ]);

      if (exportFormat === "excel") {
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
        const excelBuffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        return new NextResponse(excelBuffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="submissions-${startDate || "all"}-to-${endDate || "all"}.xlsx"`,
          },
        });
      } else {
        // CSV
        const csvContent = [
          headers.join(","),
          ...rows.map((row: string[]) =>
            row.map((cell: string) => `"${cell}"`).join(","),
          ),
        ].join("\n");

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="submissions-${startDate || "all"}-to-${endDate || "all"}.csv"`,
          },
        });
      }
    } else if (type === "users") {
      const startDate = searchParams.get("start");
      const endDate = searchParams.get("end");

      let query = supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
      }

      const { data: adminUsers, error } = await query;

      if (error) {
        console.error("Database error:", error);
        return NextResponse.json(
          { error: "Failed to fetch data" },
          { status: 500 },
        );
      }

      const headers = [
        "ID",
        "Clerk User ID",
        "Email",
        "First Name",
        "Last Name",
        "Username",
        "Role",
        "Created At",
      ];
      const rows = (adminUsers || []).map((user: any) => [
        user.id,
        user.clerk_user_id,
        user.email || "",
        user.first_name || "",
        user.last_name || "",
        user.username || "",
        user.role,
        format(new Date(user.created_at), "yyyy-MM-dd HH:mm:ss"),
      ]);

      const filenameDatePart = startDate && endDate 
        ? `${startDate}-to-${endDate}` 
        : format(new Date(), "yyyy-MM-dd");

      if (exportFormat === "excel") {
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        const excelBuffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        return new NextResponse(excelBuffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="users-${filenameDatePart}.xlsx"`,
          },
        });
      } else {
        // CSV
        const csvContent = [
          headers.join(","),
          ...rows.map((row: string[]) =>
            row.map((cell: string) => `"${cell}"`).join(","),
          ),
        ].join("\n");

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="users-${filenameDatePart}.csv"`,
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
