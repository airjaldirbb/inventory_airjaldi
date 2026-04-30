import mongoose from "mongoose";

/* ================= ITEM SCHEMA ================= */
const salesInvoiceItemSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: false,
      trim: true,
    },

    invoiceDate: {
      type: Date,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    uom: {
      type: String,
      default: "pcs",
      trim: true,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    taxPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    invoiceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "ADJUSTMENT"],
      default: "PENDING",
    },

    transactionType: {
      type: String,
      enum: ["SALE"],
      default: "SALE",
    },
  },
  {
    _id: true,
  }
);

/* ================= MAIN SCHEMA ================= */
const salesInvoiceRegisterSchema = new mongoose.Schema(
  {
    items: [salesInvoiceItemSchema],

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= AUTO CALCULATIONS ================= */
salesInvoiceRegisterSchema.pre("save", function (next) {
  this.items = this.items.map((row) => {
    const qty = Number(row.qty || 0);
    const rate = Number(row.rate || 0);
    const taxPercent = Number(row.taxPercent || 0);

    const basicAmount = qty * rate;

    row.taxAmount = (basicAmount * taxPercent) / 100;

    row.invoiceAmount = basicAmount + row.taxAmount;

    return row;
  });

  this.totalAmount = this.items.reduce((sum, row) => {
    return sum + Number(row.invoiceAmount || 0);
  }, 0);

  next();
});

/* ================= EXPORT MODEL ================= */
export default mongoose.models.SalesInvoiceRegister ||
  mongoose.model(
    "SalesInvoiceRegister",
    salesInvoiceRegisterSchema
  );