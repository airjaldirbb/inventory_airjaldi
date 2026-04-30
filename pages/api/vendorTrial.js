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
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const vendors = await Vendor.find();
    const trialData = [];

    for (const vendor of vendors) {
      const vendorId = new mongoose.Types.ObjectId(vendor._id);

      /* =====================================
         CREDIT SIDE (Amount Payable to Vendor)
         ===================================== */

      // 1. Purchase Orders (if you treat PO as liability)
      const purchaseOrders = await PurchaseOrder.aggregate([
        {
          $match: {
            vendor: vendorId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]);

      // 2. Purchase Bills on Credit only
      const purchaseBills = await PurchaseBill.aggregate([
        {
          $match: {
            vendor: vendorId,
            cashOrCredit: "Credit", // important
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }, // bill grand total
          },
        },
      ]);

      const poCredit = purchaseOrders[0]?.total || 0;
      const billCredit = purchaseBills[0]?.total || 0;

      const totalCredit = poCredit + billCredit;

      /* =====================================
         DEBIT SIDE (Payments / Returns)
         ===================================== */

      const payments = await BillPaymentPurchase.aggregate([
        {
          $match: {
            vendor: vendorId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const totalDebit = payments[0]?.total || 0;

      /* =====================================
         OPENING BALANCE
         ===================================== */

      const openingBalance = Number(vendor.openingBalance || 0);

      /* =====================================
         CLOSING BALANCE
         ===================================== */

      let closingBalance =
        openingBalance + totalCredit - totalDebit;

      const balanceType = closingBalance >= 0 ? "Cr" : "Dr";

      closingBalance = Math.abs(closingBalance);

      /* =====================================
         SAVE TRIAL
         ===================================== */

      const trialDoc = await VendorTrial.findOneAndUpdate(
        { vendor: vendorId },
        {
          vendor: vendorId,
          openingBalance,
          debit: totalDebit,
          credit: totalCredit,
          closingBalance,
          balanceType,
          totalClosingBalance: closingBalance,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
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

    return res.status(200).json({
      success: true,
      data: trialData,
    });
  } catch (error) {
    console.error("❌ Vendor Trial API error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}