import ConnectionRequest from '../models/ConnectionRequest.js';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9246639642:AAF3Oku7iy7QdPxx6L-hwDHTXwBBGLAKWpM';
export const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '1023075024';

/**
 * Send an HTML formatted Telegram message to the administrator
 */
export async function sendTelegramMessage(text, options = {}) {
  const token = options.token || TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId || TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] Bot token or Chat ID not configured');
    return { success: false, error: 'Telegram credentials missing' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: options.parseMode || 'HTML',
      disable_web_page_preview: options.disableWebPagePreview !== undefined ? options.disableWebPagePreview : true
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[Telegram] API error response:', data);
      return { success: false, error: data.description || 'Telegram API request failed', data };
    }

    return { success: true, messageId: data.result?.message_id, data };
  } catch (err) {
    console.error('[Telegram] Network/send error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Triggered whenever a new connection request / inquiry is sent or re-opened
 * Sends instant rich lead notification to Admin in Telegram
 */
export async function notifyTelegramNewLead(connectionRequest) {
  try {
    let reqDoc = connectionRequest;
    if (!reqDoc.fromUserId?.name || !reqDoc.toUserId?.name) {
      reqDoc = await ConnectionRequest.findById(connectionRequest._id || connectionRequest)
        .populate('fromUserId', 'name email phone role isMinor')
        .populate('toUserId', 'name email phone role isMinor');
    }

    if (!reqDoc || !reqDoc.fromUserId || !reqDoc.toUserId) return;

    const fromUser = reqDoc.fromUserId;
    const toUser = reqDoc.toUserId;

    // Fetch matching profiles
    let fromProf = null;
    let toProf = null;

    if (fromUser.role === 'teacher') {
      fromProf = await TeacherProfile.findOne({ userId: fromUser._id }).lean();
    } else if (fromUser.role === 'student') {
      fromProf = await StudentProfile.findOne({ userId: fromUser._id }).lean();
    }

    if (toUser.role === 'teacher') {
      toProf = await TeacherProfile.findOne({ userId: toUser._id }).lean();
    } else if (toUser.role === 'student') {
      toProf = await StudentProfile.findOne({ userId: toUser._id }).lean();
    }

    const isStudentInitiated = fromUser.role === 'student';
    const leadTypeTitle = isStudentInitiated
      ? 'Student ➔ Teacher Request'
      : (fromUser.role === 'teacher' && toUser.role === 'student')
      ? 'Teacher ➔ Student Request'
      : 'Direct Matchmaking Connection Lead';

    const subjects = fromProf?.subjectsNeeded?.join(', ') ||
      fromProf?.subjects?.join(', ') ||
      toProf?.subjects?.join(', ') ||
      toProf?.subjectsNeeded?.join(', ') ||
      'General School / Tuition Subjects';

    const examOrClass = fromProf?.classOrExam || toProf?.classOrExam ||
      (Array.isArray(toProf?.exams) ? toProf.exams.join(', ') : '') ||
      'All Boards & Competitive Levels';

    const locationCity = fromProf?.location?.city || toProf?.location?.city || 'Prayagraj';
    const locationArea = fromProf?.area || toProf?.area || '';
    const fullLocation = locationArea ? `${locationArea}, ${locationCity}` : locationCity;

    const feeAmount = toProf?.fee?.amount || fromProf?.fee?.amount ||
      fromProf?.budget?.max || toProf?.budget?.max || null;
    const feePeriod = toProf?.fee?.period || fromProf?.fee?.period || 'month';
    const feeDisplay = feeAmount ? `₹${feeAmount} / ${feePeriod}` : 'Flexible / Negotiable';

    const messageText = (reqDoc.message || '').trim() || 'Hi, I would like to connect with you regarding tuition on ToppScorers.';

    const text = `🎯 <b>NEW LEAD IN ALL PIPELINE LEADS!</b>

📌 <b>Lead Category:</b> ${leadTypeTitle}
⚡ <b>Status:</b> Pending Admin & Tutor Matchmaking

👤 <b>Initiated By (${fromUser.role ? fromUser.role.toUpperCase() : 'USER'}):</b>
• <b>Name:</b> ${fromUser.name || 'Anonymous'}
• <b>Phone:</b> ${fromUser.phone || fromProf?.verificationPhone || 'Not shared'}
• <b>Email:</b> ${fromUser.email || 'Not shared'}

🎯 <b>Target Candidate (${toUser.role ? toUser.role.toUpperCase() : 'USER'}):</b>
• <b>Name:</b> ${toUser.name || 'Anonymous'}
• <b>Phone:</b> ${toUser.phone || toProf?.verificationPhone || 'Not shared'}
• <b>Email:</b> ${toUser.email || 'Not shared'}

📚 <b>Subject(s):</b> ${subjects}
🎯 <b>Class / Exam:</b> ${examOrClass}
📍 <b>Location:</b> ${fullLocation}
💰 <b>Tuition Fee / Budget:</b> ${feeDisplay}

💬 <b>Lead Message:</b>
<i>"${messageText}"</i>

🔗 <b>Manage All Pipeline Leads:</b>
https://toppscorers-1024664791682.asia-south2.run.app/admin/connections`;

    await sendTelegramMessage(text);
  } catch (err) {
    console.error('[Telegram] Error in notifyTelegramNewLead:', err.message);
  }
}

/**
 * Triggered whenever a connection request is accepted (mutual match made)
 */
export async function notifyTelegramLeadAccepted(connectionRequest) {
  try {
    let reqDoc = connectionRequest;
    if (!reqDoc.fromUserId?.name || !reqDoc.toUserId?.name) {
      reqDoc = await ConnectionRequest.findById(connectionRequest._id || connectionRequest)
        .populate('fromUserId', 'name email phone role isMinor')
        .populate('toUserId', 'name email phone role isMinor');
    }

    if (!reqDoc || !reqDoc.fromUserId || !reqDoc.toUserId) return;

    const fromUser = reqDoc.fromUserId;
    const toUser = reqDoc.toUserId;

    const teacherUser = fromUser.role === 'teacher' ? fromUser : toUser;
    const studentUser = fromUser.role === 'student' ? fromUser : toUser;

    const teacherProf = await TeacherProfile.findOne({ userId: teacherUser._id }).lean();
    const studentProf = await StudentProfile.findOne({ userId: studentUser._id }).lean();

    const subjects = studentProf?.subjectsNeeded?.join(', ') || teacherProf?.subjects?.join(', ') || 'Tuition Subjects';
    const city = studentProf?.location?.city || teacherProf?.location?.city || 'Prayagraj';
    const area = studentProf?.area || teacherProf?.area || '';
    const fee = reqDoc.tuitionFee || teacherProf?.fee?.amount || studentProf?.budget?.max || 0;

    const text = `🤝 <b>PIPELINE LEAD ACCEPTED / MUTUAL MATCH!</b>

🎉 <b>Student & Teacher Connection Established!</b>

👨‍🏫 <b>Teacher:</b> ${teacherUser.name}
• <b>Phone:</b> ${teacherUser.phone || teacherProf?.verificationPhone || 'N/A'}
• <b>Email:</b> ${teacherUser.email}

🎓 <b>Student / Parent:</b> ${studentUser.name}
• <b>Phone:</b> ${studentUser.phone || studentProf?.verificationPhone || 'N/A'}
• <b>Email:</b> ${studentUser.email}

📚 <b>Subject(s):</b> ${subjects}
📍 <b>Location:</b> ${area ? `${area}, ${city}` : city}
💰 <b>Fee Expected:</b> ${fee ? `₹${fee}` : 'Flexible'}

⚡ <b>Action Required:</b> Facilitate intro, trial session & commission tracking.
🔗 <b>Open Connection Pipeline:</b>
https://toppscorers-1024664791682.asia-south2.run.app/admin/connections`;

    await sendTelegramMessage(text);
  } catch (err) {
    console.error('[Telegram] Error in notifyTelegramLeadAccepted:', err.message);
  }
}

/**
 * Triggered when admin updates matchmaking status or commission in All Pipeline Leads
 */
export async function notifyTelegramLeadStatusUpdate(connectionRequest, statusChange = {}) {
  try {
    let reqDoc = connectionRequest;
    if (!reqDoc.fromUserId?.name || !reqDoc.toUserId?.name) {
      reqDoc = await ConnectionRequest.findById(connectionRequest._id || connectionRequest)
        .populate('fromUserId', 'name email phone role')
        .populate('toUserId', 'name email phone role');
    }
    if (!reqDoc) return;

    const text = `📋 <b>PIPELINE LEAD STATUS UPDATED</b>

📌 <b>Lead:</b> ${reqDoc.fromUserId?.name || 'User'} ➔ ${reqDoc.toUserId?.name || 'User'}
⚡ <b>Admin Lead Status:</b> ${(statusChange.adminLeadStatus || reqDoc.adminLeadStatus || 'Updated').toUpperCase()}
💰 <b>Commission Status:</b> ${(statusChange.commissionStatus || reqDoc.commissionStatus || 'Pending').toUpperCase()}
💵 <b>Commission Received:</b> ₹${statusChange.commissionReceived !== undefined ? statusChange.commissionReceived : (reqDoc.commissionReceived || 0)}
📝 <b>Admin Note:</b> ${statusChange.adminNotes || reqDoc.adminNotes || 'None'}

🔗 <b>Pipeline Center:</b>
https://toppscorers-1024664791682.asia-south2.run.app/admin/connections`;

    await sendTelegramMessage(text);
  } catch (err) {
    console.error('[Telegram] Error in notifyTelegramLeadStatusUpdate:', err.message);
  }
}
