import dbConnect from "@/lib/db";
import PurchaseBill from "@/models/PurchaseBill";

export default async function handler(req, res) {
  await dbConnect();

  try {
    /* ================================
       GET ALL PURCHASE BILLS
    ================================= */
    if (req.method === "GET") {
      const bills = await PurchaseBill.find()
        .populate("vendor")
        .populate("branch")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: bills,
      });
    }

    /* ================================
       CREATE PURCHASE BILL
    ================================= */
    if (req.method === "POST") {
      const body = req.body;

      if (!body.branch || !body.vendor || !body.supplierInvNo) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      /* ---------- NORMALIZE ITEMS ---------- */
      const items = (body.items || []).map((i) => {
        const quantity = Number(i.quantity || i.qty || 0);
        const rate = Number(i.rate || 0);
        const amount = quantity * rate;
        const taxPercent = Number(i.taxPercent || 0);
        const taxAmount =
          i.taxAmount !== undefined
            ? Number(i.taxAmount)
            : (amount * taxPercent) / 100;
        const freightAmount = Number(i.freightAmount || 0);
        const totalAmount = amount + taxAmount + freightAmount;

        return {
          item: typeof i.item === "string" ? i.item : i.item?.itemName || "",
          unit: i.unit || i.uom || "",
          quantity,
          rate,
          amount,
          taxPercent,
          taxAmount,
          freightAmount,
          totalAmount,
          remarks: i.remarks || "",
        };
      });

      if (items.length === 0) {
        return res.status(400).json({ message: "At least one item is required" });
      }

      /* ---------- BILL TOTALS ---------- */
      const amount = items.reduce((a, i) => a + i.amount, 0);
      const taxAmount = items.reduce((a, i) => a + i.taxAmount, 0);
      const freightAmount = items.reduce((a, i) => a + i.freightAmount, 0);
      const totalAmount = amount + taxAmount + freightAmount;

      const taxPercent =
        items.reduce((a, i) => a + i.taxPercent, 0) / items.length;

      /* ---------- SAVE BILL ---------- */
      const bill = await PurchaseBill.create({
        gstType: body.gstType,
        cashOrCredit: body.cashOrCredit,
        branch: body.branch,
        vendor: body.vendor,
        email: body.email,
        date: body.date,
        invoiceNo: body.invoiceNo,
        supplierInvNo: body.supplierInvNo,
        supplierInvDate: body.supplierInvDate,
        taxMode: body.taxMode,
        paymentTerms: body.paymentTerms,
        dueDate: body.dueDate,
        remarks: body.remarks,
        items,
        amount,
        taxPercent,
        taxAmount,
        freightAmount,
        totalAmount,
         attachments: body.attachments || [],
      });

      return res.status(201).json({
        success: true,
        data: bill,
      });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("❌ PurchaseBill API Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
