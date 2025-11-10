import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },        // Name
    itemCode: { type: String, required: true },        // Code
    hsnCode: { type: String, default: "Default" },     // HSN_Code
    categoryName: { type: String, default: "" },       // Category_Name

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
    branch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: [] }], // make it an array
    underGroup: {
      type: String,
      enum: ["Consumption", "Fiber Equipments", "Wireless CPE", "Assets"], // make sure "Fiber Equipments" matches JSON
      default: "Assets",
    },

    openingStock: { type: Number, default: 0 },
    serialTracking: { type: String, default: "" },
    serialTrackingEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", formSchema);
