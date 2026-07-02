import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    teamName: text('team_name'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow(),
})

export const timelineProgress = pgTable('timeline_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    timelineId: text('timeline_id').notNull(),
    status: text('status').notNull().$type<'locked' | 'active' | 'completed'>(),
    completedAt: timestamp('completed_at'),
    fragmentRecovered: boolean('fragment_recovered').default(false),
}, (t) => [
    uniqueIndex('timeline_progress_user_timeline_idx').on(t.userId, t.timelineId)
])

export const puzzleEvents = pgTable('puzzle_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    timelineId: text('timeline_id').notNull(),
    puzzleId: text('puzzle_id').notNull(),
    answerHash: text('answer_hash').notNull(),
    outcome: text('outcome').notNull().$type<'correct' | 'wrong'>(),
    timestamp: timestamp('timestamp').defaultNow(),
}, (t) => [
    index('puzzle_events_user_outcome_idx').on(t.userId, t.outcome)
])

export const fragments = pgTable('fragments', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    timelineId: text('timeline_id').notNull(),
    recoveredAt: timestamp('recovered_at').defaultNow(),
    evidenceLogUnlocked: boolean('evidence_log_unlocked').default(true),
}, (t) => [
    uniqueIndex('fragments_user_timeline_idx').on(t.userId, t.timelineId)
])

export const emailTransmissions = pgTable('email_transmissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    sector: text('sector').notNull(),
    stageId: integer('stage_id').notNull(),
    answer: text('answer').notNull(),
    recoveryKey: text('recovery_key').notNull().unique(),
    isVerified: boolean('is_verified').default(false),
    sentAt: timestamp('sent_at').defaultNow(),
    verifiedAt: timestamp('verified_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    resendCount: integer('resend_count').default(0),
    lastResentAt: timestamp('last_resent_at'),
    deliveryStatus: text('delivery_status').default('pending'),
    deliveryError: text('delivery_error'),
}, (t) => [
    index('email_transmissions_email_sent_idx').on(t.email, t.sentAt)
])

export const case01Questions = pgTable('case01_questions', {
    id: uuid('id').primaryKey().defaultRandom(),
    anomalyId: text('anomaly_id').notNull(),
    puzzleIndex: integer('puzzle_index').notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
}, (t) => [
    index('case01_questions_anomaly_puzzle_idx').on(t.anomalyId, t.puzzleIndex)
])

export const caseQuestions = pgTable('case_questions', {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: text('case_id').notNull(),
    puzzleKey: text('puzzle_key').notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
}, (t) => [
    index('case_questions_case_puzzle_idx').on(t.caseId, t.puzzleKey)
])

export const userProgress = pgTable('user_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    caseId: text('case_id').notNull(),
    progressKey: text('progress_key').notNull(),
    progressValue: text('progress_value').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
    uniqueIndex('user_progress_user_case_key_idx').on(t.userId, t.caseId, t.progressKey),
    index('user_progress_user_case_idx').on(t.userId, t.caseId)
])