import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  gstNo: { type: String, required: true },

  name: { type: String, default: "" },
  printName: { type: String, default: "" },

  identificationCode: { type: String, default: "" },

  underLedger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ledger",
    required: true
  },

  vendorType: {
    type: String,
    enum: ["Common", "SubVendor"],
    default: "Common"
  },

  isSubVendor: { type: Boolean, default: false },

  email: { type: String, default: "" },

  attachments: [String],

  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
