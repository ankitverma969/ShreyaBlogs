import jwt from 'jsonwebtoken';

export function signAdminToken(adminId) {
  return jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    signed: Boolean(process.env.COOKIE_SECRET),
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}
