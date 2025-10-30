import dbConnect from "@/lib/db";
import Form from "@/models/Form";

export default async function handler(req, res) {
  await dbConnect();

  try {
    console.log(`➡️ ${req.method} /api/item called`);

    if (req.method === "GET") {
      const items = await Form.find();
      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const {
        itemName,
        itemCode,
        underGroup,
        stockUnit,
        gstClassification,
        openingStock,
      } = req.body;

      const requiredFields = [
        "itemName",
        "itemCode",
        "underGroup",
        "stockUnit",
        "gstClassification",
        "openingStock",
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res
            .status(400)
            .json({ message: `Missing required field: ${field}` });
        }
      }


      const newItem = await Form.create({
        itemName,
        itemCode,
        underGroup,
        stockUnit,
        gstClassification,
        openingStock,
      });

      return res.status(201).json(newItem);
    }

    if (req.method === "PUT") {
      const { _id, ...rest } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id" });
      }

      const updated = await Form.findByIdAndUpdate(_id, rest, { new: true });

      if (!updated) {
        return res.status(404).json({ message: "Item not found" });
      }

      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id" });
      }

      await Form.findByIdAndDelete(_id);
      return res.status(200).json({ message: "Item deleted successfully" });
    }
    if (req.method === "PATCH") {
      const { _id, serialTrackingEnabled } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id" });
      }

      const updated = await Form.findByIdAndUpdate(
        _id,
        { serialTrackingEnabled },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Item not found" });
      }

      return res.status(200).json(updated);
    }


    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
