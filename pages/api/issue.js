import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import MaterialIssue from "@/models/MaterialIssue";
import Item from "@/models/Item";
import Branch from "@/models/Branch";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // ==================== GET ====================
    if (req.method === "GET") {
      const issues = await MaterialIssue.find()
        .populate("branch")
        .populate("items.itemId");

      return res.status(200).json({
        message: `Fetched ${issues.length} material issues`,
        count: issues.length,
        data: issues,
      });
    }

    // ==================== POST ====================
    if (req.method === "POST") {
      const {
        branch,
        issueDate,
        issueNo,
        issuedTo,
        items = [],
      } = req.body;

      if (!branch || !issueDate || !issueNo || items.length === 0) {
        return res.status(400).json({
          message: "Missing required fields: branch, issueDate, issueNo, items",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(branch)) {
        return res.status(400).json({ message: `Invalid branch ID: ${branch}` });
      }

      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(404).json({ message: `Branch not found: ${branch}` });
      }

      const enrichedItems = await Promise.all(items.map(async (item, i) => {
        const { itemId, qty, unit, rate, remarks } = item;

        if (!itemId || !qty) {
          throw new Error(`Missing itemId or qty in item ${i + 1}`);
        }

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
          throw new Error(`Invalid item ID: ${itemId}`);
        }

        const itemDetails = await Item.findById(itemId);
        if (!itemDetails) {
          throw new Error(`Item not found: ${itemId}`);
        }

        const finalRate = rate ?? itemDetails.rate ?? 0;
        const amount = qty * finalRate;

        return {
          itemId,
          qty,
          unit: unit || itemDetails.stockUnit || "pcs",
          rate: finalRate,
          amount,
          remarks: remarks || "",
        };
      }));

      const totalAmount = enrichedItems.reduce((sum, item) => sum + item.amount, 0);

      const newIssue = await MaterialIssue.create({
        branch,
        issueDate,
        issueNo,
        issuedTo: issuedTo || "",
        items: enrichedItems,
        totalAmount,
      });

      await newIssue.populate("branch");
      await newIssue.populate("items.itemId");

      return res.status(201).json({
        message: "Material issue created successfully",
        data: newIssue,
      });
    }

    // ==================== DELETE ====================
    if (req.method === "DELETE") {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id for delete" });
      }

      const deletedIssue = await MaterialIssue.findByIdAndDelete(_id);
      if (!deletedIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      return res.status(200).json({
        message: "Issue deleted successfully",
        data: deletedIssue,
      });
    }

    // ==================== METHOD NOT ALLOWED ====================
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}