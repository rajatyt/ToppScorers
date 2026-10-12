import jwt from 'jsonwebtoken';
import ActiveSession from '../models/ActiveSession.js';
import User from '../models/User.js';

export const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'toppscorers_jwt_access_secret_key';
export const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'toppscorers_jwt_refresh_secret_key');

export const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days
export const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes in ms
export const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
});

export const parseDevice = (userAgent = '') => {
  if (!userAgent || typeof userAgent !== 'string') return 'Unknown Device';
  
  let browser = 'Browser';
  if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) browser = 'Safari';
  else if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('PostmanRuntime')) browser = 'Postman API Client';

  let os = 'Unknown OS';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS') || userAgent.includes('Macintosh')) os = 'macOS';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  else if (userAgent.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
};

export const createSessionAndTokens = async (user, req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || 'Unknown IP';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const device = parseDevice(userAgent);

  // 1. Create session document in DB
  const session = new ActiveSession({
    userId: user._id,
    device,
    userAgent,
    ip,
    isValid: true,
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE)
  });

  // 2. Generate short-lived Access Token (15 min)
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, sessionId: session._id },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // 3. Generate long-lived Refresh Token (30 days)
  const refreshToken = jwt.sign(
    { id: user._id, sessionId: session._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  session.token = accessToken;
  session.refreshToken = refreshToken;
  await session.save();

  // 4. Set httpOnly cookies
  const cookieOpts = getCookieOptions();

  res.cookie('accessToken', accessToken, {
    ...cookieOpts,
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOpts,
    maxAge: REFRESH_COOKIE_MAX_AGE
  });

  // Legacy/alias cookie for backwards compatibility
  res.cookie('token', accessToken, {
    ...cookieOpts,
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  return { accessToken, refreshToken, sessionId: session._id };
};

export const clearAuthCookies = (res) => {
  const cookieOpts = getCookieOptions();
  res.clearCookie('accessToken', cookieOpts);
  res.clearCookie('refreshToken', cookieOpts);
  res.clearCookie('token', cookieOpts);
};

export const createAdminSessionAndTokens = async (user, req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || 'Unknown IP';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const device = parseDevice(userAgent);

  const session = new ActiveSession({
    userId: user._id,
    device: `Admin Portal: ${device}`,
    userAgent,
    ip,
    isValid: true,
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE)
  });

  const accessToken = jwt.sign(
    { id: user._id, role: 'admin', sessionId: session._id, scope: 'admin' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: user._id, sessionId: session._id, scope: 'admin' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  session.token = accessToken;
  session.refreshToken = refreshToken;
  await session.save();

  const cookieOpts = getCookieOptions();

  res.cookie('adminAccessToken', accessToken, {
    ...cookieOpts,
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  res.cookie('adminRefreshToken', refreshToken, {
    ...cookieOpts,
    maxAge: REFRESH_COOKIE_MAX_AGE
  });

  return { accessToken, refreshToken, sessionId: session._id };
};

export const clearAdminCookies = (res) => {
  const cookieOpts = getCookieOptions();
  res.clearCookie('adminAccessToken', cookieOpts);
  res.clearCookie('adminRefreshToken', cookieOpts);
};

export const verifyAndReissueAccessToken = async (refreshToken, res) => {
  if (!refreshToken) return null;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    if (!decoded || !decoded.sessionId || !decoded.id) return null;

    // Check DB session
    const session = await ActiveSession.findOne({
      _id: decoded.sessionId,
      isValid: true
    });

    if (!session) return null;

    // Check User
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) return null;

    // Reissue new access token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, sessionId: session._id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Update session in DB
    session.token = newAccessToken;
    session.lastActive = new Date();
    await session.save();

    // Reissue cookies
    if (res) {
      const cookieOpts = getCookieOptions();
      res.cookie('accessToken', newAccessToken, {
        ...cookieOpts,
        maxAge: ACCESS_COOKIE_MAX_AGE
      });
      res.cookie('token', newAccessToken, {
        ...cookieOpts,
        maxAge: ACCESS_COOKIE_MAX_AGE
      });
      res.setHeader('x-access-token', newAccessToken);
    }

    return { user, accessToken: newAccessToken, session };
  } catch (err) {
    return null;
  }
};
