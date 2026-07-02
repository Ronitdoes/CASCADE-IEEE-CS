import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/hunt/case-07/lib/session";
import { isDbAvailable, db } from "@/db";
import { timelineProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

const caseTimelineMap: Record<string, string> = {
  "01": "heart-of-osiris",
  "02": "age-of-embers",
  "03": "echoes-of-the-artifact",
  "04": "midnight-carnival",
  "05": "project-heisenberg",
  "06": "protocol-zero",
  "07": "operation-deadlight",
  "08": "the-card-cabinets",
  "09": "final-stage-v2",
};

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession();
  
  const completedCases: Record<string, boolean> = {};
  let stage1Completed = false;

  // 1. Initial status from cookies
  Object.keys(caseTimelineMap).forEach((num) => {
    completedCases[num] = cookieStore.get(`case-${num}-completed`)?.value === "true";
  });

  // 2. Query from database if session is active
  if (isDbAvailable && session?.userId) {
    try {
      const progress = await db
        .select()
        .from(timelineProgress)
        .where(eq(timelineProgress.userId, session.userId));
        
      progress.forEach((row: any) => {
        if (row.timelineId === "final-stage" && row.status === "completed") {
          stage1Completed = true;
        }
        const caseNum = Object.keys(caseTimelineMap).find(
          (key) => caseTimelineMap[key] === row.timelineId
        );
        if (caseNum) {
          completedCases[caseNum] = row.status === "completed";
        }
      });
    } catch (error) {
      console.error("Failed to query progress from database:", error);
    }
  }

  return NextResponse.json({ success: true, authenticated: !!session, completedCases, stage1Completed, userId: session?.userId });
}

export async function POST(request: NextRequest) {
  try {
    const { caseId } = await request.json();
    if (!caseId || typeof caseId !== "string") {
      return NextResponse.json({ success: false, error: "Invalid caseId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = await getSession();
    const timelineId = caseTimelineMap[caseId];

    // Set cookie cache
    const cookieName = `case-${caseId}-completed`;
    cookieStore.set(cookieName, "true", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    // Write to DB if session is active and DB is available
    if (isDbAvailable && session?.userId && timelineId) {
      try {
        await db
          .insert(timelineProgress)
          .values({
            userId: session.userId,
            timelineId: timelineId,
            status: "completed",
            completedAt: new Date(),
            fragmentRecovered: false,
          })
          .onConflictDoUpdate({
            target: [timelineProgress.userId, timelineProgress.timelineId],
            set: {
              status: "completed",
              completedAt: new Date(),
            },
          });
      } catch (error) {
        console.error("Failed to update database progress:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Progress POST API error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
