import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  try {

    if (req.method === 'GET') {
      const users = await User.find({}, '-password');

      return res.status(200).json({
        message: `Fetched ${users.length} users`,
        count: users.length,
        data: users,
      });
    }

    if (req.method === 'POST') {

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}