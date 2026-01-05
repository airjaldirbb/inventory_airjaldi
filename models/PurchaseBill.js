import mongoose from "mongoose";

/* ==================== ITEM SCHEMA ==================== */
const ItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    unit: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true },
    taxPercent: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0 },
    freightAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

/* ================== PURCHASE BILL SCHEMA ================== */
const PurchaseBillSchema = new mongoose.Schema(
  {
    gstType: { type: String, default: "TaxInvoice" },
    cashOrCredit: { type: String, default: "Credit" },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    email: { type: String, default: "" },

    date: { type: Date, required: true },

    invoiceNo: {
      type: String,
      default: function () {
        return `PI-${Date.now()}`;
      },
    },

    supplierInvNo: { type: String, required: true },
    supplierInvDate: { type: Date, required: true },

    taxMode: { type: String, default: "Exclusive" },
    paymentTerms: { type: String, default: "" },
    dueDate: { type: Date },

    amount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    freightAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    remarks: { type: String, default: "" },

    items: [ItemSchema],

    attachments: [String],
  },
  { timestamps: true }
);

export default mongoose.models.PurchaseBill ||
  mongoose.model("PurchaseBill", PurchaseBillSchema);
