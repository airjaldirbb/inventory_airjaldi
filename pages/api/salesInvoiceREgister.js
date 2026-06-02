// pages/api/salesInvoiceREgister.js

import dbConnect from "@/lib/db";
import SalesInvoice from "@/models/SalesInvoice";

// force model registration
import "@/models/Branch";
import "@/models/Item";
import "@/models/Customer";

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

const getCustomerName = (customer) => {
  if (!customer) return "N/A";

  const username = customer.username || "";
  const custName = customer.custName || "";

  // if old bad data
  if (custName === "Jaze User") {
    return username || "N/A";
  }

  // both available
  if (username && custName) {
    return `${username} (${custName})`;
  }

  return custName || username || "N/A";
};


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
        .populate("items.item")
        .sort({ createdAt: -1 });

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

            customer: {
              _id: doc.customer?._id || "",
              name: getCustomerName(doc.customer),
              custName: doc.customer?.custName || "",
              username: doc.customer?.username || "",
            },

            branch: {
              _id: doc.branch?._id || "",
              name: doc.branch?.name || "N/A",
            },

            item: {
              _id: row.item?._id || "",
              itemName: row.item?.itemName || "N/A",
            },

            qty: row.quantity,
            uom: row.unit || "pcs",
            rate: row.rate || 0,
            taxPercent: row.gstPercentage || 0,
            taxAmount: row.gstAmount || 0,
            // invoiceAmount: row.total || 0,
            invoiceAmount:
              doc.netAmount > 0
                ? ((row.total || 0) / doc.netAmount) * (doc.balanceAmount || 0)
                : 0,
            // paymentStatus:
            //   doc.paymentStatus || "PENDING",
            paymentStatus:
              doc.balanceAmount <= 0
                ? "PAID"
                : doc.paidAmount > 0
                  ? "PARTIAL"
                  : "UNPAID",
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
      POST
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

      doc.totalAmount = calcTotal(doc.items);

      await doc.save();

      return res.status(201).json({
        message: "Item added successfully",
        totalAmount: doc.totalAmount,
      });
    }

    /* =====================================================
      PUT
    ===================================================== */
    if (method === "PUT") {
      const { id, itemId } = req.query;
      const { qty, rate } = req.body;

      const doc = await SalesInvoice.findById(id);

      if (!doc) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      doc.items = doc.items.map((row) => {
        if (row._id.toString() !== itemId)
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
            )) / 100;

        return {
          ...row._doc,
          quantity: updatedQty,
          rate: updatedRate,
          gstAmount,
          total: basic + gstAmount,
        };
      });

      doc.totalAmount = calcTotal(doc.items);

      await doc.save();

      return res.status(200).json({
        message: "Updated successfully",
        totalAmount: doc.totalAmount,
      });
    }

    /* =====================================================
      DELETE
    ===================================================== */
    if (method === "DELETE") {
      const { parentId, itemId } =
        req.body;

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

      doc.totalAmount = calcTotal(doc.items);

      await doc.save();

      return res.status(200).json({
        message: "Deleted successfully",
        totalAmount: doc.totalAmount,
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}