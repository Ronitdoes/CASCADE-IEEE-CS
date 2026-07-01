import { NextRequest, NextResponse } from 'next/server'
import { db, isDbAvailable } from '@/db'
import { caseQuestions } from '@/db/schema'
import { eq } from 'drizzle-orm'

const ALL_SEED_QUESTIONS = [
  // CASE 1
  { caseId: "01", puzzleKey: "a1_2", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a2_1", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a3_0", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a3_1", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a4_1", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a5_0", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a5_1", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a5_2", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a6_0", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a6_2", question: "What is the primary color of the sun?", answer: "yellow" },
  { caseId: "01", puzzleKey: "a7_2", question: "What is the primary color of the sun?", answer: "yellow" },

  // CASE 2
  { caseId: "02", puzzleKey: "cw_0", question: "Every empire loses to me, yet I never raise a sword.", answer: "TIME" },
  { caseId: "02", puzzleKey: "cw_1", question: "Kingdoms rise beside me, explorers cross me, and history is often shaped by me.", answer: "OCEAN" },
  { caseId: "02", puzzleKey: "cw_2", question: "Burn me, and memory survives only in mouths. Preserve me, and centuries may still speak.", answer: "RECORD" },
  { caseId: "02", puzzleKey: "cw_3", question: "I don't prove the truth. I merely leave it with nowhere to hide.", answer: "EVIDENCE" },
  { caseId: "02", puzzleKey: "cw_4", question: "Every answer is built upon me, though I am rarely the answer myself.", answer: "CLUE" },
  { caseId: "02", puzzleKey: "cw_5", question: "Before the truth is read, this is always the first thing done.", answer: "OPENED" },
  { caseId: "02", puzzleKey: "cw_6", question: "Two witnesses can possess completely different versions of me.", answer: "VIEW" },
  { caseId: "02", puzzleKey: "cw_7", question: "Time buries me. Museums rescue me.", answer: "EXHIBIT" },
  { caseId: "02", puzzleKey: "cw_8", question: "Remove one line from me, and tomorrow's historians inherit a different yesterday.", answer: "REGISTER" },
  { caseId: "02", puzzleKey: "cw_keyword", question: "Crossword Keyword", answer: "TORECOVER" },

  // CASE 3
  { caseId: "03", puzzleKey: "caesar_scroll", question: "What sustained their civilization?", answer: "FLAME" },
  { caseId: "03", puzzleKey: "chronicle_sort", question: "Uncover the chronicles directive", answer: "LIGHT LEADS ONLY THE WORTHY HOME" },

  // CASE 4
  { caseId: "04", puzzleKey: "audio_game", question: "Audio game decrypt input", answer: "CRIMSON" },
  { caseId: "04", puzzleKey: "fortune_teller", question: "Fortune teller answer", answer: "PARADOX" },
  { caseId: "04", puzzleKey: "mirror_script", question: "Mirror script code word", answer: "REVEAL" },
  { caseId: "04", puzzleKey: "shooting_range_logs", question: "Log packet intruder pattern", answer: "INTRUDER_17" },

  // CASE 5
  { caseId: "05", puzzleKey: "math_trick", question: "Convert hex 0x5f3759df to decimal and sum the digits", answer: "42" },
  { caseId: "05", puzzleKey: "wilhelm_scream", question: "Sound effect Private character name", answer: "PRIVATE WILHELM" },
  { caseId: "05", puzzleKey: "taured_passport", question: "Mystery passport country name", answer: "TAURED" },
  { caseId: "05", puzzleKey: "kryptos_cipher", question: "Second clue passage", answer: "BERLIN" },
  { caseId: "05", puzzleKey: "deep_blue", question: "IBM Deep Blue chess champion name", answer: "GARRY KASPAROV" },
  { caseId: "05", puzzleKey: "golden_record", question: "Ann Druyan voyager record husband name", answer: "CARL SAGAN" },
  { caseId: "05", puzzleKey: "demon_core", question: "Plutonium sphere nickname", answer: "DEMON CORE" },
  { caseId: "05", puzzleKey: "poe_cipher", question: "Poe Graham cipher solver name", answer: "GIL BROZA" },

  // CASE 6
  { caseId: "06", puzzleKey: "stage7", question: "Recognize patterns that survive translation", answer: "7" },

  // CASE 7
  { caseId: "07", puzzleKey: "quarantine-registration", question: "Quarantine Registration Key", answer: "PLAGAS" },
  { caseId: "07", puzzleKey: "behavioral-match", question: "Behavioral Match Key", answer: "LURE" },
  { caseId: "07", puzzleKey: "black-symbol", question: "Black Symbol Key", answer: "REPLACE" },
  { caseId: "07", puzzleKey: "identity-distortion", question: "Identity Distortion Key", answer: "INFILTRATE" },
  { caseId: "07", puzzleKey: "memory-corruption", question: "Memory Corruption Key", answer: "OUTBREAK" },
  { caseId: "07", puzzleKey: "final-transmission", question: "Final Transmission Key", answer: "AETHERION" },
  { caseId: "07", puzzleKey: "packet-answer", question: "Packet Answer", answer: "SHIELD" },
  { caseId: "07", puzzleKey: "cipher-answer", question: "Cipher Answer", answer: "REPLACE" },
  { caseId: "07", puzzleKey: "interlude-1", question: "Interlude Wave 1 Key", answer: "QUARANTINE" },
  { caseId: "07", puzzleKey: "interlude-2", question: "Interlude Wave 2 Key", answer: "SURVIVAL" },

  // CASE 8
  { caseId: "08", puzzleKey: "p1", question: "P1: Odd Word Out", answer: "october" },
  { caseId: "08", puzzleKey: "p2", question: "P2: Timestamp Contradictions", answer: "EK4" },
  { caseId: "08", puzzleKey: "p3", question: "P3: Chemical Compound Letter Code", answer: "DELTA" },
  { caseId: "08", puzzleKey: "p4", question: "P4: Average Scan Line PIN", answer: "7294" },
  { caseId: "08", puzzleKey: "p5", question: "P5: Witness Statement Location", answer: "the null room" },
  { caseId: "08", puzzleKey: "p6", question: "P6: Project Name Chain", answer: "NULLGATE" },
  { caseId: "08", puzzleKey: "p7", question: "P7: Blueprint Cipher Starred Rooms", answer: "WATCHER" },
  { caseId: "08", puzzleKey: "p8", question: "P8: Sequence Anomaly Symbol Reference", answer: "ZERO" },
  { caseId: "08", puzzleKey: "dossier_1", question: "Dossier: Transmission Date", answer: "14 OCTOBER 1972" },
  { caseId: "08", puzzleKey: "dossier_2", question: "Dossier: Witness Code", answer: "EK4" },
  { caseId: "08", puzzleKey: "dossier_3", question: "Dossier: Codename", answer: "DELTA" },
  { caseId: "08", puzzleKey: "dossier_4", question: "Dossier: Frequency PIN", answer: "7294" },
  { caseId: "08", puzzleKey: "dossier_5", question: "Dossier: Destination", answer: "THE NULL ROOM" },
  { caseId: "08", puzzleKey: "dossier_6", question: "Dossier: Project Name", answer: "NULL-GATE" },
  { caseId: "08", puzzleKey: "dossier_7", question: "Dossier: Facility Founded", answer: "1967" },
  { caseId: "08", puzzleKey: "dossier_8", question: "Dossier: Director Surname", answer: "VOSS" },

  // CASE 9
  { caseId: "09", puzzleKey: "stage2", question: "Stage 2: Archive Fragment Decryption", answer: "NULLEVENT" },
  { caseId: "09", puzzleKey: "morse", question: "Stage 3: Morse Transmission Warning", answer: "THE ARCHIVE REMEMBERS WHAT WE FORGOT" }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('caseId')
  const reset = searchParams.get('reset') === 'true'

  if (reset) {
    if (!isDbAvailable) {
      return NextResponse.json({ success: false, error: 'Database not available in this environment' }, { status: 503 })
    }
    try {
      await db.delete(caseQuestions)
      await db.insert(caseQuestions).values(ALL_SEED_QUESTIONS)
      return NextResponse.json({ success: true, message: "Database questions successfully reset and re-seeded." })
    } catch (error) {
      console.error("Failed to reset and re-seed questions DB table:", error)
      return NextResponse.json({ success: false, error: 'Database write error' }, { status: 500 })
    }
  }

  if (!caseId) {
    return NextResponse.json({ success: false, error: 'caseId parameter required' }, { status: 400 })
  }

  const defaultForCase = ALL_SEED_QUESTIONS.filter(q => q.caseId === caseId)

  if (!isDbAvailable) {
    return NextResponse.json({ success: true, questions: defaultForCase })
  }

  try {
    let rows = await db.select().from(caseQuestions).where(eq(caseQuestions.caseId, caseId))
    if (rows.length === 0) {
      // Seed table with default questions if empty for this caseId
      if (defaultForCase.length > 0) {
        await db.insert(caseQuestions).values(defaultForCase)
        rows = await db.select().from(caseQuestions).where(eq(caseQuestions.caseId, caseId))
      }
    }
    return NextResponse.json({ success: true, questions: rows })
  } catch (error) {
    console.error(`Failed to get Case ${caseId} questions:`, error)
    return NextResponse.json({ success: false, error: 'Database read error' }, { status: 500 })
  }
}
