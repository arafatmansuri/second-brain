import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadOnCloudinary = async ({
  localFilePath,
  type,
}: {
  localFilePath: string;
  type: "video" | "image" | "raw" | "auto";
}) => {
  try {
    if (!localFilePath || !type) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: type,
      folder: `Brainly/${type}`,
    });
    console.log("File Uploaded on Cloudinary", response.secure_url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Cloudinary upload error", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log("File Deletion success",publicId);
    } catch (error) {
        console.log("File Deletion failed");
        return null;
    }
}