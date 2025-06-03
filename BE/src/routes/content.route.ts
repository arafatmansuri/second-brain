import { Router } from "express";
import {
  addContent,
  deleteContent,
  displayContent,
  displaySharedContent,
  shareContent,
  updateContent,
} from "../controllers/content.controller";
import { verifyJWT } from "../middlewares/user.middleware";

const contentRouter: Router = Router();

contentRouter.route("/display").get(displaySharedContent);
//Secured Routes:
contentRouter.use(verifyJWT);
contentRouter.route("/add").post(addContent);
contentRouter.route("/update").put(updateContent);
contentRouter.route("/delete").delete(deleteContent);
contentRouter.route("/display").get(displayContent);
contentRouter.route("/share").put(shareContent);

export default contentRouter;
