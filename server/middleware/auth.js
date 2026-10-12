import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActiveSession from '../models/ActiveSession.js';
import { 
  ACCESS_TOKEN_SECRET, 
  verifyAndReissueAccessToken, 
  clearAuthCookies,
  clearAdminCookies
} from '../utils/tokenService.js';

export const authenticate = async (req, res, next) => {
  const isAdminRoute = req.originalUrl?.startsWith('/api/admin') || 
                       req.originalUrl?.startsWith('/api/auth/admin') || 
                       req.headers['x-auth-scope'] === 'admin';

  const clearCookiesForScope = (response) => {
    if (isAdminRoute) {
      clearAdminCookies(response);
    } else {
      clearAuthCookies(response);
    }
  };

  try {
    let accessToken = null;
    let refreshToken = null;

    if (isAdminRoute) {
      accessToken = req.headers['x-admin-token'] ||
                    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null) ||
                    req.cookies?.adminAccessToken ||
                    req.cookies?.accessToken ||
                    req.cookies?.token;
      refreshToken = req.cookies?.adminRefreshToken || req.cookies?.refreshToken;
    } else {
      accessToken = req.cookies?.accessToken || 
                    req.cookies?.token || 
                    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
      refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
    }

    // 1. Try verifying the access token first (15-min life)
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        
        // Check session validity in DB if sessionId is present in token payload
        if (decoded.sessionId) {
          const session = await ActiveSession.findOne({ _id: decoded.sessionId, isValid: true });
          if (!session) {
            clearCookiesForScope(res);
            return res.status(401).json({ message: 'Session has been revoked or expired. Please login again.' });
          }
        }

        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user && user.isActive) {
          req.user = user;
          req.token = accessToken;
          req.sessionId = decoded.sessionId;
          return next();
        }
      } catch (tokenErr) {
        // Access token expired (TokenExpiredError) or invalid - fall through to refresh token
      }
    }

    // 2. If access token is expired or missing, attempt to use refresh token (7-30d) to reissue
    if (refreshToken) {
      const reissued = await verifyAndReissueAccessToken(refreshToken, res);
      if (reissued) {
        req.user = reissued.user;
        req.token = reissued.accessToken;
        req.sessionId = reissued.session._id;
        return next();
      }
    }

    // 3. Both failed or no credentials provided
    clearCookiesForScope(res);
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  } catch (error) {
    clearCookiesForScope(res);
    return res.status(401).json({ message: 'Not authorized, session validation failed' });
  }
};

/**
 * Optional authentication: attaches req.user if a valid token or refresh token is present,
 * but allows unauthenticated requests to proceed with req.user = null.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken || req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        if (decoded.sessionId) {
          const session = await ActiveSession.findOne({ _id: decoded.sessionId, isValid: true });
          if (!session) {
            req.user = null;
            return next();
          }
        }
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user && user.isActive) {
          req.user = user;
          req.token = accessToken;
          req.sessionId = decoded.sessionId;
          return next();
        }
      } catch (err) {
        // Fall through to refresh
      }
    }

    if (refreshToken) {
      const reissued = await verifyAndReissueAccessToken(refreshToken, res);
      if (reissued) {
        req.user = reissued.user;
        req.token = reissued.accessToken;
        req.sessionId = reissued.session._id;
        return next();
      }
    }

    req.user = null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
