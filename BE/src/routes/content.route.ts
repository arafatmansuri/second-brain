import { Router } from "express";
import { verifyJWT } from "../middlewares/user.middleware";

const contentRouter: Router = Router();

contentRouter.route("/display").get();
//Secured Routes:
contentRouter.use(verifyJWT);
contentRouter.route("/add").post();
contentRouter.route("/update").put();
contentRouter.route("/delete").delete();
contentRouter.route("/display").get();
contentRouter.route("/share").put();

export default contentRouter;
