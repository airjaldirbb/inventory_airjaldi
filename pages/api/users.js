import dbConnect from "@/lib/db";
import Form from "@/models/Form";

export default async function handler(req, res) {
  await dbConnect();

  try {
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

      if (
        !itemName ||
        !itemCode ||
        underGroup === undefined ||
        !stockUnit ||
        !gstClassification ||
        !openingStock
      ) {
        return res.status(400).json({ message: "Missing required fields" });
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

    if (req.method === "DELETE") {
      const { _id } = req.body;
      if (!_id) return res.status(400).json({ message: "Missing _id" });

      await Form.findByIdAndDelete(_id);
      return res.status(200).json({ message: "Item deleted successfully" });
    }

    if (req.method === "PUT") {
      const { _id, ...rest } = req.body;
      if (!_id) return res.status(400).json({ message: "Missing _id" });

      const updated = await Form.findByIdAndUpdate(_id, rest, { new: true });
      if (!updated) return res.status(404).json({ message: "Not found" });

      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
