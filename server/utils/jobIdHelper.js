import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';

/**
 * Generate a unique memorable Job ID for Teachers (e.g. JOB-T1001, JOB-T1002...)
 */
export async function generateTeacherJobId() {
  const count = await TeacherProfile.countDocuments({ jobId: { $exists: true, $ne: '' } });
  let nextNum = 1001 + count;
  let candidate = `JOB-T${nextNum}`;
  while (await TeacherProfile.findOne({ jobId: candidate })) {
    nextNum++;
    candidate = `JOB-T${nextNum}`;
  }
  return candidate;
}

/**
 * Generate a unique memorable Job ID for Students (e.g. JOB-S1001, JOB-S1002...)
 */
export async function generateStudentJobId() {
  const count = await StudentProfile.countDocuments({ jobId: { $exists: true, $ne: '' } });
  let nextNum = 1001 + count;
  let candidate = `JOB-S${nextNum}`;
  while (await StudentProfile.findOne({ jobId: candidate })) {
    nextNum++;
    candidate = `JOB-S${nextNum}`;
  }
  return candidate;
}

/**
 * Automatically assign Job IDs to existing profiles that do not have one yet.
 */
export async function backfillJobIds() {
  try {
    const teachersWithoutId = await TeacherProfile.find({
      $or: [{ jobId: { $exists: false } }, { jobId: '' }, { jobId: null }]
    }).sort({ createdAt: 1 });

    for (const teacher of teachersWithoutId) {
      teacher.jobId = await generateTeacherJobId();
      await teacher.save();
    }

    const studentsWithoutId = await StudentProfile.find({
      $or: [{ jobId: { $exists: false } }, { jobId: '' }, { jobId: null }]
    }).sort({ createdAt: 1 });

    for (const student of studentsWithoutId) {
      student.jobId = await generateStudentJobId();
      await student.save();
    }
  } catch (err) {
    console.error('Error backfilling Job IDs:', err);
  }
}
