import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

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

    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        rate: {
          type: Number,
          required: true,
        },

        taxPercent: {
          type: Number, // 5, 12, 18, 28
          required: true,
        },

        taxAmount: {
          type: Number,
          required: true,
        },

        total: {
          type: Number, // qty * rate + tax
          required: true,
        },
      },
    ],

    taxAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "CANCELLED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

export default mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema);
