import mongoose from "mongoose";

const receiptItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
    default: "",
  },
});

const materialReceiptSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    receiptDate: {
      type: Date,
      required: false,
      index: true,
    },
    receiptNo: {
      type: String,
      required: true,
      unique: false,
    },
    party: {
      type: String,
      index: true,
    },
    items: {
      type: [receiptItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for register & reports
materialReceiptSchema.index({ branch: 1 });
materialReceiptSchema.index({ receiptDate: 1 });

export default mongoose.models.MaterialReceipt ||
  mongoose.model("MaterialReceipt", materialReceiptSchema);
