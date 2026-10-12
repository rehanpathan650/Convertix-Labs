import jwt from 'jsonwebtoken';
import { isProd } from './env.js';

export const setSession = (res, user) =>
  res.cookie('token', jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' }), {
    httpOnly: true, sameSite: 'lax', secure: isProd && process.env.COOKIE_SECURE !== 'false', maxAge: 7 * 864e5,
  });

export function auth(req, res, next) {
  try { req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Please log in.' }); }
}
export const role = r => (req, res, next) =>
  req.user.role === r ? next() : res.status(403).json({ message: 'Not allowed.' });
