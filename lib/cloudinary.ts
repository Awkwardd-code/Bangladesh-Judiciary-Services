import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";
import { TIMEOUTS, withTimeout } from "@/lib/with-timeout";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  secureUrl: string;
  publicId: string;
  bytes: number;
  format: string;
};

export async function uploadPdf(
  fileBuffer: Buffer,
  folder: string,
): Promise<UploadResult> {
  return withTimeout(
    new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", format: "pdf", folder },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
          });
        },
      );

      stream.end(fileBuffer);
    }),
    TIMEOUTS.CLOUDINARY,
    "cloudinary upload",
  );
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  mimeType: string,
): Promise<UploadResult> {
  const format = mimeType.split("/")[1] ?? "jpg";

  return withTimeout(
    new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", format, folder },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary image upload failed"));
            return;
          }

          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
          });
        },
      );

      stream.end(fileBuffer);
    }),
    TIMEOUTS.CLOUDINARY,
    "cloudinary image upload",
  );
}

export async function deleteFile(
  publicId: string,
  resourceType: "image" | "raw" = "raw",
): Promise<void> {
  await withTimeout(
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }),
    TIMEOUTS.CLOUDINARY,
    "cloudinary destroy",
  );
}

