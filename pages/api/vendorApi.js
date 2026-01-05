import dbConnect from "@/lib/db";
import Vendor from "@/models/Vendor";
import Ledger from "@/models/Ledger";
export default async function handler(req, res) {
  await dbConnect();


  try {
    // =======================================
    //      1️⃣  GET Vendor List OR Dropdowns
    // =======================================
    if (req.method === "GET") {
      const { dropdown } = req.query;

      // GET DROPDOWN DATA
      if (dropdown === "true") {
        const ledgers = await Ledger.find();

        return res.status(200).json({
          vendorTypes: [
            { id: 1, name: "Common" },
            { id: 2, name: "SubVendor" }
          ],

          ledgers: ledgers.map((l) => ({
            id: l._id,
            name: l.ledger_name
          })),
        });
      }

      // GET ALL VENDORS
      const vendors = await Vendor.find().sort({ createdAt: -1 });
      return res.status(200).json(vendors);
    }

    // =======================================
    //      2️⃣  POST → Create Vendor(s)
    // =======================================
    if (req.method === "POST") {
      const { vendors } = req.body; // expect array input

      if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
        return res.status(400).json({ message: "vendors array is required" });
      }

      // Validate each vendor
      for (const vendor of vendors) {
        if (!vendor.gstNo) {
          return res.status(400).json({ message: "GST No is mandatory" });
        }
        if (!vendor.underLedger) {
          return res.status(400).json({ message: "underLedger is required" });
        }
      }

      // Insert into DB
      const newVendors = await Vendor.insertMany(vendors, { ordered: false });

      return res.status(201).json(newVendors);
    }

      // =======================================
    //      3️⃣ DELETE → Delete Vendor by ID
    // =======================================
 if (req.method === "DELETE") {
  const { id, _id } = req.query;
  const vendorId = id || _id;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID is required" });
  }

  const deletedVendor = await Vendor.findByIdAndDelete(vendorId);

  if (!deletedVendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  return res.status(200).json({ message: "Vendor deleted successfully" });
}

    // =======================================
    //          METHOD NOT ALLOWED
    // =======================================
    return res.status(405).json({ message: "Method Not Allowed" });

  } catch (error) {
    console.error("❌ Vendor API Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}
