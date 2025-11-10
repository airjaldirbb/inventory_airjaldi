
import mongoose from "mongoose";

const stockAdjustmentSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  adjustmentType: {
    type: String,
    enum: ["INCREASE", "DECREASE"],
    required: true,
  },
  quantity: { type: Number, required: true },
  reason: {
    type: String,
    enum: ["Damage", "Loss", "Audit Correction", "Manual Correction", "Other"],
    default: "Other",
  },
  remarks: { type: String, default: "" },
  adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.StockAdjustment || mongoose.model("StockAdjustment", stockAdjustmentSchema);
