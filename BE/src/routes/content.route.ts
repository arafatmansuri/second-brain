import { Router } from "express";
import {
  addContent,
  deleteContent,
  displayContent,
  displaySharedContent,
  generateUploadUrl,
  queryFromContent,
  shareContent,
  updateContent,
} from "../controllers/content.controller";
import { filterTags } from "../middlewares/filterTags.middleware";
import { contentData } from "../middlewares/contentData.middleware";
import { upload } from "../middlewares/multer.middlewear";
import { verifyJWT } from "../middlewares/user.middleware";

const contentRouter: Router = Router();

contentRouter.route("/display").get(displaySharedContent);
//Secured Routes:
contentRouter.use(verifyJWT);
// contentRouter.route("/add").post(upload.single("file"), filterTags, addContent);
contentRouter.route("/add").post(upload.single("file"), contentData, addContent);
contentRouter.route("/update/:id").put(filterTags, updateContent);
contentRouter.route("/delete/:id").delete(deleteContent);
contentRouter.route("/displayall").get(displayContent);
contentRouter.route("/share").put(shareContent);
contentRouter.route("/askai").post(queryFromContent);
contentRouter.route("/uploadUrl").post(generateUploadUrl);

export default contentRouter;
