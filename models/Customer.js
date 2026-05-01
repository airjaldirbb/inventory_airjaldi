import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    custName: { type: String, required: true },

    code: { type: String, required: true },

    phone: {
      type: String,
      required: true,
      default: "9999999999"
    },

    email: {
      type: String,
      required: true,
      default: "noemail@test.com"
    },

    city: {
      type: String,
      required: true,
      default: "NA"
    },

    location: {
      type: String,
      required: true,
      default: "NA"
    },

    gst: {
      type: String,
      required: true,
      default: "NA"
    },
    company: {
      type: String,
      default: ""
    },

    jazeCustomerId: {
      type: String,
      unique: true,
      sparse: true
    },

    user: { type: String, default: 'Tester' },
    ledger: { type: String, default: 'General Ledger' },
    serialTrackingEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);