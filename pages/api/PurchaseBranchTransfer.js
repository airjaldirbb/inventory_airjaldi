import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import PurchaseBranchTransfer from "@/models/PurchaseBranchTransfer";
import Item from "@/models/Item";
import Branch from "@/models/Branch";
import Agent from "@/models/Agent";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const method = req.method;

    // =====================================================
    // ✅ GET TRANSFERS (REGISTER FORMAT)
    // =====================================================
    if (method === "GET") {
      const transfers = await PurchaseBranchTransfer.find()
        .populate("fromBranch")
        .populate("toBranch")
        .populate("items.item")
        .populate("agent")
        .sort({ createdAt: -1 });

      const register = [];

      transfers.forEach((doc) => {
        doc.items.forEach((row) => {
          register.push({
            id: row._id.toString(),

            parentId: doc._id,
            itemId: row._id,

            invoiceNo: doc.invoiceNumber,
            invoiceDate: doc.invoiceDate,

            fromBranch: doc.fromBranch?.name || "N/A",
            toBranch: doc.toBranch?.name || "N/A",

            itemName: row.item?.itemName || "N/A",

            qty: row.quantity,
            uom: row.unit || "pcs",
            rate: row.rate || 0,

            taxPercent: row.gstPercentage || 0,
            taxAmount: row.gstAmount || 0,

            amount: row.total || 0,

            paymentStatus: doc.paymentStatus || "UNPAID",
          });
        });
      });

      const totalAmount = register.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
      );

      return res.status(200).json({
        data: register,
        totalAmount,
      });
    }

    // =====================================================
    // ✅ POST (CREATE TRANSFER)
    // =====================================================
    if (method === "POST") {
      const {
        invoiceNumber,
        invoiceDate,
        fromBranch,
        toBranch,
        items,
        paymentMode,
        gstType,
        agent,
      } = req.body;

      if (!fromBranch || !toBranch || !items?.length) {
        return res.status(400).json({
          message: "fromBranch, toBranch and items are required",
        });
      }

      // ✅ AUTO INVOICE NUMBER
      let newInvoiceNumber = invoiceNumber;

      if (!invoiceNumber) {
        const lastInvoice = await PurchaseBranchTransfer.findOne()
          .sort({ createdAt: -1 })
          .select("invoiceNumber");

        if (lastInvoice?.invoiceNumber) {
          const num = parseInt(lastInvoice.invoiceNumber) + 1;
          newInvoiceNumber = String(num).padStart(3, "0");
        } else {
          newInvoiceNumber = "001";
        }
      }

      // ✅ VALIDATE BRANCH
      const fromBranchExists = await Branch.findById(fromBranch);
      const toBranchExists = await Branch.findById(toBranch);

      if (!fromBranchExists) {
        return res.status(404).json({ message: "From Branch not found" });
      }

      if (!toBranchExists) {
        return res.status(404).json({ message: "To Branch not found" });
      }

      if (fromBranch === toBranch) {
        return res.status(400).json({
          message: "From and To branch cannot be same",
        });
      }

      // ✅ AGENT
      let agentDoc = null;
      if (agent && mongoose.Types.ObjectId.isValid(agent)) {
        agentDoc = await Agent.findById(agent);
      }

      // ✅ ITEMS
      const enrichedItems = await Promise.all(
        items.map(async (i) => {
          const itemDoc = await Item.findById(i.item);
          if (!itemDoc) throw new Error("Item not found");

          const qty = Number(i.quantity);
          const rate = Number(i.rate || itemDoc.rate || 0);
          const gstPercentage = Number(
            i.gstPercentage || itemDoc.gstPercentage || 0
          );

          const basic = qty * rate;
          const gstAmount = (basic * gstPercentage) / 100;

          return {
            item: i.item,
            quantity: qty,
            unit: i.unit || itemDoc.stockUnit || "pcs",
            rate,
            gstPercentage,
            gstAmount,
            total: basic + gstAmount,
          };
        })
      );

      const totalAmount = enrichedItems.reduce((s, i) => s + i.total, 0);
      const totalGST = enrichedItems.reduce((s, i) => s + i.gstAmount, 0);
      const netAmount = totalAmount;

      // ✅ CREATE (FIXED MODEL)
      const newTransfer = await PurchaseBranchTransfer.create({
        invoiceNumber: newInvoiceNumber,
        invoiceDate: invoiceDate || Date.now(),

        fromBranch,
        toBranch,
        agent: agentDoc?._id || null,

        paymentMode: paymentMode || "CASH",
        gstType: gstType || "TAX_INVOICE",

        items: enrichedItems,

        totalAmount,
        totalGST,
        netAmount,

        paidAmount: 0,
        balanceAmount: netAmount,
        paymentStatus: "UNPAID",
      });

      await newTransfer.populate("fromBranch");
      await newTransfer.populate("toBranch");
      await newTransfer.populate("items.item");
      await newTransfer.populate("agent");

      return res.status(201).json({
        message: "Purchase Transfer created successfully",
        data: newTransfer,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error("❌ Transfer API error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}