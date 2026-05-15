import dbConnect from "@/lib/db";
import Agent from "@/models/Agent";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const agents = await Agent.find().sort({ name: 1 });
      return res.status(200).json({ data: agents });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const agent = await Agent.create(req.body);
      return res.status(201).json({ message: "Agent created", data: agent });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
