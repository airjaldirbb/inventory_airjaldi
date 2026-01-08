import mongoose from "mongoose";

const issueItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  itemName: { type: String, required: true }, // ✅ store item name
  qty: { type: Number, required: true },
  unit: { type: String },
  rate: { type: Number },
  amount: { type: Number },
  remarks: { type: String }
});

const materialIssueSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  issueDate: { type: Date, required: true },
  issueNo: { type: String, required: true, unique: true },
  issuedTo: { type: String },
  items: [issueItemSchema],
  totalAmount: { type: Number },
}, { timestamps: true });

export default mongoose.models.MaterialIssue || mongoose.model("MaterialIssue", materialIssueSchema);
