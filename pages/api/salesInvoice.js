import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import SalesInvoice from "@/models/SalesInvoice";
import Item from "@/models/Item";
import Branch from "@/models/Branch";
import Customer from "@/models/Customer";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const method = req.method;

    // =====================================================
    // GET INVOICES
    // =====================================================
    if (method === "GET") {
      const { invoiceNumber, customerId, pending } = req.query;

      if (invoiceNumber) {
        const invoice = await SalesInvoice.findOne({ invoiceNumber })
          .populate("branch")
          .populate("customer")
          .populate("items.item");

        if (!invoice)
          return res.status(404).json({ message: "Invoice not found" });

        return res.status(200).json({ message: "Invoice fetched", data: invoice });
      }

      if (customerId && pending === "true") {
        if (!mongoose.Types.ObjectId.isValid(customerId))
          return res.status(400).json({ message: "Invalid customerId" });

        const invoices = await SalesInvoice.find({
          customer: customerId,
          paymentStatus: { $ne: "PAID" },
        })
          .select(
            "invoiceNumber invoiceDate netAmount paidAmount balanceAmount paymentStatus paymentMode"
          )
          .sort({ invoiceDate: 1 });

        return res.status(200).json({
          message: "Pending invoices fetched",
          count: invoices.length,
          data: invoices,
        });
      }

      const invoices = await SalesInvoice.find()
        .sort({ createdAt: -1 })
        .populate("branch")
        .populate("customer")
        .populate("items.item");

      return res.status(200).json({
        message: `Fetched ${invoices.length} invoices`,
        count: invoices.length,
        data: invoices,
      });
    }

    // =====================================================
    // POST (CREATE NEW INVOICE)
    // =====================================================
    if (method === "POST") {
      const { invoiceNumber, invoiceDate, customer, branch, items, paymentMode, gstType } = req.body;

      if (!customer || !branch || !items || items.length === 0) {
        return res.status(400).json({ message: "Customer, branch, and items are required" });
      }

      // 🔹 Auto-generate invoiceNumber if not provided
      let newInvoiceNumber = invoiceNumber;
      if (!invoiceNumber) {
        const lastInvoice = await SalesInvoice.findOne().sort({ createdAt: -1 }).select("invoiceNumber");
        if (lastInvoice && lastInvoice.invoiceNumber) {
          const match = lastInvoice.invoiceNumber.match(/\d+$/); // extract last number
          const lastNum = match ? parseInt(match[0], 10) : 0;
          const nextNum = lastNum + 1;
          newInvoiceNumber = nextNum.toString().padStart(3, "0"); // e.g., "001", "002"
        } else {
          newInvoiceNumber = "001"; // first invoice
        }
      }

      // 🔹 Validate branch
      if (!mongoose.Types.ObjectId.isValid(branch))
        return res.status(400).json({ message: "Invalid branch ID" });
      const branchExists = await Branch.findById(branch);
      if (!branchExists) return res.status(404).json({ message: "Branch not found" });

      // 🔹 Validate customer
      if (!mongoose.Types.ObjectId.isValid(customer))
        return res.status(400).json({ message: "Invalid customer ID" });
      const customerExists = await Customer.findById(customer);
      if (!customerExists)
        return res.status(404).json({ message: "Customer not found" });

      // 🔹 Enrich items
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

      await newInvoice.populate("branch");
      await newInvoice.populate("customer");
      await newInvoice.populate("items.item");

      return res.status(201).json({ message: "Sales invoice created successfully", data: newInvoice });
    }

    // =====================================================
    // PUT (UPDATE INVOICE BY ID)
    // =====================================================
    if (method === "PUT") {
      const { id } = req.query;
      const { items, paymentMode, gstType, invoiceDate } = req.body;

      if (!id || !mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid invoice ID" });

      const invoice = await SalesInvoice.findById(id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });

      if (items) invoice.items = items;
      if (paymentMode) invoice.paymentMode = paymentMode;
      if (gstType) invoice.gstType = gstType;
      if (invoiceDate) invoice.invoiceDate = invoiceDate;

      if (items) {
        invoice.totalAmount = items.reduce((s, i) => s + i.total, 0);
        invoice.totalGST = items.reduce((s, i) => s + i.gstAmount, 0);
        invoice.netAmount = invoice.totalAmount + invoice.totalGST;
        invoice.balanceAmount = invoice.netAmount - invoice.paidAmount;
      }

      await invoice.save();
      await invoice.populate("branch");
      await invoice.populate("customer");
      await invoice.populate("items.item");

      return res.status(200).json({ message: "Invoice updated", data: invoice });
    }

    // =====================================================
    // DELETE (DELETE INVOICE BY ID)
    // =====================================================
    if (method === "DELETE") {
      const { id } = req.query;

      if (!id || !mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid invoice ID" });

      const invoice = await SalesInvoice.findById(id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });

      if (invoice.paymentStatus !== "UNPAID") {
        return res.status(400).json({ message: "Cannot delete paid or partially paid invoice" });
      }

      await invoice.deleteOne();
      return res.status(200).json({ message: "Invoice deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ SalesInvoice API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
