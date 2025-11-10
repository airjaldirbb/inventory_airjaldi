import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  try {
    // ================== GET: Fetch all users ==================
    if (req.method === 'GET') {
      try {
        const users = await User.find({}, '-password'); // exclude passwords
        return res.status(200).json({
          message: `Fetched ${users.length} users`,
          count: users.length,
          data: users,
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Error fetching users', error: error.message });
      }
    }

    // ================== POST: Login ==================
    if (req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

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

    // ================== Unsupported Methods ==================
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
