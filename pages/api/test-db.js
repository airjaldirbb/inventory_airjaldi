import dbConnect from "@/lib/db";

export default async function handler(req, res) {
  try {
    await dbConnect();
    res.status(200).json({ message: 'MongoDB connection successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
}
