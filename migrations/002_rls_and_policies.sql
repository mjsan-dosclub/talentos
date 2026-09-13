-- ============================================================================
-- 002_rls_and_policies.sql: Row Level Security Policies for DOS Club TalentOS
-- ============================================================================

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_technology_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_session_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive Read/Write policies for authenticated web portal routes
CREATE POLICY "Public Read Institutions" ON institutions FOR SELECT USING (true);
CREATE POLICY "Public Write Institutions" ON institutions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Batches" ON batches FOR SELECT USING (true);
CREATE POLICY "Public Write Batches" ON batches FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Cohort Groups" ON cohort_groups FOR SELECT USING (true);
CREATE POLICY "Public Write Cohort Groups" ON cohort_groups FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Students" ON students FOR SELECT USING (true);
CREATE POLICY "Public Write Students" ON students FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Workshops" ON workshops FOR SELECT USING (true);
CREATE POLICY "Public Write Workshops" ON workshops FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Attendance" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Public Write Attendance" ON attendance_records FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Submissions" ON evidence_submissions FOR SELECT USING (true);
CREATE POLICY "Public Write Submissions" ON evidence_submissions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Inventory" ON student_technology_inventory FOR SELECT USING (true);
CREATE POLICY "Public Write Inventory" ON student_technology_inventory FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Public Write Certifications" ON certifications FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Assessments" ON external_assessments FOR SELECT USING (true);
CREATE POLICY "Public Write Assessments" ON external_assessments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Feedback" ON session_feedback FOR SELECT USING (true);
CREATE POLICY "Public Write Feedback" ON session_feedback FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Active Tokens" ON active_session_tokens FOR SELECT USING (true);
CREATE POLICY "Public Write Active Tokens" ON active_session_tokens FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Notifications" ON notification_dispatches FOR SELECT USING (true);
CREATE POLICY "Public Write Notifications" ON notification_dispatches FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Audit Logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Write Audit Logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
