import mongoose from "mongoose";

const stockTrailSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    itemName: { type: String, required: true },
    uom: { type: String, required: true },

    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    transactionDate: { type: Date, required: true },
    transactionType: {
      type: String,
      enum: ["MATERIAL_RECEIPT", "MATERIAL_ISSUE", "SALES", "PURCHASE"],
      required: true,
    },

    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    referenceNo: { type: String },

    openingQty: { type: Number, default: 0 },
    stockIn: { type: Number, default: 0 },
    stockOut: { type: Number, default: 0 },
    balanceQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.StockTrail ||
  mongoose.model("StockTrail", stockTrailSchema);
