import mongoose from "mongoose";

const billPaymentPurchaseSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  
    email: {
      type: String,
    },
    cashBank: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    chequeNo: {
      type: String,
    },
    chequeDate: {
      type: Date,
    },
    remark: {
      type: String,
      maxlength: 250,
    },
    attachment: {
      type: String,
    },

    // Financial fields
    totalBill: { type: Number, default: 0 },
    cashDiscount: { type: Number, default: 0 },
    tdsDeducted: { type: Number, default: 0 },
    gstTds: { type: Number, default: 0 },
    delayInterest: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    onAccount: { type: Number, default: 0 },
    totalPayment: { type: Number, default: 0 },
    bankCharges: { type: Number, default: 0 },
    netBankImpact: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.BillPaymentPurchase ||
  mongoose.model("BillPaymentPurchase", billPaymentPurchaseSchema);
 