// // pages/api/barcodeScan.js

// import dbConnect from "@/lib/db";
// import Item from "@/models/Item";

// export const config = {
//   api: {
//     externalResolver: true,
//   },
// };

// export default async function handler(req, res) {
//   await dbConnect();

//   try {
//     if (req.method === "GET") {
//       console.log("📥 Fetching items where barcodeTracking = \"ENABLE\"");

//       const items = await Item.find({ barcodeTracking: "ENABLE" }).populate("branch");
//       console.log(`📄 Found ${items.length} item(s) with barcodeTracking=ENABLE`);

//       const itemsWithBranchFlag = items.map((item) => {
//         const obj = {
//           ...item.toObject(),
//           belongsToBranch: true,
//         };
//         console.log("→ Item:", {
//           itemCode: obj.itemCode,
//           barcodeTracking: obj.barcodeTracking
//         });
//         return obj;
//       });

//       return res.status(200).json({
//         message: `Fetched ${itemsWithBranchFlag.length} items with barcode tracking ENABLED`,
//         count: itemsWithBranchFlag.length,
//         data: itemsWithBranchFlag,
//       });
//     }

//     console.warn("⚠️ Method not allowed:", req.method);
//     return res.status(405).json({ message: "Method not allowed" });
//   } catch (error) {
//     console.error("❌ API error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// }
