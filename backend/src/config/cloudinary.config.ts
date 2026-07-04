import { v2 as cloudinary } from "cloudinary";
import https from "https";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "coldmate",
  resourceType: "image" | "raw" | "auto" | "video" = "image",
  filename?: string
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(filename && {
          public_id: resourceType === "raw" ? filename : filename.split(".")[0],
        }),
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed: empty result"));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Write buffer directly to the WritableStream returned by upload_stream
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = (
  publicId: string,
  resourceType: "image" | "raw" | "auto" | "video" = "image"
): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

export const getPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  const isRaw = url.includes("/raw/upload/");
  if (isRaw) {
    const matches = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
  } else {
    const matches = url.match(/\/image\/upload\/(?:v\d+\/)?([^\.]+)/) || url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
  }
  return null;
};

/**
 * Perform a GET request to verify that the uploaded asset is publicly accessible on the CDN.
 * Aborts connection after receiving headers to optimize bandwidth and time.
 */
export const verifyUrlAccessible = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      req.destroy(); // Stop receiving the file body
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
  });
};
