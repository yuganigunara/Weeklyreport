import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies.token;
    if (!token) throw new AppError('Authentication required', 401);

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user || !user.active) throw new AppError('Authentication required', 401);

    req.user = user;
    next();
  } catch (error) {
    next(error.status ? error : new AppError('Authentication required', 401));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}
