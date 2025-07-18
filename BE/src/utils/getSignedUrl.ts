import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Config";

export const generateSignedUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 60 });
  return signedUrl;
};
