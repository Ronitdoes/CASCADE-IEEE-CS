CREATE INDEX "case01_questions_anomaly_puzzle_idx" ON "case01_questions" USING btree ("anomaly_id","puzzle_index");--> statement-breakpoint
CREATE INDEX "case_questions_case_puzzle_idx" ON "case_questions" USING btree ("case_id","puzzle_key");--> statement-breakpoint
CREATE INDEX "email_transmissions_email_sent_idx" ON "email_transmissions" USING btree ("email","sent_at");--> statement-breakpoint
CREATE INDEX "puzzle_events_user_outcome_idx" ON "puzzle_events" USING btree ("user_id","outcome");--> statement-breakpoint
CREATE INDEX "user_progress_user_case_idx" ON "user_progress" USING btree ("user_id","case_id");