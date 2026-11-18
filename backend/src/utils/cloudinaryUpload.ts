import cloudinary, { CloudinaryUploadResult, CloudinaryDeleteResult } from "./cloudinary.js";

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "myportfolio",
  options?: {
    resourceType?: "image" | "video" | "raw" | "auto";
    publicId?: string;
    transformation?: any;
    quality?: number;
    width?: number;
    height?: number;
    crop?: string;
  }
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: options?.resourceType || "auto",
    };

    if (options?.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options?.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    if (options?.quality) {
      uploadOptions.quality = options.quality;
    }

    if (options?.width && options?.height) {
      uploadOptions.width = options.width;
      uploadOptions.height = options.height;
    }

    if (options?.crop) {
      uploadOptions.crop = options.crop;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result!.url,
            secureUrl: result!.secure_url,
            publicId: result!.public_id,
            format: result!.format,
            width: result!.width,
            height: result!.height,
            bytes: result!.bytes,
            duration: result!.duration,
          });
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const uploadFile = async (
  fileBuffer: Buffer,
  folder: string = "myportfolio",
  options?: {
    resourceType?: "image" | "video" | "raw" | "auto";
    quality?: number;
    width?: number;
    height?: number;
    crop?: string;
  }
): Promise<CloudinaryUploadResult> => {
  return uploadToCloudinary(fileBuffer, folder, options);
};

export const deleteFromCloudinary = (publicId: string): Promise<CloudinaryDeleteResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          result: result.result,
          publicId,
        });
      }
    });
  });
};

export const deleteMultipleFromCloudinary = async (publicIds: string[]): Promise<CloudinaryDeleteResult[]> => {
  const results: CloudinaryDeleteResult[] = [];
  for (const publicId of publicIds) {
    if (publicId) {
      try {
        const result = await deleteFromCloudinary(publicId);
        results.push(result);
      } catch (error) {
        console.error(`Failed to delete ${publicId}:`, error);
        results.push({
          result: "error",
          publicId,
        });
      }
    }
  }
  return results;
};

export const extractPublicId = (url: string): string => {
  try {
    const urlParts = url.split("/");
    const folderIndex = urlParts.findIndex(part => part === "myportfolio");
    if (folderIndex === -1) return "";
    const publicIdWithExt = urlParts.slice(folderIndex).join("/");
    return publicIdWithExt.split(".")[0];
  } catch {
    return "";
  }
};

export type { CloudinaryUploadResult, CloudinaryDeleteResult };