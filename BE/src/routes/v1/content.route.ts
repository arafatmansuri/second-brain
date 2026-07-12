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
} from "../../controllers/v1/content.controller";
import { contentData } from "../../middlewares/v1/contentData.middleware";
import { filterTags } from "../../middlewares/v1/filterTags.middleware";
import { upload } from "../../middlewares/v1/multer.middlewear";
import {
  askAILimiter,
  rateLimiterMiddlewareAskAI,
} from "../../middlewares/v1/rateLimiter.middleware";
import { verifyJWT } from "../../middlewares/v1/user.middleware";

const contentRouter: Router = Router();

contentRouter.route("/display").get(displaySharedContent);
//Secured Routes:
contentRouter.use(verifyJWT);
// contentRouter.route("/add").post(upload.single("file"), filterTags, addContent);
contentRouter
  .route("/add")
  .post(upload.single("file"), contentData, addContent);
contentRouter.route("/update/:id").put(filterTags, updateContent);
contentRouter.route("/delete/:id").delete(deleteContent);
contentRouter.route("/displayall").get(displayContent);
contentRouter.route("/share").put(shareContent);
// contentRouter.route("/askai").post(queryFromContent);
contentRouter
  .route("/askai")
  .post(rateLimiterMiddlewareAskAI(askAILimiter), queryFromContent);
contentRouter.route("/uploadUrl").post(generateUploadUrl);

export default contentRouter;
