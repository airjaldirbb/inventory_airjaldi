import mongoose from "mongoose";

const salesInvoiceItemSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true },
    invoiceDate: { type: Date, required: true },

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

    qty: { type: Number, required: true }, // negative not recommended for sales
    uom: { type: String, default: "pcs" },

    rate: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },

    invoiceAmount: { type: Number, required: true },

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
  { _id: false }
);

const salesInvoiceRegisterSchema = new mongoose.Schema(
  {
    items: [salesInvoiceItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.SalesInvoiceRegister ||
  mongoose.model("SalesInvoiceRegister", salesInvoiceRegisterSchema);
