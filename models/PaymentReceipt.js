import mongoose from "mongoose";


const paymentReceiptSchema = new mongoose.Schema(  {
    receiptNumber: { type: String, required: true, unique: true },

    receiptDate: { type: Date, default: Date.now },
  

    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    // Customer dropdown from customer API
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

    // ---- New Field ----
    email: { type: String },

    // Multiple invoices
    invoices: [
      {
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SalesInvoice",
        },
        amountPaid: Number,  
        paymentMode:{
          type:String,
          enum:["Credit","Cash", "Online"],
          
        },
        referenceNo:{
          type:String,
          default:""
        },
        paymentDate:{
          type:Date
        }
      },
    ],

    totalReceived: { type: Number, required: true },

    // ---- New Field ----  
    cashBankAccount: { type: String }, // dropdown: Cash/Bank Ledgers

    // mode: {
    //   type: String,
    //   enum: ["CASH", "UPI", "BANK TRANSFER", "CHEQUE"],
    //   default: "CASH",
    // },

    // ---- New Fields ----
    chequeNo: { type: String },
    partyBankRef: { type: String },
    dated: { type: Date },

    salesman: { type: String },
    agent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentReceipt ||
  mongoose.model("PaymentReceipt", paymentReceiptSchema);
 