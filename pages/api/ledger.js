import dbConnect from "@/lib/db";
import Ledger from "@/models/Ledger";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { ledger_name } = req.body;

    if (!ledger_name) {
      return res.status(400).json({ message: "ledger_name is required" });
    }

    const existing = await Ledger.findOne({ ledger_name });
    if (existing) {
      return res.status(200).json(existing);
    }

    const newLedger = await Ledger.create({ ledger_name });
    return res.status(201).json(newLedger);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
