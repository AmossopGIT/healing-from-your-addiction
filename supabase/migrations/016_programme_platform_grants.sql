-- Service role + authenticated grants for programme platform tables

GRANT SELECT, INSERT, UPDATE, DELETE ON enrollment_schedules TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_homework_tasks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_homework_entries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_points_ledger TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_docs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON enrollment_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_homework_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_homework_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_points_ledger TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_docs TO authenticated;
