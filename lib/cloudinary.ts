import { randomUUID } from "node:crypto";
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
  folder: string
): Promise<UploadResult> {
  const uploadPreset = env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    throw new Error(
      "Cloudinary PDF uploads require NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  return withTimeout(
    new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.unsigned_upload_stream(
        uploadPreset,
        {
          resource_type: "raw",
          folder,
          public_id: `answer-${randomUUID()}.pdf`,
        },
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
        }
      );

      stream.end(fileBuffer);
    }),
    TIMEOUTS.CLOUDINARY,
    "cloudinary upload"
  );
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  mimeType: string
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
        }
      );

      stream.end(fileBuffer);
    }),
    TIMEOUTS.CLOUDINARY,
    "cloudinary image upload"
  );
}

export function getAuthenticatedRawUrl(publicId: string): string {
  if (!env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Authenticated Cloudinary downloads require CLOUDINARY_API_SECRET."
    );
  }

  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "authenticated",
    sign_url: true,
    secure: true,
  });
}

export function getPrivateRawDownloadUrl(
  publicId: string,
  format: string,
  deliveryType: "upload" | "private" | "authenticated"
): string {
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Private Cloudinary downloads require CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }

  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "raw",
    type: deliveryType,
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
  });
}

export async function deleteFile(
  publicId: string,
  resourceType: "image" | "raw" = "raw"
): Promise<void> {
  await withTimeout(
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }),
    TIMEOUTS.CLOUDINARY,
    "cloudinary destroy"
  );
}
