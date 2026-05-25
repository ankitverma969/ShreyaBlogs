import Admin from '../models/Admin.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCookieOptions, signAdminToken } from '../utils/jwt.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sendAdmin(admin) {
  return {
    id: admin._id,
    email: admin.email,
    createdAt: admin.createdAt
  };
}

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError('Please enter a valid email address', 400);
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

  if (!admin) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordCorrect = await admin.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signAdminToken(admin._id);

  res.cookie('adminToken', token, getCookieOptions());
  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    admin: sendAdmin(admin)
  });
});

export const logoutAdmin = asyncHandler(async (_req, res) => {
  res.clearCookie('adminToken', {
    ...getCookieOptions(),
    maxAge: 0
  });

  res.status(200).json({
    success: true,
    message: 'Admin logged out'
  });
});

export const getAdminMe = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(200).json({
      success: true,
      admin: null
    });
  }

  res.status(200).json({
    success: true,
    admin: sendAdmin(req.admin)
  });
});
