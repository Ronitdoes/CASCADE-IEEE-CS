import { NextRequest, NextResponse } from 'next/server'
import { setSession, clearSession, getSession } from '@/app/hunt/case-07/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: session.userId,
        name: session.name,
        email: session.email,
        teamName: session.teamName,
      },
    })
  } catch (error) {
    console.error('Session GET API error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload.' }, { status: 400 })
    }

    const { name, email, teamName, password } = body as Record<string, unknown>
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof teamName !== 'string' || !teamName.trim() ||
      typeof password !== 'string' || !password.trim()
    ) {
      return NextResponse.json({ success: false, message: 'Name, Email, Team Name, and Password are required.' }, { status: 400 })
    }

    const userId = await setSession(name.trim(), email.trim().toLowerCase(), teamName.trim(), password.trim())
    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    console.error('Session API error:', error)
    if (error.message === 'Incorrect password for this email address.') {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Server error setting session.' }, { status: 500 })
  }
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ success: true })
}

