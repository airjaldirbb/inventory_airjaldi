import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import Branch from "@/models/Branch";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // ==================== GET ====================
    if (req.method === "GET") {
      const { branch } = req.query;

      const allItems = await Item.find().populate("branch");

      // const itemsWithBranchFlag = allItems.map((item) => {
      //   const branchesArray = item.branch || [];
      //   return {
      //     ...item.toObject(),
      //     belongsToBranch:
      //       branch && mongoose.Types.ObjectId.isValid(branch)
      //         ? branchesArray.some((b) => b._id.toString() === branch)
      //         : true,
      //   };
      // });
      const itemsWithBranchFlag = allItems.map((item) => {
        const belongsToBranch = branch && mongoose.Types.ObjectId.isValid(branch)
          ? item.branch.some((b) => b._id.toString() === branch)
          : true;

        return {
          ...item.toObject(),
          belongsToBranch
        };
      });

      const schemaPaths = Item.schema.paths;
      const enums = {
        underGroup: schemaPaths.underGroup?.options?.enum || [],
        stockUnit: schemaPaths.stockUnit?.options?.enum || [],
        gstClassification: schemaPaths.gstClassification?.options?.enum || [],
        barcodeTracking: schemaPaths.barcodeTracking?.options?.enum || [],
      };

      return res.status(200).json({
        message: branch
          ? `Fetched ${allItems.length} items for branch ${branch}`
          : `Fetched all ${allItems.length} items`,
        count: allItems.length,
        data: itemsWithBranchFlag,
        enums,
      });
    }

    // ==================== POST ====================
    if (req.method === "POST") {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const insertedItems = [];

      for (let i = 0; i < items.length; i++) {
        const {
          Name, Code, HSN_Code, Category_Name, Group,
          BAR_CODE_TRACKING, branch,
          MRP, MIN_RATE, RATE, PACK
        } = items[i];

        if (!Name || !Code || !Group) {
          return res.status(400).json({
            message: `Missing required fields in item ${i + 1}: Name, Code, Group are required`,
          });
        }

        let branchIds = [];
        if (branch) {
          branchIds = Array.isArray(branch) ? branch : [branch];
          for (let id of branchIds) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
              return res.status(400).json({ message: `Invalid branch ID: ${id}` });
            }
            const branchExists = await Branch.findById(id);
            if (!branchExists) {
              return res.status(404).json({ message: `Branch not found: ${id}` });
            }
          }
        }

        const newItem = await Item.create({
          itemName: Name,
          itemCode: Code,
          hsnCode: HSN_Code || "Default",
          categoryName: Category_Name || "",
          underGroup: Group,
          barcodeTracking: BAR_CODE_TRACKING || "DISABLE",
          branch: branchIds,
          mrp: MRP || 0,
          minRate: MIN_RATE || 0,
          rate: RATE || 0,
          pack: PACK || "",
        });

        await newItem.populate("branch");
        insertedItems.push(newItem);
      }

      return res.status(201).json({
        message: "Items created successfully",
        data: insertedItems,
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

        for (let id of branchIds) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid branch ID: ${id}` });
          }
          const branchExists = await Branch.findById(id);
          if (!branchExists) {
            return res.status(404).json({ message: `Branch not found: ${id}` });
          }
        }
        updateData.branch = branchIds;
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

    // ==================== METHOD NOT ALLOWED ====================
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}