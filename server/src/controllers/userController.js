import { sanitizeUser } from './authController.js';
import { User } from '../models/User.js';

export async function listUsers(_req, res, next) {
  try {
    const users = await User.find().select('-passwordHash').sort({ name: 1 });
    res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.validated.params.id,
      { role: req.validated.body.role },
      { new: true }
    ).select('-passwordHash');
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}
