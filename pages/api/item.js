import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import Branch from "@/models/Branch";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // ENUMS FOR FRONTEND
    const enums = {
      underGroup: Item.schema.path("underGroup").enumValues,
      stockUnit: Item.schema.path("stockUnit").enumValues,
      gstClassification: Item.schema.path("gstClassification").enumValues,
      barcodeTracking: Item.schema.path("barcodeTracking").enumValues,
    };

    // ==================== GET ====================
    if (req.method === "GET") {
      const { branch, barcode } = req.query;

      // If barcode is provided → fetch that item only
      if (barcode && barcode.trim() !== "") {
        const item = await Item.findOne({
          $or: [{ barcodeValue: barcode.trim() }, { itemCode: barcode.trim() }],
        }).populate("branch");

        if (!item) {
          return res.status(404).json({
            message: `Item not found for barcode/code: ${barcode}`,
          });
        }

        return res.status(200).json({
          message: "Item fetched via barcode/code",
          data: item,
          enums,
        });
      }

      // Fetch all items, optional branch filtering
      let allItems = await Item.find({}).populate("branch");

      if (branch && mongoose.Types.ObjectId.isValid(branch)) {
        allItems = allItems.map((item) => {
          const belongsToBranch = item.branch.some(
            (b) => b._id.toString() === branch
          );
          return { ...item.toObject(), belongsToBranch };
        });
      }

      return res.status(200).json({
        message: `Fetched ${allItems.length} items`,
        count: allItems.length,
        data: allItems,
        enums,
      });
    }

    // ==================== POST ====================
    if (req.method === "POST") {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const insertedItems = [];

      for (const [i, item] of items.entries()) {
        const {
          Name,
          Code,
          HSN_Code,
          Category_Name,
          Group,
          BAR_CODE_TRACKING,
          branch,
          MRP,
          MIN_RATE,
          RATE,
          PACK,
          stockUnit,
        } = item;

        if (!Name || !Code || !Group) {
          return res.status(400).json({
            message: `Missing required fields in item ${i + 1}: Name, Code, Group are required`,
          });
        }

        // Validate branches
        let branchIds = [];
        if (branch) {
          branchIds = Array.isArray(branch) ? branch : [branch];
          for (const id of branchIds) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
              return res.status(400).json({ message: `Invalid branch ID: ${id}` });
            }
            const exists = await Branch.findById(id);
            if (!exists) {
              return res.status(404).json({ message: `Branch not found: ${id}` });
            }
          }
        }

        // Validate stockUnit
        const validStockUnits = enums.stockUnit;
        const finalStockUnit =
          stockUnit && validStockUnits.includes(stockUnit) ? stockUnit : "Pcs";

        // Validate barcodeTracking
        const barcodeTracking =
          (BAR_CODE_TRACKING || "").toUpperCase() === "ENABLE"
            ? "ENABLE"
            : "DISABLE";

        const newItem = await Item.create({
          itemName: Name,
          itemCode: Code,
          barcodeValue: Code,
          barcodeTracking,
          hsnCode: HSN_Code || "Default",
          categoryName: Category_Name || "",
          underGroup: Group,
          branch: branchIds,
          mrp: MRP || 0,
          minRate: MIN_RATE || 0,
          rate: RATE || 0,
          pack: PACK || "",
          stockUnit: finalStockUnit,
        });

        await newItem.populate("branch");
        insertedItems.push(newItem);
      }

      return res.status(201).json({
        message: "Items created successfully",
        data: insertedItems,
        enums,
      });
    }

    // ==================== PUT ====================
    if (req.method === "PUT") {
      const { _id, ...updateData } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id for update" });
      }

      if (updateData.branch) {
        const branchIds = Array.isArray(updateData.branch)
          ? updateData.branch
          : [updateData.branch];

        for (const id of branchIds) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid branch ID: ${id}` });
          }
          const exists = await Branch.findById(id);
          if (!exists) {
            return res.status(404).json({ message: `Branch not found: ${id}` });
          }
        }

        updateData.branch = branchIds;
      }

      if (updateData.stockUnit) {
        const validStockUnits = enums.stockUnit;
        if (!validStockUnits.includes(updateData.stockUnit)) {
          updateData.stockUnit = "Pcs";
        }
      }

      const updatedItem = await Item.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
      }).populate("branch");

      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      return res.status(200).json({
        message: "Item updated successfully",
        data: updatedItem,
      });
    }

    // ==================== DELETE ====================
    if (req.method === "DELETE") {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({ message: "Missing _id for delete" });
      }

      const deletedItem = await Item.findByIdAndDelete(_id);
      if (!deletedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      return res.status(200).json({
        message: "Item deleted successfully",
        data: deletedItem,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
