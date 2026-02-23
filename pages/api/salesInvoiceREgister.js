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
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const salesInvoiceRegister = [];

    // ================= MATERIAL RECEIPT =================
    const receipts = await MaterialReceipt.find()
      .populate("branch")
      .populate("items.itemId");

    receipts.forEach(r => {
      if (!r.branch) return;

      r.items.forEach(i => {
        if (!i.itemId) return;

        salesInvoiceRegister.push({
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
          transactionType: "RECEIPT",
        });
      });
    });

    // ================= PURCHASE BILL =================
    const purchases = await PurchaseBill.find()
      .populate("branch")
      .populate("vendor");

    purchases.forEach(p => {
      if (!p.branch) return;

      p.items.forEach(i => {
        salesInvoiceRegister.push({
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
          paymentStatus: p.cashOrCredit === "Cash" ? "Paid" : "Pending",
          transactionType: "PURCHASE",
        });
      });
    });

    // ================= MATERIAL ISSUE =================
    const issues = await MaterialIssue.find()
      .populate("branch")
      .populate("items.itemId");

    issues.forEach(issue => {
      if (!issue.branch) return;

      issue.items.forEach(i => {
        if (!i.itemId) return;

        salesInvoiceRegister.push({
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
          transactionType: "ISSUE",
        });
      });
    });

    // ================= SALES INVOICE =================
    const sales = await SalesInvoice.find()
      .populate("branch")
      .populate("customer")
      .populate("items.item");

    sales.forEach(s => {
      if (!s.branch) return;

      s.items.forEach(i => {
        if (!i.item) return;

        salesInvoiceRegister.push({
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
          transactionType: "SALE",
        });
      });
    });

    // ================= STOCK ADJUSTMENT =================
    const adjustments = await StockAdjustment.find()
      .populate("branch")
      .populate("item");

    adjustments.forEach(adj => {
      if (!adj.branch || !adj.item) return;

      salesInvoiceRegister.push({
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
        transactionType: "ADJUSTMENT",
      });
    });

    // ================= CALCULATE TOTAL =================
    const totalAmount = salesInvoiceRegister.reduce((sum, i) => {
      const invoice = i.invoiceAmount || 0;
      const tax = i.taxAmount || 0;
      return sum + invoice + tax;
    }, 0);

    return res.status(200).json({ 
      data: salesInvoiceRegister,
      totalAmount 
    });

  } catch (error) {
    console.error("❌ SalesInvoiceRegister API error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}