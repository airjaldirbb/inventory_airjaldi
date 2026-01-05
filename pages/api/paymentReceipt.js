import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import PaymentReceipt from "@/models/PaymentReceipt";
import SalesInvoice from "@/models/SalesInvoice";
import Customer from "@/models/Customer";
import Branch from "@/models/Branch";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // =====================================================
    // GET ALL RECEIPTS or PENDING INVOICES FOR CUSTOMER
    // =====================================================
    if (req.method === "GET") {
      const { customerId } = req.query;

      // ---- Fetch pending invoices for a customer ----
      if (customerId) {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
          return res.status(400).json({ message: "Invalid customer ID" });
        }

        const customerExists = await Customer.findById(customerId);
        if (!customerExists) {
          return res.status(404).json({ message: "Customer not found" });
        }

        const pendingInvoices = await SalesInvoice.find({
          customer: customerId,
          paymentStatus: { $in: ["UNPAID", "PARTIAL"] }
        }).select("invoiceNumber invoiceDate netAmount balanceAmount paymentStatus");

        return res.status(200).json({
          message: "Pending invoices fetched",
          count: pendingInvoices.length,
          data: pendingInvoices,
        });
      }

      // ---- Fetch all receipts ----
      const receipts = await PaymentReceipt.find()
        .sort({ createdAt: -1 })
        .populate("customer")
        .populate("branch")
        .populate("invoices.invoiceId");

      return res.status(200).json({
        message: "Receipts fetched",
        count: receipts.length,
        data: receipts,
      });
    }

    // =====================================================
    // POST (CREATE RECEIPT)
    // =====================================================
 // =====================================================
// POST (CREATE NEW INVOICE)
// =====================================================
if (method === "POST") {
  const { invoiceNumber, invoiceDate, customer, branch, items, paymentMode, gstType } = req.body;

  // 🔹 Validate required fields (without invoiceNumber)
  if (!customer || !branch || !items || items.length === 0) {
    return res.status(400).json({ message: "Customer, branch, and items are required" });
  }

  // 🔹 Auto-generate invoiceNumber if not provided

  // 🔹 Auto-generate invoiceNumber if not provided
let newInvoiceNumber = invoiceNumber;
if (!invoiceNumber) {
  const lastInvoice = await SalesInvoice.findOne().sort({ createdAt: -1 }).select("invoiceNumber");
  
  if (lastInvoice && lastInvoice.invoiceNumber) {
    // Extract numeric part
    const match = lastInvoice.invoiceNumber.match(/\d+$/); // match last number in string
    const lastNum = match ? parseInt(match[0], 10) : 0;
    const nextNum = lastNum + 1;

    // Keep leading zeros, e.g., "001", "002"
    newInvoiceNumber = nextNum.toString().padStart(3, "0");
  } else {
    newInvoiceNumber = "001"; // first invoice
  }
}




  // 🔹 Continue with branch, customer, items validation...
  const branchExists = await Branch.findById(branch);
  if (!branchExists) return res.status(404).json({ message: "Branch not found" });

  const customerExists = await Customer.findById(customer);
  if (!customerExists) return res.status(404).json({ message: "Customer not found" });

  // ...enrich items, calculate totals, create invoice
  const enrichedItems = await Promise.all(
    items.map(async (i, index) => {
      const { item, quantity, rate, unit, gstPercentage } = i;
      if (!item || !quantity) throw new Error(`Missing item or quantity at row ${index + 1}`);

      const itemDoc = await Item.findById(item);
      if (!itemDoc) throw new Error(`Item not found: ${item}`);

      const finalRate = rate ?? itemDoc.rate ?? 0;
      const finalUnit = unit ?? itemDoc.stockUnit ?? "pcs";
      const gstPerc = gstPercentage ? parseFloat(gstPercentage) : parseFloat(itemDoc.gstPercentage || 0);

      const total = quantity * finalRate;
      const gstAmount = (total * gstPerc) / 100;

      return { item, quantity, unit: finalUnit, rate: finalRate, gstPercentage: gstPerc, gstAmount, total };
    })
  );

  const totalAmount = enrichedItems.reduce((s, i) => s + i.total, 0);
  const totalGST = enrichedItems.reduce((s, i) => s + i.gstAmount, 0);
  const netAmount = totalAmount + totalGST;

  const newInvoice = await SalesInvoice.create({
    invoiceNumber: newInvoiceNumber,
    invoiceDate: invoiceDate || Date.now(),
    customer,
    branch,
    paymentMode: paymentMode || "CASH",
    items: enrichedItems,
    totalAmount,
    totalGST,
    netAmount,
    paidAmount: 0,
    balanceAmount: netAmount,
    paymentStatus: "UNPAID",
    gstType: gstType || "TAX_INVOICE",
  });

  await newInvoice.populate("branch").populate("customer").populate("items.item");

  return res.status(201).json({
    message: "Sales invoice created successfully",
    data: newInvoice,
  });
}

    // =====================================================
    // METHOD NOT ALLOWED
    // =====================================================
    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error("❌ PaymentReceipt API error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
