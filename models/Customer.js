import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    custName: { type: String, required: true },
    code: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    gst: { type: String, required: true },
    // remove gstn completely or make it optional
    // gstn: { type: String }, 

    user: { type: String, default: 'Tester' },
    ledger: { type: String, default: 'General Ledger' },
    serialTrackingEnabled: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
