import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema({
  ledger_name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
