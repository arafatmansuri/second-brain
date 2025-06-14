import multer from "multer";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(
      null,
      "C:/Users/dell/Desktop/learnings/Cohort-3/second-brain-app/BE/public/temp/"
    );
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
});
