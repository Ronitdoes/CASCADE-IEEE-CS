const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const seedQuestions = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/case_01_questions.json'), 'utf8')
);

async function run() {
  const sql = neon(dbUrl);
  console.log("Purging old case_questions for case_id '01'...");
  await sql`
    DELETE FROM case_questions WHERE case_id = '01';
  `;

  console.log("Seeding Case File 01 granular questions & answers...");
  for (const q of seedQuestions) {
    console.log(`Inserting puzzle key: ${q.puzzle_key}`);
    await sql`
      INSERT INTO case_questions (id, case_id, puzzle_key, question, answer)
      VALUES (gen_random_uuid(), '01', ${q.puzzle_key}, ${q.question}, ${q.answer});
    `;
  }

  console.log("Seeding Case File 01 successful!");
}

run().catch(err => {
  console.error("Seeding Case File 01 failed:", err);
  process.exit(1);
});
