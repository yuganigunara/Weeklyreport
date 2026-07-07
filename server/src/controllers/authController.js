import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

function signToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: '7d'
  });
}

function sendSession(res, user) {
  const token = signToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ user: sanitizeUser(user) });
}

export function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.validated.body;
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: role || 'member' });
    sendSession(res, user);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.verifyPassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!user.active) throw new AppError('This account is inactive', 403);
    sendSession(res, user);
  } catch (error) {
    next(error);
  }
}

export function logout(_req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}
