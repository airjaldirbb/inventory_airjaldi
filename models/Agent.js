import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    code: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Agent || mongoose.model("Agent", agentSchema);
