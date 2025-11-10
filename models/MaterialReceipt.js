
import mongoose from "mongoose";

const receiptItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  qty: { type: Number, required: true },
  unit: { type: String },
  rate: { type: Number },
  amount: { type: Number },
  remarks: { type: String }
});

const materialReceiptSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  receiptDate: { type: Date, required: true },
  receiptNo: { type: String, required: true, unique: true },
  party: { type: String },
  items: [receiptItemSchema],
  totalAmount: { type: Number },
}, { timestamps: true });

export default mongoose.models.MaterialReceipt || mongoose.model("MaterialReceipt", materialReceiptSchema);