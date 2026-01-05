import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import SalesInvoice from "@/models/SalesInvoice";
import PaymentReceipt from "@/models/PaymentReceipt";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const customers = await Customer.find();

    const debitSales = await SalesInvoice.aggregate([
      { $group: { _id: "$customer", totalDebit: { $sum: "$netAmount" } } },
    ]);

    const creditReceipts = await PaymentReceipt.aggregate([
      { $unwind: "$invoices" },
      { $group: { _id: "$customer", totalCredit: { $sum: "$invoices.amountPaid" } } },
    ]);

    const trialData = customers.map((cust) => {
      const debitObj = debitSales.find((d) => d._id.toString() === cust._id.toString());
      const creditObj = creditReceipts.find((c) => c._id.toString() === cust._id.toString());

      const openingBalance = cust.openingBalance || 0;
      const debit = debitObj ? debitObj.totalDebit : 0;
      const credit = creditObj ? creditObj.totalCredit : 0;
      const closing = openingBalance + debit - credit;

      return {
        id: cust._id,
        customerId: cust.code || cust._id,
        customerName: cust.custName,
        openingBalance,
        debit,
        credit,
        closingBalance: closing,
        balanceType: closing > 0 ? "Dr" : closing < 0 ? "Cr" : "Balanced",
      };
    });

    res.status(200).json({ data: trialData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
