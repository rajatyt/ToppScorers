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

/**
 * Validates password strength (min 8 chars, at least 1 letter and 1 number/symbol).
 * @param {string} password 
 * @returns {{ isValid: boolean, message?: string }}
 */
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password must not exceed 128 characters.' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSymbol = /[0-9\W_]/.test(password);

  if (!hasLetter || !hasDigitOrSymbol) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter and at least one number or special character.'
    };
  }

  return { isValid: true };
};

/**
 * Sanitizes and validates a full name.
 * @param {string} name 
 * @returns {{ isValid: boolean, message?: string, name?: string }}
 */
export const cleanAndValidateName = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, message: 'Full name is required.' };
  }

  // Strip HTML tags and control characters
  const cleaned = name.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();

  if (cleaned.length < 2) {
    return { isValid: false, message: 'Full name must be at least 2 characters.' };
  }

  if (cleaned.length > 70) {
    return { isValid: false, message: 'Full name must not exceed 70 characters.' };
  }

  // Reject names with dangerous scripting symbols
  if (/[<>{}$`\\]/.test(cleaned)) {
    return { isValid: false, message: 'Name contains invalid characters.' };
  }

  return { isValid: true, name: cleaned };
};

/**
 * General string sanitizer: strips HTML tags, control chars, limits length.
 */
export const sanitizeString = (str, maxLength = 500) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()
    .slice(0, maxLength);
};
