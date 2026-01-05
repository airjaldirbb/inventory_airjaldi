import mongoose from "mongoose";

const purchaseInvoiceItemSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true },
    invoiceDate: { type: Date, required: true },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
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

    qty: { type: Number, required: true },
    uom: { type: String, default: "Nos" },

    rate: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },

    invoiceAmount: { type: Number, required: true },
  },
  { _id: false }
);

const purchaseInvoiceRegisterSchema = new mongoose.Schema(
  {
    items: [purchaseInvoiceItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.PurchaseInvoiceRegister ||
  mongoose.model("PurchaseInvoiceRegister", purchaseInvoiceRegisterSchema);
