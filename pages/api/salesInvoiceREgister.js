// pages/api/salesInvoiceREgister.js

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

/* =========================================================
   HELPERS
========================================================= */

const calcTotal = (items = []) =>
  items.reduce(
    (sum, item) =>
      sum +
      Number(
        item.total ||
        item.amount ||
        item.invoiceAmount ||
        0
      ),
    0
  );

/* =========================================================
   API HANDLER
========================================================= */

export default async function handler(req, res) {
  await dbConnect();

  try {
    const method = req.method;

    /* =====================================================
       GET : SALES REGISTER
    ===================================================== */
    if (method === "GET") {
      const register = [];

      const sales = await SalesInvoice.find()
        .populate("branch")
        .populate("customer")
        .populate("items.item");

      sales.forEach((doc) => {
        if (!doc.branch) return;

        doc.items.forEach((row) => {
          if (!row.item) return;

          register.push({
            id: row._id.toString(),

            parentId: doc._id,
            itemId: row._id,
            transactionType: "SALE",

            invoiceNo: doc.invoiceNumber,
            invoiceDate: doc.invoiceDate,

           
            customer: doc.customer
              ? {
                _id: doc.customer._id,
                custName: doc.customer.custName,
                username: doc.customer.username || "",
              }
              : null,

            branch: {
              _id: doc.branch._id,
              name: doc.branch.name,
            },

            item: {
              _id: row.item._id,
              itemName: row.item.itemName,
            },

            qty: row.quantity,
            uom: row.unit || "pcs",
            rate: row.rate || 0,
            taxPercent: row.gstPercentage || 0,
            taxAmount: row.gstAmount || 0,
            invoiceAmount: row.total || 0,
            paymentStatus:
              doc.paymentStatus || "PENDING",
          });
        });
      });

      const totalAmount = register.reduce(
        (sum, row) =>
          sum + Number(row.invoiceAmount || 0),
        0
      );

      return res.status(200).json({
        data: register,
        totalAmount,
      });
    }

    /* =====================================================
       POST : CREATE NEW SALES INVOICE ITEM
    ===================================================== */
    if (method === "POST") {
      const {
        parentId,
        item,
        qty,
        rate,
        gstPercentage = 0,
        unit = "pcs",
      } = req.body;

      const doc = await SalesInvoice.findById(parentId);

      if (!doc) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      const basic = Number(qty) * Number(rate);
      const gstAmount =
        (basic * Number(gstPercentage)) / 100;

      const total = basic + gstAmount;

      doc.items.push({
        item,
        quantity: qty,
        rate,
        gstPercentage,
        gstAmount,
        total,
        unit,
      });

      doc.totalAmount = doc.items.reduce(
        (sum, row) => sum + Number(row.total || 0),
        0
      );

      await SalesInvoice.updateOne(
        { _id: parentId },
        {
          items: doc.items,
          totalAmount: doc.totalAmount,
        }
      );

      return res.status(201).json({
        message: "Item added successfully",
        totalAmount: doc.totalAmount,
      });
    }

    /* =====================================================
       PUT : UPDATE SALES ITEM
    ===================================================== */
    if (method === "PUT") {
      const { id, itemId } = req.query;
      const { qty, rate } = req.body;

      if (!id || !itemId) {
        return res.status(400).json({
          message:
            "id and itemId are required",
        });
      }

      const doc =
        await SalesInvoice.findById(id);

      if (!doc) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      doc.items = doc.items.map((row) => {
        if (
          row._id.toString() !== itemId
        )
          return row;

        const updatedQty = Number(
          qty ?? row.quantity
        );

        const updatedRate = Number(
          rate ?? row.rate
        );

        const basic =
          updatedQty * updatedRate;

        const gstAmount =
          (basic *
            Number(
              row.gstPercentage || 0
            )) /
          100;

        return {
          ...row._doc,
          quantity: updatedQty,
          rate: updatedRate,
          gstAmount,
          total: basic + gstAmount,
        };
      });

      doc.totalAmount = calcTotal(
        doc.items
      );

      await doc.save();

      return res.status(200).json({
        message:
          "Updated successfully",
        totalAmount:
          doc.totalAmount,
      });
    }

    /* =====================================================
       DELETE : REMOVE ITEM
    ===================================================== */
    if (method === "DELETE") {
      const { parentId, itemId } =
        req.body;

      if (!parentId || !itemId) {
        return res.status(400).json({
          message:
            "parentId and itemId required",
        });
      }

      const doc =
        await SalesInvoice.findById(
          parentId
        );

      if (!doc) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      doc.items = doc.items.filter(
        (row) =>
          row._id.toString() !== itemId
      );

      doc.totalAmount = calcTotal(
        doc.items
      );

      await doc.save();

      return res.status(200).json({
        message:
          "Deleted successfully",
        totalAmount:
          doc.totalAmount,
      });
    }

    /* =====================================================
       INVALID METHOD
    ===================================================== */
    return res.status(405).json({
      message:
        "Method not allowed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}