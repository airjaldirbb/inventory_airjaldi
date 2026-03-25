import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket;

export const initGridFS = (conn) => {
  if (!conn) return;

  bucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
};

export const getBucket = () => bucket;