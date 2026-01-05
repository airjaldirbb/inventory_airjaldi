import mongoose from "mongoose";

const customerTrialSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    openingBalance: { type: Number, default: 0 },
    debit: { type: Number, default: 0 },       // Total sales
    credit: { type: Number, default: 0 },      // Total receipts
    closingBalance: { type: Number, default: 0 },
    balanceType: { type: String, enum: ["Dr", "Cr", "Balanced"], default: "Balanced" },
    snapshotDate: { type: Date, default: Date.now }, // Date of this snapshot
  },
  { timestamps: true }
);

export default mongoose.models.CustomerTrial ||
  mongoose.model("CustomerTrial", customerTrialSchema);
