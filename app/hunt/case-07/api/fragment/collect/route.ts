import { NextRequest, NextResponse } from 'next/server'
import { getSession, saveDemoState } from '@/app/hunt/case-07/lib/session'
import { isDbAvailable, db } from '@/db'
import { fragments, timelineProgress } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

import { timelines } from '@/app/hunt/case-07/lib/timelines'

const validTimelineIds = new Set(timelines.map(t => t.id))

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ collected: false, message: 'Unauthenticated.' }, { status: 401 })
    }

    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ collected: false, message: 'Invalid payload.' }, { status: 400 })
    }

    const { timelineId } = body as Record<string, unknown>
    if (typeof timelineId !== 'string' || !validTimelineIds.has(timelineId)) {
      return NextResponse.json({ collected: false, message: 'Invalid timeline ID.' }, { status: 400 })
    }

    if (isDbAvailable) {
      try {
        await db.transaction(async (tx: any) => {
          // 1. Insert into fragments table atomically
          await tx
            .insert(fragments)
            .values({
              userId: session.userId,
              timelineId: timelineId,
              recoveredAt: new Date(),
              evidenceLogUnlocked: true,
            })
            .onConflictDoNothing({
              target: [fragments.userId, fragments.timelineId],
            })

          // 2. Upsert timelineProgress status atomically
          await tx
            .insert(timelineProgress)
            .values({
              userId: session.userId,
              timelineId: timelineId,
              status: 'completed',
              completedAt: new Date(),
              fragmentRecovered: true,
            })
            .onConflictDoUpdate({
              target: [timelineProgress.userId, timelineProgress.timelineId],
              set: {
                status: 'completed',
                completedAt: new Date(),
                fragmentRecovered: true,
              },
            })
        })
      } catch (dbError) {
        console.error('Database error in fragment collection:', dbError)
      }
    } else {
      // Demo Mode: save in session cookie
      if (!session.recovered.includes(timelineId)) {
        session.recovered.push(timelineId)
        await saveDemoState(session)
      }
    }

    return NextResponse.json({ collected: true })
  } catch (error) {
    console.error('Fragment collection API error:', error)
    return NextResponse.json({ collected: false, message: 'Server error collecting fragment.' }, { status: 500 })
  }
}
