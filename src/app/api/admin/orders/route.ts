import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    const jobs = await db.productionJob.findMany({
      where: {
        ...(status && status !== "ALL" ? { status } : {}),
      },
      include: {
        design: {
          include: {
            selections: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const designsWithoutJob = await db.design.findMany({
      where: {
        productionJob: null,
      },
      include: {
        selections: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ jobs, draftDesigns: designsWithoutJob });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, status, notes } = body;

    if (!jobId || !status) {
      return NextResponse.json({ error: "Missing jobId or status" }, { status: 400 });
    }

    const updatedJob = await db.productionJob.update({
      where: { id: jobId },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error: any) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
