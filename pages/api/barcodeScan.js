// pages/api/barcode-scan.js
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import MaterialReceipt from "@/models/MaterialReceipt";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { barcode, branch, user } = req.body;

  const item = await Item.findOne({ itemCode: barcode, barcodeTracking: "ENABLE" });
  if (!item) return res.status(404).json({ message: "Item not found or barcode tracking disabled" });

  const receipt = await MaterialReceipt.create({
    item: item._id,
    branch,
    quantity: 1,
    receivedBy: user,
    source: "Barcode Scan"
  });

  res.status(201).json({ message: "Item received via barcode", data: receipt });
}