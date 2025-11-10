import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gstin: { type: String, required: true, unique: true }, // Added GSTIN
  },
  { timestamps: true }
);

export default mongoose.models.Branch || mongoose.model("Branch", branchSchema);
