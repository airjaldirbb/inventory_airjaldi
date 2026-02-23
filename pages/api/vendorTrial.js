// pages/api/vendorTrial.js
import dbConnect from "@/lib/db";
import Vendor from "@/models/Vendor";
import PurchaseOrder from "@/models/PurchaseOrder";
import PurchaseBill from "@/models/PurchaseBill";
import BillPaymentPurchase from "@/models/BillPaymentPurchase";
import VendorTrial from "@/models/VendorTrial";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const vendors = await Vendor.find();

      const trialData = [];

      for (const vendor of vendors) {
        const vendorId = new mongoose.Types.ObjectId(vendor._id);

        // --- Total Credit (Purchases) ---
        const purchaseOrders = await PurchaseOrder.aggregate([
          { $match: { vendor: vendorId } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);

        const purchaseBills = await PurchaseBill.aggregate([
          { $match: { vendor: vendorId } },
          { $unwind: "$items" },
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

        // --- Opening balance ---
        const openingBalance = vendor.openingBalance || 0;

        // --- Closing balance calculation ---
        let closingBalance = openingBalance + totalCredit - totalDebit;
        const balanceType = closingBalance >= 0 ? "Cr" : "Dr";
        closingBalance = Math.abs(closingBalance);

        // --- Upsert VendorTrial document ---
        const trialDoc = await VendorTrial.findOneAndUpdate(
          { vendor: vendorId },
          {
            vendor: vendorId,
            openingBalance,
            debit: totalDebit,
            credit: totalCredit,
            closingBalance,
            balanceType,
            totalClosingBalance: closingBalance, // save total per vendor
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        trialData.push({
          id: vendor._id,
          vendorName: vendor.name,
          openingBalance,
          debit: totalDebit,
          credit: totalCredit,
          closingBalance,
          balanceType,
          totalClosingBalance: trialDoc.totalClosingBalance,
        });
      }

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