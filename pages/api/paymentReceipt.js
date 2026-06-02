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
      const { customerId, id } = req.query;

      // 🔹 GET SINGLE RECEIPT
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid receipt ID" });
        }

        const receipt = await PaymentReceipt.findById(id)
          .populate("customer")
          .populate("branch")
          .populate("invoices.invoiceId");

        if (!receipt) {
          return res.status(404).json({ message: "Receipt not found" });
        }

        return res.status(200).json({
          message: "Receipt fetched",
          data: receipt,
        });
      }

      // 🔹 GET PENDING INVOICES
      
      if (customerId) {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
          return res.status(400).json({ message: "Invalid customer ID" });
        }

        const pendingInvoices = await SalesInvoice.find({
          customer: customerId,
          paymentStatus: { $in: ["UNPAID", "PARTIAL"] },
        })
          .select("_id invoiceNumber invoiceDate balanceAmount")
          .lean();

        const formattedInvoices = pendingInvoices.map((inv) => ({
          invoiceId: inv._id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          amountDue: inv.balanceAmount,
          amountPaid: 0,
          paymentMode: "Credit",
          referenceNo: "",
          paymentDate: null,
        }));

        return res.status(200).json({
          message: "Pending invoices fetched",
          count: formattedInvoices.length,
          data: formattedInvoices,
        });
      }

      // 🔹 GET ALL RECEIPTS
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
    // POST (CREATE PAYMENT RECEIPT)
    // =====================================================
    if (req.method === "POST") {
      const {
        receiptNumber,
        receiptDate,
        branch,
        customer,
        invoices,
        totalReceived,
      } = req.body;

      // ✅ Validate required fields
      if (!receiptNumber || !branch || !customer || !invoices || invoices.length === 0) {
        return res.status(400).json({
          message: "Receipt number, branch, customer and invoices are required",
        });
      }

      // ✅ Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(branch)) {
        return res.status(400).json({ message: "Invalid branch ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(customer)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }

      // ✅ Check branch & customer existence
      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(404).json({ message: "Branch not found" });
      }

      const customerExists = await Customer.findById(customer);
      if (!customerExists) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // ✅ Validate invoices
      for (const inv of invoices) {
        if (!mongoose.Types.ObjectId.isValid(inv.invoiceId)) {
          return res.status(400).json({ message: `Invalid invoice ID: ${inv.invoiceId}` });
        }

        const invoiceDoc = await SalesInvoice.findById(inv.invoiceId);
        if (!invoiceDoc) {
          return res.status(404).json({ message: `Invoice not found: ${inv.invoiceId}` });
        }
      }

      // ✅ Create receipt
      const receipt = await PaymentReceipt.create({
        receiptNumber,
        receiptDate: receiptDate || Date.now(),
        branch,
        customer,
        // invoices: invoices.map((i) => ({

        //   invoiceId: i.invoiceId,
        //   amountPaid: Number(i.amountPaid),
        // })),
        invoices: invoices.map((i) => {
          // 🔐 Validation
          if (
            (i.paymentMode === "Cash" || i.paymentMode === "Online") &&
            !i.referenceNo
          ) {
            throw new Error(
              `Reference number required for ${i.paymentMode} payment`
            );
          }

          return {
            invoiceId: i.invoiceId,
            amountPaid: Number(i.amountPaid) || 0,
            paymentMode: i.paymentMode || "Credit",
            referenceNo:
              i.paymentMode === "Credit" ? "" : i.referenceNo || "",
            paymentDate: i.paymentDate || null,
          };
        }),
        totalReceived: Number(totalReceived),
      });

      // ✅ UPDATE INVOICES (VERY IMPORTANT)
      for (const inv of invoices) {
        const invoiceDoc = await SalesInvoice.findById(inv.invoiceId);

        const newPaid = (invoiceDoc.paidAmount || 0) + Number(inv.amountPaid);
        const newBalance = invoiceDoc.netAmount - newPaid;

        await SalesInvoice.findByIdAndUpdate(inv.invoiceId, {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus:
            newBalance <= 0 ? "PAID" : "PARTIAL",
        });
      }

      return res.status(201).json({
        message: "Payment receipt created successfully",
        data: receipt,
      });
    }


    //Put (Update method)

    if (req.method === "PUT") {
      const { id } = req.query;
      const { invoices, totalReceived } = req.body;

      const existingReceipt = await PaymentReceipt.findById(id);
      if (!existingReceipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }

      // 🔴 STEP 1: REVERSE OLD PAYMENTS
      for (const oldInv of existingReceipt.invoices) {
        const invoiceDoc = await SalesInvoice.findById(oldInv.invoiceId);

        const newPaid =
          (invoiceDoc.paidAmount || 0) - (oldInv.amountPaid || 0);

        const newBalance = invoiceDoc.netAmount - newPaid;

        await SalesInvoice.findByIdAndUpdate(oldInv.invoiceId, {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus:
            newBalance <= 0
              ? "PAID"
              : newPaid > 0
                ? "PARTIAL"
                : "UNPAID",
        });
      }

      // 🟢 STEP 2: APPLY NEW PAYMENTS
      for (const inv of invoices) {
        const invoiceDoc = await SalesInvoice.findById(inv.invoiceId);

        const newPaid =
          (invoiceDoc.paidAmount || 0) + Number(inv.amountPaid);

        const newBalance = invoiceDoc.netAmount - newPaid;

        await SalesInvoice.findByIdAndUpdate(inv.invoiceId, {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus:
            newBalance <= 0 ? "PAID" : "PARTIAL",
        });
      }

      // 🧾 STEP 3: UPDATE RECEIPT
      const updatedReceipt = await PaymentReceipt.findByIdAndUpdate(
        id,
        {
          invoices: invoices.map((i) => ({
            invoiceId: i.invoiceId,
            amountPaid: Number(i.amountPaid),
            paymentMode: i.paymentMode || "Credit",
            referenceNo:
              i.paymentMode === "Credit" ? "" : i.referenceNo || "",
            paymentDate: i.paymentDate || null,
          })),
          totalReceived: Number(totalReceived),
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Receipt updated successfully",
        data: updatedReceipt,
      });
    }

    //Delete
    if (req.method === "DELETE") {
      const { id } = req.query;

      const receipt = await PaymentReceipt.findById(id);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }

      // 🔴 Reverse payments
      for (const inv of receipt.invoices) {
        const invoiceDoc = await SalesInvoice.findById(inv.invoiceId);

        const newPaid =
          (invoiceDoc.paidAmount || 0) - (inv.amountPaid || 0);

        const newBalance = invoiceDoc.netAmount - newPaid;

        await SalesInvoice.findByIdAndUpdate(inv.invoiceId, {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus:
            newBalance <= 0
              ? "PAID"
              : newPaid > 0
                ? "PARTIAL"
                : "UNPAID",
        });
      }

      await PaymentReceipt.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Receipt deleted successfully",
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
