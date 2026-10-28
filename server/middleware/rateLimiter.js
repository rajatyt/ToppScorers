import rateLimit from 'express-rate-limit';

export const directoryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after a minute.'
  }
});

export const profileViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many profile views requested, please slow down.'
  }
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many password reset requests. Please try again after 15 minutes.'
  }
});

// Stricter rate limiters for authentication endpoints to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this network. Please wait 15 minutes before trying again.'
  }
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // max 15 account creations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many account registrations from this network. Please wait an hour before registering again.'
  }
});

export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 admin login attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many administrator login attempts. Access is temporarily rate limited. Please try again later.'
  }
});
