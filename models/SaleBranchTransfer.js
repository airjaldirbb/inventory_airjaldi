import mongoose from "mongoose";

const saleBranchTransfer = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    // 🔥 OPTIONAL (for tracking external source)

    jazeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: { type: Number, required: true },
        unit: { type: String, default: "" },
        rate: { type: Number, required: true },
        gstPercentage: { type: Number, default: 0 },
        gstAmount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },

      },
    ],
    paymentMode: {
      type: String,
      enum: ["CASH", "CREDIT"],
      default: "CASH",
    },
    gstType: {
      type: String,
      enum: ["TAX_INVOICE", "REGISTERED", "COMPOSITION"],
      default: "TAX_INVOICE",
    },

    totalAmount: { type: Number, required: true, default: 0 },
    totalGST: { type: Number, required: true, default: 0 },
    netAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },

    balanceAmount: {
      type: Number,
      default: function () {
        return this.netAmount - this.paidAmount;
      },
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID"],
      default: "UNPAID",
    },
  },

  { timestamps: true }
);

export default mongoose.models.SalesTransfer ||
  mongoose.model("SalesTransfer", saleBranchTransfer);
