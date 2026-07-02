/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getSession, saveDemoState } from '@/app/hunt/case-07/lib/session'
import { isDbAvailable, db } from '@/db'
import { timelineProgress } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { timelines } from '@/app/hunt/case-07/lib/timelines'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    let rank = 1
    let timelineStates = timelines.map(t => {
      // By default, operation-deadlight is active, others locked
      const isRecovered = session.recovered.includes(t.id)
      return {
        id: t.id,
        title: t.title,
        era: t.era,
        setting: t.setting,
        status: isRecovered ? 'completed' : t.id === 'operation-deadlight' ? 'active' : 'locked' as const,
        fragmentRecovered: isRecovered,
      }
    })

    if (isDbAvailable) {
      try {
        // Fetch actual timeline progress from database
        const progressList = await db
          .select()
          .from(timelineProgress)
          .where(eq(timelineProgress.userId, session.userId))

        timelineStates = timelines.map(t => {
          const dbProgress = progressList.find((p: any) => p.timelineId === t.id)
          const isRecovered = session.recovered.includes(t.id)
          return {
            id: t.id,
            title: t.title,
            era: t.era,
            setting: t.setting,
            status: isRecovered ? 'completed' : (dbProgress?.status ?? (t.id === 'operation-deadlight' ? 'active' : 'locked')) as any,
            fragmentRecovered: isRecovered,
          }
        })
      } catch (e) {
        console.error('Error fetching DB progress details:', e)
      }
    } else {
      // Demo Mode: calculate rank and unlock other timelines if operation-kennedy is completed
      if (session.recovered.includes('operation-deadlight')) {
        timelineStates = timelines.map(t => {
          const isRecovered = session.recovered.includes(t.id)
          return {
            id: t.id,
            title: t.title,
            era: t.era,
            setting: t.setting,
            status: isRecovered ? 'completed' : 'active' as const, // Unlock others for exploration in Demo
            fragmentRecovered: isRecovered,
          }
        })
      }
    }

    return NextResponse.json({
      authenticated: true,
      userId: session.userId,
      name: session.name,
      email: session.email,
      integrity: session.integrity,
      fragmentsRecovered: session.recovered.length,
      hints: session.hints,
      rank,
      timelines: timelineStates,
    })
  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json({ error: 'Server error fetching progress.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { action } = body as Record<string, unknown>
    if (action === 'use-hint') {
      session.hints += 1
      await saveDemoState(session)
      return NextResponse.json({ success: true, hints: session.hints })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Progress update API error:', error)
    return NextResponse.json({ error: 'Server error processing progress action.' }, { status: 500 })
  }
}
