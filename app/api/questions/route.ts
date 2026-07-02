import { NextRequest, NextResponse } from 'next/server'
import { db, isDbAvailable } from '@/db'
import { caseQuestions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

function normalize(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getLevenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return dp[m][n];
}

function getSimilarity(s1: string, s2: string): number {
  const dist = getLevenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  return 1 - dist / maxLen;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('caseId')
  const puzzleKey = searchParams.get('puzzleKey')
  const limitParam = Math.min(Math.max(parseInt(searchParams.get('limit') || '100', 10) || 100, 1), 100)
  const offsetParam = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

  if (!caseId) {
    return NextResponse.json({ success: false, error: 'caseId parameter required' }, { status: 400 })
  }

  if (!isDbAvailable) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
  }

  try {
    const whereConditions = puzzleKey
      ? and(eq(caseQuestions.caseId, caseId), eq(caseQuestions.puzzleKey, puzzleKey))
      : eq(caseQuestions.caseId, caseId)

    const rows = await db.select({
      id: caseQuestions.id,
      caseId: caseQuestions.caseId,
      puzzleKey: caseQuestions.puzzleKey,
      question: caseQuestions.question
    })
    .from(caseQuestions)
    .where(whereConditions)
    .limit(limitParam)
    .offset(offsetParam)

    return NextResponse.json({ success: true, questions: rows })
  } catch (error) {
    console.error(`Failed to get Case ${caseId} questions:`, error)
    return NextResponse.json({ success: false, error: 'Database read error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isDbAvailable) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { caseId, puzzleKey, answer } = body

    if (!caseId || !puzzleKey || typeof answer !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 })
    }

    const normalizedKey = puzzleKey.replaceAll("-", "_");

    const rows = await db.select({
      answer: caseQuestions.answer
    }).from(caseQuestions).where(
      and(
        eq(caseQuestions.caseId, caseId),
        eq(caseQuestions.puzzleKey, normalizedKey)
      )
    )

    if (rows.length === 0) {
      return NextResponse.json({ success: true, correct: false, message: 'Question not found' })
    }

    const dbAnswer = rows[0].answer
    const normDb = normalize(dbAnswer)
    const normUser = normalize(answer)

    let correct = normDb === normUser
    let partial = false

    const aliases: string[] = []
    let fuzzyThreshold = 1.0

    if (normalizedKey === 'wilhelm_scream') {
      aliases.push('wilhelm')
    } else if (normalizedKey === 'poe_cipher') {
      aliases.push('gil bronza', 'gil broza')
      fuzzyThreshold = 0.8
    } else if (normalizedKey === 'deep_blue') {
      aliases.push('kasparov')
      fuzzyThreshold = 0.8
    } else if (normalizedKey === 'kryptos_cipher') {
      fuzzyThreshold = 0.9
    } else if (normalizedKey === 'mirror_script') {
      aliases.push('carnival 17', 'carnival17', 'reveal')
    } else if (normalizedKey === 'golden_record') {
      fuzzyThreshold = 0.8
    }

    // Special Case 8 handling
    if (caseId === '08') {
      if (normalizedKey === 'p1') {
        aliases.push('14 october 1972', '14-oct-1972')
      }
    }

    const normAliases = aliases.map(normalize)

    if (!correct) {
      if (normAliases.includes(normUser)) {
        correct = true
      }
    }

    if (!correct && fuzzyThreshold < 1.0) {
      if (getSimilarity(normDb, normUser) >= fuzzyThreshold) {
        correct = true
      }
      for (const normAlias of normAliases) {
        if (getSimilarity(normAlias, normUser) >= fuzzyThreshold) {
          correct = true
        }
      }
    }

    // Partial credit check
    if (!correct && normUser.length >= 3) {
      const isSubstringOfCanonical = normDb.includes(normUser)
      const isSubstringOfAnyAlias = normAliases.some(alias => alias.includes(normUser))
      if (isSubstringOfCanonical || isSubstringOfAnyAlias) {
        partial = true
      }
    }

    return NextResponse.json({ success: true, correct, partial })
  } catch (error) {
    console.error('Failed to validate question:', error)
    return NextResponse.json({ success: false, error: 'Database verification error' }, { status: 500 })
  }
}
