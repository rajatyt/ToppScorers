import AdminNotification from '../models/AdminNotification.js';
import Query from '../models/Query.js';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';

export async function checkAndNotifyPhoneChange({ user, oldPhone, newPhone }) {
  if (!oldPhone || !newPhone || oldPhone.trim() === newPhone.trim()) {
    return null;
  }

  // Check if user is verified tutor or student
  let isVerified = false;
  let jobId = '';

  if (user.role === 'teacher') {
    const teacherProfile = await TeacherProfile.findOne({ userId: user._id });
    if (teacherProfile) {
      jobId = teacherProfile.jobId || '';
      isVerified = teacherProfile.isVerified || teacherProfile.verificationStatus === 'verified';
    }
  } else if (user.role === 'student') {
    const studentProfile = await StudentProfile.findOne({ userId: user._id });
    if (studentProfile) {
      jobId = studentProfile.jobId || '';
      isVerified = Boolean(studentProfile.isVerified || studentProfile.contactVerified || studentProfile.verificationStatus === 'verified');
    }
  }

  // "when a verified student/tutor changes his phonenumber is future i want a notification in my admin panal about the change so that i can update it personally"
  if (!isVerified) {
    return null;
  }

  // 1. Create AdminNotification record
  const notification = await AdminNotification.create({
    type: 'phone_change',
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    role: user.role,
    jobId,
    isVerified,
    oldPhone: oldPhone.trim(),
    newPhone: newPhone.trim(),
    notes: `Verified ${user.role === 'teacher' ? 'tutor' : 'student'} updated their contact phone number from ${oldPhone.trim()} to ${newPhone.trim()}. Please update official records personally.`,
    status: 'pending',
    viewedByAdmin: false
  });

  // 2. Also create an urgent Query record so it integrates with Query Manager and alerts admin badges
  try {
    await Query.create({
      userId: user._id,
      jobId,
      name: user.name,
      email: user.email,
      phone: newPhone.trim(),
      role: user.role,
      subject: `🚨 Verified ${user.role === 'teacher' ? 'Tutor' : 'Student'} Phone Changed: ${oldPhone.trim()} ➔ ${newPhone.trim()}`,
      category: 'profile_verification',
      priority: 'urgent',
      status: 'open',
      adminViewed: false,
      userViewed: true,
      message: `AUTOMATED SYSTEM ALERT:
Verified ${user.role === 'teacher' ? 'Tutor' : 'Student'} "${user.name}" (${jobId || user.email}) has changed their registered phone number.

• Old Phone Number: ${oldPhone.trim()}
• New Phone Number: ${newPhone.trim()}
• User ID: ${user._id}

Action Required: Please verify and update their phone number personally in administrative records.`
    });
  } catch (qErr) {
    console.error('Error creating query alert for phone change:', qErr);
  }

  return notification;
}
