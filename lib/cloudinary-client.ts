export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
};

type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
};

export async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary upload is not configured. Set the public cloud name and upload preset.",
    );
  }

  const formData = new FormData();
  formData.set("file", file);
  formData.set("upload_preset", uploadPreset);
  formData.set("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  const json = (await response.json()) as CloudinaryResponse;

  if (!response.ok || !json.secure_url || !json.public_id) {
    const message = json.error?.message ?? "Cloudinary upload failed.";

    if (message.toLowerCase().includes("upload preset")) {
      throw new Error(
        `Cloudinary preset "${uploadPreset}" must exist and be configured for unsigned uploads.`,
      );
    }

    throw new Error(message);
  }

  return {
    secureUrl: json.secure_url,
    publicId: json.public_id,
    bytes: json.bytes ?? 0,
    format: json.format ?? "",
    width: json.width ?? 0,
    height: json.height ?? 0,
  };
}
