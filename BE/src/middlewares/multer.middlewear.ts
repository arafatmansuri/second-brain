import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3Config";
import path from "path";

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|pdf|mp4/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("Invalid file type"));
};

export const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || "",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "private",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    },
  }),
});
