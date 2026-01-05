import dbConnect from "@/lib/db";
import StockAdjustment from "@/models/StockAdjustment";
import Item from "@/models/Item";
import Branch from "@/models/Branch";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const adjustments = await StockAdjustment.find()
        .populate("item")
        .populate("branch")
        .populate("adjustedBy")
        .populate("approvedBy");

      return res.status(200).json({
        message: `Fetched ${adjustments.length} stock adjustments`,
        count: adjustments.length,
        data: adjustments,
      });
    }

    if (req.method === "POST") {
      const {
        item, branch, adjustmentType, quantity,
        reason, remarks, adjustedBy, approvedBy
      } = req.body;

      if (!item || !branch || !adjustmentType || !quantity || !adjustedBy) {
        return res.status(400).json({
          message: "Missing required fields: item, branch, adjustmentType, quantity, adjustedBy",
        });
      }

      const adjustment = await StockAdjustment.create({
        item, branch, adjustmentType, quantity,
        reason, remarks, adjustedBy, approvedBy,
      });

      await adjustment.populate("item branch adjustedBy approvedBy");

      return res.status(201).json({
        message: "Stock adjustment recorded successfully",
        data: adjustment,
      });
    }

    if (req.method === "PUT") {
      const { _id, ...updateData } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id for update" });
      }

      const updatedAdjustment = await StockAdjustment.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      ).populate("item branch adjustedBy approvedBy");

      if (!updatedAdjustment) {
        return res.status(404).json({ message: "Stock adjustment not found" });
      }

      return res.status(200).json({
        message: "Stock adjustment updated successfully",
        data: updatedAdjustment,
      });
    }

    if (req.method === "DELETE") {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id for delete" });
      }

      const deletedAdjustment = await StockAdjustment.findByIdAndDelete(_id);
      if (!deletedAdjustment) {
        return res.status(404).json({ message: "Stock adjustment not found" });
      }

      return res.status(200).json({
        message: "Stock adjustment deleted successfully",
        data: deletedAdjustment,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
