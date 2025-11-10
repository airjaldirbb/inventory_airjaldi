import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import MaterialReceipt from "@/models/MaterialReceipt";
import Item from "@/models/Item";
import Branch from "@/models/Branch";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // ==================== GET ====================
    if (req.method === "GET") {
      const receipts = await MaterialReceipt.find()
        .populate("branch")
        .populate("items.itemId");

      return res.status(200).json({
        message: `Fetched ${receipts.length} material receipts`,
        count: receipts.length,
        data: receipts,
      });
    }

    // ==================== POST ====================
    if (req.method === "POST") {
      const { branch, receiptDate, receiptNo, party, items = [], barcode, quantity = 1 } = req.body;

      if (!branch || !receiptDate || !receiptNo) {
        return res.status(400).json({ message: "Missing required fields: branch, receiptDate, receiptNo" });
      }

      if (!mongoose.Types.ObjectId.isValid(branch)) {
        return res.status(400).json({ message: `Invalid branch ID: ${branch}` });
      }

      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(404).json({ message: `Branch not found: ${branch}` });
      }

      let enrichedItems = [];

      // ----------- Barcode scanning logic -----------
      if (barcode) {
        const itemDetails = await Item.findOne({ itemCode: barcode, barcodeTracking: "ENABLE" });
        if (!itemDetails) {
          return res.status(404).json({ message: "Item not found or barcode tracking disabled" });
        }

        const rate = itemDetails.rate ?? 0;
        const amount = rate * quantity;

        enrichedItems.push({
          itemId: itemDetails._id,
          qty: quantity,
          unit: itemDetails.stockUnit || "pcs",
          rate,
          amount,
          remarks: "Scanned via barcode",
        });
      } else if (items.length > 0) {
        // ----------- Normal items array logic -----------
        enrichedItems = await Promise.all(items.map(async (item, i) => {
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
      } else {
        return res.status(400).json({ message: "No items provided or barcode missing" });
      }

      const totalAmount = enrichedItems.reduce((sum, item) => sum + item.amount, 0);

      const newReceipt = await MaterialReceipt.create({
        branch,
        receiptDate,
        receiptNo,
        party: party || "",
        items: enrichedItems,
        totalAmount,
      });

      await newReceipt.populate("branch");
      await newReceipt.populate("items.itemId");

      return res.status(201).json({
        message: "Material receipt created successfully",
        data: newReceipt,
      });
    }

    // ==================== DELETE ====================
    if (req.method === "DELETE") {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id for delete" });
      }

      const deletedReceipt = await MaterialReceipt.findByIdAndDelete(_id);
      if (!deletedReceipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }

      return res.status(200).json({
        message: "Receipt deleted successfully",
        data: deletedReceipt,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
