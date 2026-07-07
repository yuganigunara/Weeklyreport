import { ZodError } from 'zod';

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }

  const status = error.status || 500;
  res.status(status).json({ message: error.message || 'Server error' });
}
