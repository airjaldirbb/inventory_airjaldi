import dbConnect from "@/lib/db";
import MaterialReceipt from "@/models/MaterialReceipt";
import MaterialIssue from "@/models/MaterialIssue";
import StockAdjustment from "@/models/StockAdjustment";
import SalesInvoice from "@/models/SalesInvoice";
import PurchaseBill from "@/models/PurchaseBill";

// force model registration
import "@/models/Branch";
import "@/models/Item";
import "@/models/Customer";
import "@/models/Vendor";
import "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const method = req.method;

    // =====================================================
    // ======================= GET ==========================
    // =====================================================
    if (method === "GET") {
      const register = [];

      // ========= RECEIPT =========
      const receipts = await MaterialReceipt.find()
        .populate("branch")
        .populate("items.itemId");

      receipts.forEach((r) => {
        if (!r.branch) return;

        r.items.forEach((i) => {
          if (!i.itemId) return;

          register.push({
            parentId: r._id,
            itemId: i._id,
            transactionType: "RECEIPT",

            invoiceNo: r.receiptNo,
            invoiceDate: r.receiptDate,
            customer: null,
            branch: { _id: r.branch._id, name: r.branch.name },
            item: { _id: i.itemId._id, itemName: i.itemId.itemName },

            qty: i.qty,
            uom: i.unit || i.itemId.stockUnit || "pcs",
            rate: i.rate || 0,
            taxPercent: Number(i.itemId.gstClassification) || 0,
            taxAmount:
              i.amount && i.itemId.gstClassification
                ? (i.amount * Number(i.itemId.gstClassification)) / 100
                : 0,
            invoiceAmount: i.amount || 0,
            paymentStatus: "Received",
          });
        });
      });

      // ========= PURCHASE =========
      const purchases = await PurchaseBill.find()
        .populate("branch")
        .populate("vendor");

      purchases.forEach((p) => {
        if (!p.branch) return;

        p.items.forEach((i) => {
          register.push({
            parentId: p._id,
            itemId: i._id || null,
            transactionType: "PURCHASE",

            invoiceNo: p.invoiceNo,
            invoiceDate: p.date,
            customer: p.vendor
              ? { _id: p.vendor._id, name: p.vendor.name }
              : null,
            branch: { _id: p.branch._id, name: p.branch.name },
            item: { _id: null, itemName: i.item },
            qty: i.quantity,
            uom: i.unit || "pcs",
            rate: i.rate || 0,
            taxPercent: 0,
            taxAmount: 0,
            invoiceAmount: i.amount || 0,
            paymentStatus:
              p.cashOrCredit === "Cash" ? "Paid" : "Pending",
          });
        });
      });

      // ========= ISSUE =========
      const issues = await MaterialIssue.find()
        .populate("branch")
        .populate("items.itemId");

      issues.forEach((issue) => {
        if (!issue.branch) return;

        issue.items.forEach((i) => {
          if (!i.itemId) return;

          register.push({
            parentId: issue._id,
            itemId: i._id,
            transactionType: "ISSUE",

            invoiceNo: issue.issueNo,
            invoiceDate: issue.issueDate,
            customer: null,
            branch: { _id: issue.branch._id, name: issue.branch.name },
            item: { _id: i.itemId._id, itemName: i.itemId.itemName },

            qty: -i.qty,
            uom: i.unit || i.itemId.stockUnit || "pcs",
            rate: i.rate || 0,
            taxPercent: Number(i.itemId.gstClassification) || 0,
            taxAmount:
              i.amount && i.itemId.gstClassification
                ? (i.amount * Number(i.itemId.gstClassification)) / 100
                : 0,
            invoiceAmount: i.amount || 0,
            paymentStatus: "Issued",
          });
        });
      });

      // ========= SALES =========
      const sales = await SalesInvoice.find()
        .populate("branch")
        .populate("customer")
        .populate("items.item");

      sales.forEach((s) => {
        if (!s.branch) return;

        s.items.forEach((i) => {
          if (!i.item) return;

          register.push({
            parentId: s._id,
            itemId: i._id,
            transactionType: "SALE",

            invoiceNo: s.invoiceNumber,
            invoiceDate: s.invoiceDate,
            customer: s.customer
              ? { _id: s.customer._id, name: s.customer.name }
              : null,
            branch: { _id: s.branch._id, name: s.branch.name },
            item: { _id: i.item._id, itemName: i.item.itemName },

            qty: -i.quantity,
            uom: i.unit || i.item.stockUnit || "pcs",
            rate: i.rate || 0,
            taxPercent: i.gstPercentage || 0,
            taxAmount: i.gstAmount || 0,
            invoiceAmount: i.total || 0,
            paymentStatus: s.paymentStatus || "Pending",
          });
        });
      });

      // ========= ADJUSTMENT =========
      const adjustments = await StockAdjustment.find()
        .populate("branch")
        .populate("item");

      adjustments.forEach((adj) => {
        if (!adj.branch || !adj.item) return;

        register.push({
          parentId: adj._id,
          itemId: null,
          transactionType: "ADJUSTMENT",

          invoiceNo: `ADJ-${adj._id.toString().slice(-4)}`,
          invoiceDate: adj.createdAt,
          customer: null,
          branch: { _id: adj.branch._id, name: adj.branch.name },
          item: { _id: adj.item._id, itemName: adj.item.itemName },

          qty:
            adj.adjustmentType === "INCREASE"
              ? adj.quantity
              : -adj.quantity,
          uom: adj.item.stockUnit || "pcs",
          rate: 0,
          taxPercent: 0,
          taxAmount: 0,
          invoiceAmount: 0,
          paymentStatus: "Adjustment",
        });
      });

      const totalAmount = register.reduce(
        (sum, i) => sum + (i.invoiceAmount || 0) + (i.taxAmount || 0),
        0
      );

      return res.status(200).json({ data: register, totalAmount });
    }

    // =====================================================
    // ======================= PUT ==========================
    // =====================================================
    if (req.method === "PUT") {
      const { id, type } = req.query;
      const { qty, rate } = req.body;

      if (!id || !type) {
        return res.status(400).json({ message: "Missing id or type" });
      }

      try {
        // ================= SALES =================
        if (type !== "SALE") {
          return res.status(403).json({
            message: "Editing allowed only for Sales Invoice",
          });
        }

        const { itemId } = req.query;
        const { qty, rate, itemName } = req.body;

        if (!id || !itemId) {
          return res.status(400).json({ message: "Missing id or itemId" });
        }

        const doc = await SalesInvoice.findById(id);
        if (!doc) return res.status(404).json({ message: "Sales invoice not found" });

        doc.items = doc.items.map((item) => {
          if (item._id.toString() !== itemId) return item;

          const updatedQty = qty ?? item.quantity;
          const updatedRate = rate ?? item.rate;

          const total = updatedQty * updatedRate;
          const gstAmount = (total * item.gstPercentage) / 100;

          return {
            ...item._doc,
            itemName: itemName ?? item.itemName, // only local change
            quantity: updatedQty,
            rate: updatedRate,
            total,
            gstAmount,
          };
        });

        await doc.save();

        return res.status(200).json({
          message: "Sales invoice item updated successfully",
        });

        // ================= PURCHASE =================
        if (type === "PURCHASE") {
          const doc = await PurchaseBill.findById(id);
          if (!doc) return res.status(404).json({ message: "Not found" });

          doc.items = doc.items.map((item) => ({
            ...item._doc,
            quantity: qty,
            rate: rate,
            amount: qty * rate,
          }));

          await doc.save();
          return res.status(200).json({ message: "Updated PURCHASE" });
        }

        // ================= RECEIPT =================
        if (type === "RECEIPT") {
          const doc = await MaterialReceipt.findById(id);
          if (!doc) return res.status(404).json({ message: "Not found" });

          doc.items = doc.items.map((item) => ({
            ...item._doc,
            qty: qty,
            rate: rate,
            amount: qty * rate,
          }));

          await doc.save();
          return res.status(200).json({ message: "Updated RECEIPT" });
        }

        // ================= ISSUE =================
        if (type === "ISSUE") {
          const doc = await MaterialIssue.findById(id);
          if (!doc) return res.status(404).json({ message: "Not found" });

          doc.items = doc.items.map((item) => ({
            ...item._doc,
            qty: qty,
            rate: rate,
            amount: qty * rate,
          }));

          await doc.save();
          return res.status(200).json({ message: "Updated ISSUE" });
        }

        // ================= ADJUSTMENT =================
        if (type === "ADJUSTMENT") {
          const doc = await StockAdjustment.findById(id);
          if (!doc) return res.status(404).json({ message: "Not found" });

          doc.quantity = qty;

          await doc.save();
          return res.status(200).json({ message: "Updated ADJUSTMENT" });
        }

        return res.status(400).json({ message: "Invalid type" });

      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Update failed" });
      }
    }

    // =====================================================
    // ===================== DELETE =========================
    // =====================================================
    if (method === "DELETE") {
      const { parentId, itemId, transactionType } = req.body;

      let doc;

      if (transactionType === "SALE") {
        doc = await SalesInvoice.findById(parentId);
        doc.items = doc.items.filter(
          (i) => i._id.toString() !== itemId
        );
      }

      else if (transactionType === "RECEIPT") {
        doc = await MaterialReceipt.findById(parentId);
        doc.items = doc.items.filter(
          (i) => i._id.toString() !== itemId
        );
      }

      else if (transactionType === "ISSUE") {
        doc = await MaterialIssue.findById(parentId);
        doc.items = doc.items.filter(
          (i) => i._id.toString() !== itemId
        );
      }

      else if (transactionType === "PURCHASE") {
        doc = await PurchaseBill.findById(parentId);
        doc.items = doc.items.filter(
          (i) => i._id.toString() !== itemId
        );
      }

      else if (transactionType === "ADJUSTMENT") {
        await StockAdjustment.findByIdAndDelete(parentId);
        return res.json({ message: "Deleted" });
      }

      await doc.save();

      return res.json({ message: "Item deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}