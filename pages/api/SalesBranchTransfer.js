import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import SaleBranchTransfer from "@/models/SaleBranchTransfer";
import Item from "@/models/Item";
import Branch from "@/models/Branch";
import Customer from "@/models/Customer";
import Agent from "@/models/Agent";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const method = req.method;

    // =====================================================
    // GET TRANSFERS
    // =====================================================
    if (method === "GET") {
      const { invoiceNumber, pending } = req.query;

      if (invoiceNumber) {
        const invoice = await SaleBranchTransfer.findOne({ invoiceNumber })
          .populate("branch")
          .populate("items.item")
          .populate("agent");
        if (!invoice)
          return res.status(404).json({ message: "Transfer not found" });
          return res.status(200).json({
          message: "Transfer fetched",
          data: invoice,
        });
      }

      if (customerId && pending === "true") {
        if (!mongoose.Types.ObjectId.isValid(customerId))
          return res.status(400).json({ message: "Invalid customerId" });

        const invoices = await SaleBranchTransfer.find({
          customer: customerId,
          paymentStatus: { $ne: "PAID" },
        })
          .select(
            "invoiceNumber invoiceDate netAmount paidAmount balanceAmount paymentStatus paymentMode"
          )
          .sort({ invoiceDate: 1 });

        return res.status(200).json({
          message: "Pending transfers fetched",
          count: invoices.length,
          data: invoices,
        });
      }

      const invoices = await SaleBranchTransfer.find()
        .sort({ createdAt: -1 })
        .populate("branch")
        // .populate("customer")
        .populate("items.item")
        .populate("agent");

      return res.status(200).json({
        message: `Fetched ${invoices.length} transfers`,
        count: invoices.length,
        data: invoices,
      });
    }

    // =====================================================
    // POST (CREATE TRANSFER)
    // =====================================================
    
    if (method === "POST") {
      const {
        invoiceNumber,
        invoiceDate,
        customer,
        fromBranch,
        toBranch,
        items,
        paymentMode,
        gstType,
        customerDetails,
        agent,
      } = req.body;

      if ( !fromBranch || !toBranch || !items || items.length === 0) {
        return res.status(400).json({
          message: "fromBranch, toBranch and items are required",
        });
      }

      // 🔹 AUTO GENERATE INVOICE NUMBER
      let newInvoiceNumber = invoiceNumber;

      if (!invoiceNumber) {
        const lastInvoice = await SaleBranchTransfer.findOne()
          .sort({ createdAt: -1 })
          .select("invoiceNumber");

        if (lastInvoice?.invoiceNumber) {
          const match = lastInvoice.invoiceNumber.match(/\d+$/);
          const lastNum = match ? parseInt(match[0], 10) : 0;
          newInvoiceNumber = String(lastNum + 1).padStart(3, "0");
        } else {
          newInvoiceNumber = "001";
        }
      }

      // 🔹 VALIDATE BRANCH

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

      // 🔥 CUSTOMER LOGIC SAME
      let customerDoc = null;

      if (mongoose.Types.ObjectId.isValid(customer)) {
        customerDoc = await Customer.findById(customer);
      }

      if (!customerDoc) {
        const jazeId = String(customer);

        customerDoc = await Customer.findOne({
          jazeCustomerId: jazeId,
        });

        if (!customerDoc) {
          const details = customerDetails || {};

          customerDoc = await Customer.create({
            jazeCustomerId: jazeId,
            custName: details.custName || "Jaze User",
            code: `JZ-${Date.now()}`,
            phone: details.phone || "9999999999",
            email: details.email || "noemail@test.com",
            city: details.city || "NA",
            location: details.location || "NA",
            gst: details.gst || "NA",
            company: details.company || "",
          });
        }
      }

      if (!customerDoc) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // 🔹 AGENT
      let agentDoc = null;

      if (agent && mongoose.Types.ObjectId.isValid(agent)) {
        agentDoc = await Agent.findById(agent);

        if (!agentDoc) {
          return res.status(404).json({ message: "Agent not found" });
        }
      }

      // 🔹 ENRICH ITEMS (SAME LOGIC)
      const enrichedItems = await Promise.all(
        items.map(async (i, index) => {
          const { item, quantity, rate, unit, gstPercentage } = i;

          if (!item || !quantity) {
            throw new Error(`Missing item at row ${index + 1}`);
          }

          const itemDoc = await Item.findById(item);
          if (!itemDoc) throw new Error(`Item not found`);

          const finalRate = rate ?? itemDoc.rate ?? 0;
          const finalUnit = unit ?? itemDoc.stockUnit ?? "pcs";
          const gstPerc = gstPercentage
            ? parseFloat(gstPercentage)
            : parseFloat(itemDoc.gstPercentage || 0);

          const total = quantity * finalRate;
          const gstAmount = (total * gstPerc) / 100;

          return {
            item,
            quantity,
            unit: finalUnit,
            rate: finalRate,
            gstPercentage: gstPerc,
            gstAmount,
            total,
          };
        })
      );

      const totalAmount = enrichedItems.reduce((s, i) => s + i.total, 0);
      const totalGST = enrichedItems.reduce((s, i) => s + i.gstAmount, 0);
      const netAmount = totalAmount + totalGST;

      // 🔹 CREATE
      const newTransfer = await SaleBranchTransfer.create({
        invoiceNumber: newInvoiceNumber,
        invoiceDate: invoiceDate || Date.now(),
        agent: agentDoc?._id || null,

        fromBranch, // ✅
        toBranch,   // ✅

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
      // await newTransfer.populate("branch");
      await newTransfer.populate("fromBranch");
      await newTransfer.populate("toBranch");
      // await newTransfer.populate("customer");
      await newTransfer.populate("items.item");
      await newTransfer.populate("agent");

      return res.status(201).json({
        message: "Sales Transfer created successfully",
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