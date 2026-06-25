import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { findUserById, publicUser } from '../data/jsonDb.js';

const jwtSecret = process.env.JWT_SECRET || 'zentra-dev-secret';

export async function protect(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = isMongoConnected()
      ? await User.findById(decoded.id).select('-password')
      : publicUser(await findUserById(decoded.id));
    if (!req.user) return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    next();
  }
  catch { res.status(401).json({ message: 'Your session has expired. Please sign in again.' }); }
}
export function admin(req, res, next) { return req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required.' }); }
