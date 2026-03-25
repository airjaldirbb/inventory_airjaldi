import dbConnect from "@/lib/db";
import { getBucket } from "@/lib/gridfs";
import multer from "multer";
import { Readable } from "stream";

export const config = {
  api: { bodyParser: false },
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  await runMiddleware(req, res, upload.single("file"));

  const bucket = getBucket();

  if (!bucket) {
    return res.status(500).json({ error: "GridFS not initialized" });
  }

  try {
    const file = req.file;

    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    const readable = new Readable();
    readable.push(file.buffer);
    readable.push(null);

    readable.pipe(uploadStream)
      .on("error", (err) => res.status(500).json({ error: err.message }))
      .on("finish", () => {
        res.status(200).json({
          file: {
            id: uploadStream.id,
            filename: uploadStream.filename,
          },
        });
      });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}