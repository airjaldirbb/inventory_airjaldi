import dbConnect from "@/lib/db";
import PurchaseOrder from "@/models/PurchaseOrder";
import MaterialReceipt from "@/models/MaterialReceipt";
import MaterialIssue from "@/models/MaterialIssue";
import SalesInvoice from "@/models/SalesInvoice";
import Item from "@/models/Item";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const { search, branch } = req.query; // <-- query param

    // 1️⃣ Fetch all items (apply search if provided)
    let branchFilter = {};

    if (branch) {
      branchFilter = { branch: new mongoose.Types.ObjectId(branch) };
    }
    const query = {};
    if (search) {
      query.itemName = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const items = await Item.find(query);

    if (!items.length) {
      return res.status(200).json({
        message: "No items found",
        count: 0,
        data: [],
      });
    }

    const itemIds = items.map((i) => i._id);

    // 2️⃣ Aggregate stock data (same as before)
    const poAgg = await PurchaseOrder.aggregate([
      { $unwind: "$items" },
      { $match: { "items.item": { $in: itemIds }, ...branchFilter, } },
      { $group: { _id: "$items.item", total: { $sum: "$items.quantity" } } },
    ]);
    const poMap = {};
    poAgg.forEach((x) => (poMap[x._id.toString()] = x.total));

    const mrAgg = await MaterialReceipt.aggregate([
      { $unwind: "$items" },
      { $match: { "items.itemId": { $in: itemIds }, ...branchFilter, } },
      { $group: { _id: "$items.itemId", total: { $sum: "$items.qty" } } },
    ]);
    const mrMap = {};
    mrAgg.forEach((x) => (mrMap[x._id.toString()] = x.total));

    const miAgg = await MaterialIssue.aggregate([
      { $unwind: "$items" },
      { $match: { "items.itemId": { $in: itemIds }, ...branchFilter, } },
      { $group: { _id: "$items.itemId", total: { $sum: "$items.qty" } } },
    ]);
    const miMap = {};
    miAgg.forEach((x) => (miMap[x._id.toString()] = x.total));

    const salesAgg = await SalesInvoice.aggregate([
      { $unwind: "$items" },
      { $match: { "items.item": { $in: itemIds }, ...branchFilter, } },
      { $group: { _id: "$items.item", total: { $sum: "$items.quantity" } } },
    ]);
    const salesMap = {};
    salesAgg.forEach((x) => (salesMap[x._id.toString()] = x.total));

    // 3️⃣ Merge results
    const stockData = items.map((item) => {
      const stockIn = (poMap[item._id.toString()] || 0) + (mrMap[item._id.toString()] || 0);
      const stockOut = (miMap[item._id.toString()] || 0) + (salesMap[item._id.toString()] || 0);
      const openingQty = 0;
      const balanceQty = openingQty + stockIn - stockOut;

      return {
        itemId: item._id,
        itemName: item.itemName,
        uom: item.stockUnit || "pcs",
        openingQty,
        stockIn,
        stockOut,
        balanceQty,
      };
    });

    return res.status(200).json({
      message: `Fetched stock trial for ${items.length} items`,
      count: stockData.length,
      data: stockData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
