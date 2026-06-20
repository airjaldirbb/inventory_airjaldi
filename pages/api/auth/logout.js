// pages/api/auth/logout.js

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed',
    });
  }

  const isProd = process.env.NODE_ENV === 'production';

  res.setHeader('Set-Cookie', [
    `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; ${
      isProd ? 'Secure;' : ''
    }`,
  ]);

  return res.status(200).json({
    message: 'Logged out successfully',
  });
}