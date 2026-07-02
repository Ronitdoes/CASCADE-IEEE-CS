import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/hunt/case-07/lib/session'
import { db, isDbAvailable } from '@/db'
import { userProgress } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('caseId')

  if (!caseId) {
    return NextResponse.json({ success: false, error: 'caseId parameter required' }, { status: 400 })
  }

  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ success: true, progress: {} })
  }

  if (!isDbAvailable) {
    return NextResponse.json({ success: true, progress: {} })
  }

  try {
    const rows = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, session.userId),
          eq(userProgress.caseId, caseId)
        )
      )

    const progress: Record<string, any> = {}
    rows.forEach((row: any) => {
      try {
        progress[row.progressKey] = JSON.parse(row.progressValue)
      } catch {
        progress[row.progressKey] = row.progressValue
      }
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error(`Failed to load progress for case ${caseId}:`, error)
    return NextResponse.json({ success: false, error: 'Database read error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 })
    }

    const { caseId, key, value } = await request.json()
    if (!caseId || !key) {
      return NextResponse.json({ success: false, error: 'caseId and key are required' }, { status: 400 })
    }

    if (!isDbAvailable) {
      return NextResponse.json({ success: true }) // Silent success for offline demo mode
    }

    const valString = JSON.stringify(value)

    await db
      .insert(userProgress)
      .values({
        userId: session.userId,
        caseId: caseId,
        progressKey: key,
        progressValue: valString,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.caseId, userProgress.progressKey],
        set: {
          progressValue: valString,
          updatedAt: new Date()
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save progress:', error)
    return NextResponse.json({ success: false, error: 'Database write error' }, { status: 500 })
  }
}
