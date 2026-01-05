import dbConnect from "@/lib/db";
import Item from "@/models/Item";

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const items = await Item.find({ barcodeTracking: "ENABLE" });
    console.log("✅ Items fetched:", items.length);

    return res.status(200).json({
      message: `Fetched ${items.length} barcode-enabled items`,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
