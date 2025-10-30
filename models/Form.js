import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    itemCode: { type: String, required: true },

    // Must match one of the enum values
    underGroup: {
      type: String,
      required: true,
      enum: ["Consumption", "Fiber Equipment", "Wireless CPE", "Assets"]
    },

    stockUnit: {
      type: String,
      required: true,
      enum: ["Kg", "Litre", "Piece", "Box"]
    },

    gstClassification: {
      type: String,
      required: true,
      enum: ["5%", "12%", "18%", "28%"]
    },
   serialTracking: { type: String },
  serialTrackingEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", formSchema);
