import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';

/**
 * Clean phone number to digits only.
 */
export const cleanPhoneDigits = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  return phone.trim().replace(/\D/g, '');
};

/**
 * Validates that an email is unique across all users.
 * @param {string} email - The email to check
 * @param {string|mongoose.Types.ObjectId|null} excludeUserId - User ID to exclude (for updates)
 * @returns {Promise<{ isValid: boolean, message?: string, email?: string }>}
 */
export const validateUniqueEmail = async (email, excludeUserId = null) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { isValid: false, message: 'Email address is required.' };
  }

  const normalized = email.trim().toLowerCase();
  
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { isValid: false, message: 'Please provide a valid email address.' };
  }

  const query = { email: normalized };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existing = await User.findOne(query);
  if (existing) {
    return {
      isValid: false,
      message: 'This email address is already registered. Please sign in or use a different email.'
    };
  }

  return { isValid: true, email: normalized };
};

/**
 * Validates that a phone number is unique across all users and teacher profiles.
 * @param {string} phone - The phone to check
 * @param {string|mongoose.Types.ObjectId|null} excludeUserId - User ID to exclude (for updates)
 * @param {boolean} required - Whether phone is mandatory
 * @returns {Promise<{ isValid: boolean, message?: string, phone?: string }>}
 */
export const validateUniquePhone = async (phone, excludeUserId = null, required = false) => {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    if (required) {
      return { isValid: false, message: 'Phone number is required.' };
    }
    return { isValid: true, phone: '' };
  }

  const trimmed = phone.trim();
  const digits = cleanPhoneDigits(trimmed);

  // Validate mobile format (should have at least 10 digits)
  if (digits.length < 10) {
    return {
      isValid: false,
      message: 'Please enter a valid mobile number with at least 10 digits.'
    };
  }

  // The last 10 digits represent the core subscriber number
  const last10 = digits.slice(-10);
  const flexiblePattern = last10.split('').join('[\\s\\-\\.]*');
  const flexibleRegex = new RegExp(`${flexiblePattern}$`);

  // 1. Check User model
  const userQuery = {
    phone: { $exists: true, $nin: ['', null] },
    $or: [
      { phone: trimmed },
      { phone: digits },
      { phone: flexibleRegex }
    ]
  };
  if (excludeUserId) {
    userQuery._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(userQuery);
  if (existingUser) {
    return {
      isValid: false,
      message: 'This phone number is already registered by another account. Please use a unique phone number.'
    };
  }

  // 2. Check TeacherProfile model (verificationPhone)
  const teacherQuery = {
    verificationPhone: { $exists: true, $nin: ['', null] },
    $or: [
      { verificationPhone: trimmed },
      { verificationPhone: digits },
      { verificationPhone: flexibleRegex }
    ]
  };
  if (excludeUserId) {
    teacherQuery.userId = { $ne: excludeUserId };
  }

  const existingTeacher = await TeacherProfile.findOne(teacherQuery);
  if (existingTeacher) {
    return {
      isValid: false,
      message: 'This phone number is already registered for teacher verification by another account. Please use a unique phone number.'
    };
  }

  return { isValid: true, phone: trimmed };
};
