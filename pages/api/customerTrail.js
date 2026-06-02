import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import SalesInvoice from "@/models/SalesInvoice";
import CustomerTrial from "@/models/CustomerTrial";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const customers = await Customer.find();

    // Aggregate sales, paid, and outstanding amounts customer-wise
    // const outstandingData = await SalesInvoice.aggregate([
    //   {
    //     $group: {
    //       _id: "$customer",
    //       totalOutstanding: { $sum: "$balanceAmount" },
    //       totalSales: { $sum: "$netAmount" },
    //       totalPaid: { $sum: "$paidAmount" },
    //     },
    //   },
    // ]);
    const outstandingData = await SalesInvoice.aggregate([
      {
        $project: {
          customer: 1,
          outstanding: {
            $subtract: [
              { $ifNull: ["$netAmount", 0] },
              { $ifNull: ["$paidAmount", 0] },
            ],
          },
        },
      },
      {
        $match: {
          outstanding: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$customer",
          totalOutstanding: { $sum: "$outstanding" },
        },
      },
    ]);
    const trialData = customers.map((cust) => {
      const outstandingObj = outstandingData.find(
        (d) => d._id.toString() === cust._id.toString()
      );

      const totalSales = outstandingObj?.totalSales || 0;
      const totalPaid = outstandingObj?.totalPaid || 0;
      const outstanding = outstandingObj?.totalOutstanding || 0;
      const openingBalance = cust.openingBalance || 0;

      const finalBalance = openingBalance + outstanding;

      return {
        id: cust._id,
        customerId: cust.code || cust._id,
        customerName: cust.custName,
        company: cust.company || "",

        openingBalance,
        // debit: totalSales,
          debit: outstanding,
        credit: totalPaid,

        // Outstanding balance including opening balance
        closingBalance: finalBalance,

        balanceType:
          finalBalance > 0
            ? "Dr"
            : finalBalance < 0
              ? "Cr"
              : "Balanced",
      };
    });
    const filteredTrialData = trialData.filter(
      (row) => row.closingBalance > 0
    );
    const totalClosingBalance = trialData.reduce(
      (sum, row) => sum + (row.closingBalance || 0),
      0
    );

    // Update existing CustomerTrial records
    await Promise.all(
      filteredTrialData.map((t) =>
        CustomerTrial.findOneAndUpdate(
          { customer: t.id },
          {
            ...t,
            snapshotDate: new Date(),
          },
          { new: true }
        )
      )
    );

    return res.status(200).json({
      data: filteredTrialData,
      // data: trialData,
      totalClosingBalance,
    });
  } catch (error) {
    console.error("Customer Trial Error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}