import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { AppError } from '../utils/AppError.js';

export async function protectAdmin(req, _res, next) {
  try {
    const token =
      req.signedCookies?.adminToken ||
      req.cookies?.adminToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      throw new AppError('Admin account not found', 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAdmin(req, _res, next) {
  try {
    const token =
      req.signedCookies?.adminToken ||
      req.cookies?.adminToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === 'admin') {
        const admin = await Admin.findById(decoded.id).select('-password');
        if (admin) {
          req.admin = admin;
        }
      }
    } catch (err) {
      // invalid token, just ignore
    }
    next();
  } catch (error) {
    next();
  }
}
