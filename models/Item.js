import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  itemCode: { type: String, required: true, trim: true },
  hsnCode: { type: String, default: "Default" },
  categoryName: { type: String, default: "" },
  stockUnit: {
    type: String,
    enum: ["Kg", "Litre", "Piece", "Box"],
    default: "Piece",
  },
  gstClassification: {
    type: String,
    enum: ["5%", "12%", "18%", "28%"],
    default: "18%",
  },
  barcodeTracking: {
    type: String,
    enum: ["ENABLE", "DISABLE"],
    default: "DISABLE",
  },
  branch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: [] }],
  underGroup: {
    type: String,
    enum: ["Consumption", "Fiber Equipments", "Wireless CPE", "Assets"],
    default: "Assets",
  },
  openingStock: { type: Number, default: 0 },
  serialTracking: { type: String, default: "" },
  serialTrackingEnabled: { type: Boolean, default: false },
  mrp: { type: Number, default: 0 },
  minRate: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  pack: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.Item || mongoose.model("Item", itemSchema);