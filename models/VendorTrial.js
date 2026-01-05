import mongoose from "mongoose";

const vendorTrialSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    openingBalance: { type: Number, default: 0 },
    debit: { type: Number, default: 0 },   // Payments made
    credit: { type: Number, default: 0 },  // Purchases
    closingBalance: { type: Number, default: 0 },
    balanceType: { type: String, enum: ["Dr", "Cr"], default: "Cr" },
    periodStart: { type: Date }, // e.g., month start
    periodEnd: { type: Date },   // e.g., month end
  },
  { timestamps: true }
);

export default mongoose.models.VendorTrial ||
  mongoose.model("VendorTrial", vendorTrialSchema);
