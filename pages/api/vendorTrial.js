// pages/api/vendorTrial.js
import dbConnect from "@/lib/db";
import Vendor from "@/models/Vendor";
import PurchaseOrder from "@/models/PurchaseOrder";
import PurchaseBill from "@/models/PurchaseBill";
import BillPaymentPurchase from "@/models/BillPaymentPurchase";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const vendors = await Vendor.find();

      const trialData = await Promise.all(
        vendors.map(async (vendor) => {
          const vendorId = new mongoose.Types.ObjectId(vendor._id);

          // --- Total Credit (Purchases) ---
          const purchaseOrders = await PurchaseOrder.aggregate([
            { $match: { vendor: vendorId } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]);

          // Sum of items in PurchaseBills
          const purchaseBills = await PurchaseBill.aggregate([
            { $match: { vendor: vendorId } },
            { $unwind: "$items" }, // unwind items array
            { $group: { _id: null, total: { $sum: "$items.total" } } },
          ]);

          const totalCredit =
            (purchaseOrders[0]?.total || 0) + (purchaseBills[0]?.total || 0);

          // --- Total Debit (Payments) ---
          const payments = await BillPaymentPurchase.aggregate([
            { $match: { vendor: vendorId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          const totalDebit = payments[0]?.total || 0;

          // --- Opening balance (from vendor if stored, else 0) ---
          const openingBalance = vendor.openingBalance || 0;

          // --- Closing balance ---
          let closingBalance = openingBalance + totalCredit - totalDebit;
          const balanceType = closingBalance >= 0 ? "Cr" : "Dr";
          closingBalance = Math.abs(closingBalance);

          return {
            id: vendor._id,
            vendorName: vendor.name,
            openingBalance,
            debit: totalDebit,
            credit: totalCredit,
            closingBalance,
            balanceType,
          };
        })
      );

      return res.status(200).json({ data: trialData });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ Vendor Trial API error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
