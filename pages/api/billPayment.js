import dbConnect from "@/lib/db";
import BillPayment from "@/models/BillPaymentPurchase";
import BillPaymentPurchase from "@/models/BillPaymentPurchase";
export default async function handler(req, res) {
  await dbConnect();

  try {

    // ============================
    // GET all bill payments
    // ============================
    if (req.method === "GET") {
      const payments = await BillPaymentPurchase.find()
        .populate("vendor")
      
        .sort({ createdAt: -1 });

      return res.status(200).json(payments);
    }

    // ============================
    // POST bill payment(s)
    // ============================
    if (req.method === "POST") {
      const { payments } = req.body; // expecting array (same pattern as branches)

      if (!payments || !Array.isArray(payments) || payments.length === 0) {
        return res
          .status(400)
          .json({ message: "payments array is required" });
      }

      // Validate each payment
      for (const payment of payments) {
        if (
          !payment.vendor ||
        
          !payment.date
        ) {
          return res.status(400).json({
            message:
              "Each payment must have branch, vendor, voucherNo and date",
          });
        }
      }

      // Insert all bill payments
      const newPayments = await BillPaymentPurchase.insertMany(payments, {
        ordered: false,
      });

      return res.status(201).json(newPayments);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ BillPayment API error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
