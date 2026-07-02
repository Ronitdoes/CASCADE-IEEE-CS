CREATE TABLE IF NOT EXISTS "case01_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anomaly_id" text NOT NULL,
	"puzzle_index" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "case_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" text NOT NULL,
	"puzzle_key" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_transmissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"sector" text NOT NULL,
	"stage_id" integer NOT NULL,
	"answer" text NOT NULL,
	"recovery_key" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"sent_at" timestamp DEFAULT now(),
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"resend_count" integer DEFAULT 0,
	"last_resent_at" timestamp,
	"delivery_status" text DEFAULT 'pending',
	"delivery_error" text,
	CONSTRAINT "email_transmissions_recovery_key_unique" UNIQUE("recovery_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fragments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"timeline_id" text NOT NULL,
	"recovered_at" timestamp DEFAULT now(),
	"evidence_log_unlocked" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leaderboard" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"fragment_count" integer DEFAULT 0,
	"completion_timestamp" timestamp,
	"hint_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "puzzle_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"timeline_id" text NOT NULL,
	"puzzle_id" text NOT NULL,
	"answer_hash" text NOT NULL,
	"outcome" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeline_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"timeline_id" text NOT NULL,
	"status" text NOT NULL,
	"completed_at" timestamp,
	"fragment_recovered" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"case_id" text NOT NULL,
	"progress_key" text NOT NULL,
	"progress_value" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"team_name" text,
	"password" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fragments" ADD CONSTRAINT "fragments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "puzzle_events" ADD CONSTRAINT "puzzle_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_progress" ADD CONSTRAINT "timeline_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DELETE FROM "timeline_progress" a USING "timeline_progress" b WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.timeline_id = b.timeline_id;
--> statement-breakpoint
DELETE FROM "user_progress" a USING "user_progress" b WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.case_id = b.case_id AND a.progress_key = b.progress_key;
--> statement-breakpoint
DELETE FROM "fragments" a USING "fragments" b WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.timeline_id = b.timeline_id;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fragments_user_timeline_idx" ON "fragments" USING btree ("user_id","timeline_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "timeline_progress_user_timeline_idx" ON "timeline_progress" USING btree ("user_id","timeline_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_progress_user_case_key_idx" ON "user_progress" USING btree ("user_id","case_id","progress_key");