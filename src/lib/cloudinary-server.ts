import "server-only";
import { v2 as cloudinary } from "cloudinary";

// Server-only: reads CLOUDINARY_API_SECRET and pulls in the Node SDK (which
// needs `fs`). Importing this from a client component breaks the build — the
// "server-only" import above turns that into a clear error rather than a
// confusing webpack failure. Client-safe helpers are in cloudinary-url.ts.
export function serverCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}
