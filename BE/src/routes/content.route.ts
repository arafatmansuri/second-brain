import { Router } from "express";
import {
  addContent,
  deleteContent,
  displayContent,
  displaySharedContent,
  shareContent,
  updateContent,
} from "../controllers/content.controller";
import { filterTags } from "../middlewares/filterTags.middleware";
import { verifyJWT } from "../middlewares/user.middleware";

const contentRouter: Router = Router();

contentRouter.route("/display").get(displaySharedContent);
//Secured Routes:
contentRouter.use(verifyJWT);
contentRouter.route("/add").post(filterTags, addContent);
contentRouter.route("/update/:id").put(filterTags, updateContent);
contentRouter.route("/delete/:id").delete(deleteContent);
contentRouter.route("/display").get(displayContent);
contentRouter.route("/share/:id").put(shareContent);

export default contentRouter;
