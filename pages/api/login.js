export default function handler(req, res) {


  const { email, password } = req.body;
 const users = [
    { email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    { email: 'manager@example.com', password: 'manager123', name: 'Manager User', role: 'manager' },
    { email: 'staff@example.com', password: 'staff123', name: 'Staff User', role: 'staff' },
  ];

    const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.status(200).json({
      user: { name: user.name, email: user.email, role: user.role },
      token: 'mocked-jwt-token',
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
}
