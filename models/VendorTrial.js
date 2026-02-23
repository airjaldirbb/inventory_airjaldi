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
     totalClosingBalance: { type: Number, default: 0 }, //
  },
  { timestamps: true }
);

// Pre-save middleware to calculate totalClosingBalance
vendorTrialSchema.pre("save", async function (next) {
  // 'this' is a single VendorTrial document
  this.totalClosingBalance = this.closingBalance ?? 0;
  next();
});

export default mongoose.models.VendorTrial ||
  mongoose.model("VendorTrial", vendorTrialSchema);
