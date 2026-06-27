// Mirrors public.school_for_email() in supabase/migrations/0005_user_sync_trigger.sql
// (the DB trigger is what writes verified/school to the users table) — keep
// both lists in sync when adding domains.
const SCHOOL_DOMAINS = {
  'u.nus.edu.sg': 'NUS',
  'nus.edu.sg': 'NUS',
  'comp.nus.edu.sg': 'NUS',
  'u.yale-nus.edu.sg': 'NUS',
  'e.ntu.edu.sg': 'NTU',
  'ntu.edu.sg': 'NTU',
  'student.ntu.edu.sg': 'NTU',
  'nie.edu.sg': 'NTU',
  'smu.edu.sg': 'SMU',
  'sis.smu.edu.sg': 'SMU',
  'accountancy.smu.edu.sg': 'SMU',
  'business.smu.edu.sg': 'SMU',
  'economics.smu.edu.sg': 'SMU',
  'law.smu.edu.sg': 'SMU',
  'socsc.smu.edu.sg': 'SMU',
  'mymail.sutd.edu.sg': 'SUTD',
};

export function getSchoolVerification(email) {
  if (!email) return { verified: false, school: null };
  const domain = email.split('@')[1]?.toLowerCase();
  const school = SCHOOL_DOMAINS[domain] ?? null;
  return { verified: !!school, school };
}
