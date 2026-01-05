import dbConnect from "@/lib/db";
import Branch from "@/models/Branch";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // GET all branches
    if (req.method === "GET") {
      const branches = await Branch.find();
      return res.status(200).json(branches);
    }

    // POST one or multiple branches
    if (req.method === "POST") {
      const { branches } = req.body; // expecting an array

      if (!branches || !Array.isArray(branches) || branches.length === 0) {
        return res.status(400).json({ message: "branches array is required" });
      }

      // Validate each branch
      for (const branch of branches) {
        if (!branch.code || !branch.name || !branch.gstin) {
          return res.status(400).json({ message: "Each branch must have code, name, and gstin" });
        }
      }

      // Insert all branches at once
      const newBranches = await Branch.insertMany(branches, { ordered: false });

      return res.status(201).json(newBranches);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ Branch API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
