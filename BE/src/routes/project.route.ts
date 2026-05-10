import { Router } from "express";
import { createProject } from "../controllers/project.controller";

const projectRouter: Router = Router();

projectRouter.route("/").post(createProject);

export default projectRouter;
