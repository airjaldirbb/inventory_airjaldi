// pages/api/salesInvoice.js

import mongoose from "mongoose";
import dbConnect from "@/lib/db";

import SalesInvoice from "@/models/SalesInvoice";
import Customer from "@/models/Customer";
import Branch from "@/models/Branch";
import Item from "@/models/Item";
import Agent from "@/models/Agent";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const method = req.method;

    // =====================================================
    // GET ALL / SINGLE / PENDING
    // =====================================================
    if (method === "GET") {
      const { invoiceNumber, customerId, pending } = req.query;

      // Single Invoice
      if (invoiceNumber) {
        const invoice = await SalesInvoice.findOne({ invoiceNumber })
          .populate("customer")
          .populate("branch")
          .populate("agent")
          .populate("items.item");

        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        return res.status(200).json({
          message: "Invoice fetched",
          data: invoice,
        });
      }

      // Pending by customer
      if (customerId && pending === "true") {
        const invoices = await SalesInvoice.find({
          customer: customerId,
          paymentStatus: { $ne: "PAID" },
        })
          .populate("customer")
          .sort({ invoiceDate: 1 });

        return res.status(200).json({
          count: invoices.length,
          data: invoices,
        });
      }

      // All invoices
      const invoices = await SalesInvoice.find()
        .sort({ createdAt: -1 })
        .populate("customer")
        .populate("branch")
        .populate("agent")
        .populate("items.item");

      return res.status(200).json({
        count: invoices.length,
        data: invoices,
      });
    }

    // =====================================================
    // CREATE NEW INVOICE
    // =====================================================
    if (method === "POST") {
      const {
        invoiceNumber,
        invoiceDate,
        customer,
        customerDetails,
        branch,
        items,
        paymentMode,
        gstType,
        agent,
      } = req.body;

      if (!customer || !branch || !items?.length) {
        return res.status(400).json({
          message: "Customer, branch and items required",
        });
      }

      // =====================================================
      // AUTO INVOICE NUMBER
      // =====================================================
      let newInvoiceNumber = invoiceNumber;

      if (!newInvoiceNumber) {
        const last = await SalesInvoice.findOne()
          .sort({ createdAt: -1 })
          .select("invoiceNumber");

        if (last?.invoiceNumber) {
          const num = parseInt(last.invoiceNumber) + 1;
          newInvoiceNumber = String(num).padStart(3, "0");
        } else {
          newInvoiceNumber = "001";
        }
      }

      // =====================================================
      // VALIDATE BRANCH
      // =====================================================
      const branchDoc = await Branch.findById(branch);

      if (!branchDoc) {
        return res.status(404).json({
          message: "Branch not found",
        });
      }

      // =====================================================
      // RESOLVE CUSTOMER
      // =====================================================



      // Jaze customer
      // =====================================================
      // RESOLVE CUSTOMER
      // =====================================================
      let customerDoc = null;

      // -------------------------------------
      // Manual customer
      // -------------------------------------
      if (mongoose.Types.ObjectId.isValid(customer)) {
        customerDoc = await Customer.findById(customer);
      }

      // -------------------------------------
      // Jaze customer
      // -------------------------------------
      if (!customerDoc) {
        const jazeId = String(customer);
        const d = customerDetails || {};

        customerDoc = await Customer.findOne({
          jazeCustomerId: jazeId,
        });

        // create first time
        if (!customerDoc) {
          customerDoc = await Customer.create({
            jazeCustomerId: jazeId,

            username: d.username || "",

            custName:
              d.custName ||
              d.username ||
              "Jaze User",

            code: `JZ-${Date.now()}`,

            phone:
              d.phone ||
              "9999999999",

            email:
              d.email ||
              "noemail@test.com",

            city:
              d.city || "NA",

            location:
              d.location || "NA",

            gst:
              d.gst || "",

            company:
              d.company || "",
          });
        }

        // update existing old record
        else {
          customerDoc.username =
            d.username ||
            customerDoc.username;

          customerDoc.custName =
            d.custName ||
            customerDoc.custName;

          customerDoc.phone =
            d.phone ||
            customerDoc.phone;

          customerDoc.email =
            d.email ||
            customerDoc.email;

          customerDoc.city =
            d.city ||
            customerDoc.city;

          customerDoc.location =
            d.location ||
            customerDoc.location;

          customerDoc.gst =
            d.gst ||
            customerDoc.gst;

          customerDoc.company =
            d.company ||
            customerDoc.company;

          await customerDoc.save();
        }
      }

      if (!customerDoc) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }



      // =====================================================
      // AGENT
      // =====================================================
      let agentDoc = null;

      if (agent && mongoose.Types.ObjectId.isValid(agent)) {
        agentDoc = await Agent.findById(agent);
      }

      // =====================================================
      // ITEMS
      // =====================================================
      const enrichedItems = await Promise.all(
        items.map(async (row) => {
          const itemDoc = await Item.findById(row.item);

          if (!itemDoc) {
            throw new Error("Item not found");
          }

          const qty = Number(row.quantity);
          const rate = Number(row.rate || itemDoc.rate || 0);
          const gstPercentage = Number(
            row.gstPercentage || itemDoc.gstPercentage || 0
          );

          const basic = qty * rate;
          const gstAmount = (basic * gstPercentage) / 100;
          const total = basic + gstAmount;

          return {
            item: row.item,
            quantity: qty,
            unit: row.unit || itemDoc.stockUnit || "pcs",
            rate,
            gstPercentage,
            gstAmount,
            total,
          };
        })
      );

      const totalAmount = enrichedItems.reduce(
        (sum, i) => sum + i.total,
        0
      );

      const totalGST = enrichedItems.reduce(
        (sum, i) => sum + i.gstAmount,
        0
      );

      const netAmount = totalAmount;

      // =====================================================
      // SAVE
      // =====================================================
      const invoice = await SalesInvoice.create({
        invoiceNumber: newInvoiceNumber,
        invoiceDate: invoiceDate || Date.now(),

        customer: customerDoc._id,
        customerName:
          customerDoc.username ||
          customerDoc.custName,

        jazeCustomerId:
          customerDoc.jazeCustomerId || "",

        branch,
        agent: agentDoc?._id || null,

        paymentMode: paymentMode || "CASH",
        gstType: gstType || "TAX_INVOICE",

        items: enrichedItems,

        totalAmount,
        totalGST,
        netAmount,

        paidAmount:
          paymentMode === "CASH"
            ? netAmount
            : 0,

        balanceAmount:
          paymentMode === "CASH"
            ? 0
            : netAmount,

        paymentStatus:
          paymentMode === "CASH"
            ? "PAID"
            : "UNPAID",
      });

      await invoice.populate("customer");
      await invoice.populate("branch");
      await invoice.populate("agent");
      await invoice.populate("items.item");

      return res.status(201).json({
        message: "Invoice created",
        data: invoice,
      });
    }

    // =====================================================
    // UPDATE
    // =====================================================
    if (method === "PUT") {
      const { id } = req.query;

      const invoice = await SalesInvoice.findById(id);

      if (!invoice) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      Object.assign(invoice, req.body);

      await invoice.save();

      return res.status(200).json({
        message: "Updated successfully",
      });
    }

    // =====================================================
    // DELETE
    // =====================================================
    if (method === "DELETE") {
      const { id } = req.query;

      const invoice = await SalesInvoice.findById(id);

      if (!invoice) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      if (invoice.paymentStatus !== "UNPAID") {
        return res.status(400).json({
          message:
            "Cannot delete paid invoice",
        });
      }

      await invoice.deleteOne();

      return res.status(200).json({
        message: "Deleted successfully",
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}