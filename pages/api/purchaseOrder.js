import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import PurchaseOrder from "@/models/PurchaseOrder";
import Item from "@/models/Item";

export default async function handler(req, res) {
  await dbConnect();

  try {
    /* ========================== GET ========================== */
    if (req.method === "GET") {
      const orders = await PurchaseOrder.find()
        .sort({ createdAt: -1 })
        .populate("vendor branch items.item");

      return res.status(200).json(orders);
    }

    /* ========================== POST ========================== */
    if (req.method === "POST") {
      const { orderDate, vendor, branch, items } = req.body;

      if (!vendor || !branch || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "vendor, branch and items are required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(vendor) ||
        !mongoose.Types.ObjectId.isValid(branch)
      ) {
        return res.status(400).json({ message: "Invalid vendor or branch ID" });
      }

      /* ========= AUTO ORDER NUMBER ========= */
      const lastOrder = await PurchaseOrder
        .findOne({ orderNumber: /^RBB\d+$/ })
        .sort({ orderNumber: -1 })
        .select("orderNumber")
        .lean();

      let nextOrderNumber = "RBB001";
      if (lastOrder?.orderNumber) {
        const lastNum = Number(lastOrder.orderNumber.replace("RBB", ""));
        nextOrderNumber = `RBB${String(lastNum + 1).padStart(3, "0")}`;
      }

      /* ========= ITEMS + TAX CALC ========= */
      let totalAmount = 0;
      let totalTax = 0;

      const enrichedItems = await Promise.all(
        items.map(async (i) => {
          if (!mongoose.Types.ObjectId.isValid(i.item)) {
            throw new Error("Invalid item ID");
          }

          const baseAmount = i.quantity * i.rate;
          const taxPercent = Number(i.taxPercent);

          if (![5, 12, 18, 28].includes(taxPercent)) {
            throw new Error("Invalid tax percent");
          }

          const taxAmount = (baseAmount * taxPercent) / 100;
          const total = baseAmount + taxAmount;

          totalAmount += total;
          totalTax += taxAmount;

          return {
            item: i.item,
            quantity: i.quantity,
            rate: i.rate,
            taxPercent,
            taxAmount,
            total,
          };
        })
      );

      /* ========= CREATE ORDER ========= */
      const order = await PurchaseOrder.create({
        orderNumber: nextOrderNumber,
        orderDate: orderDate || new Date(),
        vendor,
        branch,
        items: enrichedItems,
        taxAmount: totalTax,
        totalAmount,
      });

      await order.populate("vendor branch items.item");

      return res.status(201).json({
        message: "Purchase order created successfully",
        data: order,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ PurchaseOrder API error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
