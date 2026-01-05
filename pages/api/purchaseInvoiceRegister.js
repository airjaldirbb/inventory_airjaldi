import dbConnect from "@/lib/db";
import PurchaseBill from "@/models/PurchaseBill";

// force model registration
import "@/models/Branch";
import "@/models/Vendor";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const register = [];

    const purchases = await PurchaseBill.find()
      .populate("branch")
      .populate("vendor");

    purchases.forEach((p) => {
      if (!p.branch || !p.vendor) return;

      p.items.forEach((i, index) => {
        const taxPercent = i.taxPercent ?? p.taxPercent ?? 0;
        const taxAmount = i.taxAmount ?? (i.amount * taxPercent) / 100;

        register.push({
          id: `${p._id}-${index}`,

          invoiceNo: p.supplierInvNo || p.invoiceNo || "",
          invoiceDate: p.date,

          vendor: {
            _id: p.vendor._id,
            name: p.vendor.name,
          },

          branch: {
            _id: p.branch._id,
            name: p.branch.name,
          },

          item: {
            itemName: i.item,
          },

          qty: i.quantity,
          uom: i.unit || "Nos",
          rate: i.rate,

          taxPercent,
          taxAmount,

          invoiceAmount:
            i.totalAmount ??
            (i.amount || 0) + taxAmount + (i.freightAmount || 0),
        });
      });
    });

    return res.status(200).json({ data: register });
  } catch (error) {
    console.error("❌ PurchaseInvoiceRegister API error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
