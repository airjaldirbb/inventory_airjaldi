import dbConnect from "@/lib/db";
import { getBucket } from "@/lib/gridfs";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  const { id, filename } = req.query;
  const bucket = getBucket();

  if (!bucket) {
    return res.status(500).json({ error: "GridFS not initialized" });
  }

  const getMimeType = (filename) => {
    if (filename.match(/\.jpg|\.jpeg$/i)) return "image/jpeg";
    if (filename.match(/\.png$/i)) return "image/png";
    if (filename.match(/\.gif$/i)) return "image/gif";
    if (filename.match(/\.webp$/i)) return "image/webp";
    if (filename.match(/\.pdf$/i)) return "application/pdf";
    return "application/octet-stream";
  };

  try {
    let file;

    // ================= ID =================
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const files = await bucket.find({
        _id: new mongoose.Types.ObjectId(id),
      }).toArray();

      if (!files.length) {
        return res.status(404).json({ error: "File not found" });
      }

      file = files[0];

      // ✅ FIX HERE
      res.setHeader(
        "Content-Type",
        file.contentType || getMimeType(file.filename)
      );

      return bucket.openDownloadStream(file._id).pipe(res);
    }

    // ================= FILENAME =================
    if (filename) {
      const files = await bucket.find({ filename }).toArray();

      if (!files.length) {
        return res.status(404).json({ error: "File not found" });
      }

      file = files[0];

      // ✅ FIX HERE ALSO
      res.setHeader(
        "Content-Type",
        file.contentType || getMimeType(file.filename)
      );

      return bucket.openDownloadStreamByName(filename).pipe(res);
    }

    return res.status(400).json({ error: "Provide filename or id" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}