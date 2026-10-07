/*
# Create assessment results table for AI Literacy Assessment

1. New Tables
- `assessment_results`
  - `id` (uuid, primary key)
  - `student_name` (text, default 'Michael Oge')
  - `session_id` (integer, 1-9, unique per session)
  - `session_title` (text, name of the assessment section)
  - `answers` (jsonb, stores all question answers keyed by question number)
  - `auto_scores` (jsonb, auto-graded objective question scores)
  - `teacher_grades` (jsonb, teacher-graded short-answer and theory scores)
  - `objective_score` (integer, total objective points earned)
  - `theory_score` (integer, 0-5 rubric score for Q10)
  - `teacher_notes` (text, notes from tutor Favour)
  - `status` (text: 'not-started', 'in-progress', 'submitted', 'reviewed')
  - `created_at`, `updated_at` (timestamps)

2. Security
- Enable RLS on assessment_results.
- Single-tenant app (no sign-in): allow anon + authenticated full CRUD.
- Data is intentionally shared between student and tutor.
*/

CREATE TABLE IF NOT EXISTS assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL DEFAULT 'Michael Oge',
  session_id integer NOT NULL UNIQUE,
  session_title text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  auto_scores jsonb NOT NULL DEFAULT '{}',
  teacher_grades jsonb NOT NULL DEFAULT '{}',
  objective_score integer NOT NULL DEFAULT 0,
  theory_score integer NOT NULL DEFAULT 0,
  teacher_notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not-started',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assessment_results" ON assessment_results;
CREATE POLICY "anon_select_assessment_results"
ON assessment_results FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assessment_results" ON assessment_results;
CREATE POLICY "anon_insert_assessment_results"
ON assessment_results FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assessment_results" ON assessment_results;
CREATE POLICY "anon_update_assessment_results"
ON assessment_results FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assessment_results" ON assessment_results;
CREATE POLICY "anon_delete_assessment_results"
ON assessment_results FOR DELETE
TO anon, authenticated USING (true);
