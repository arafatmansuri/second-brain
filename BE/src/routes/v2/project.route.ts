import { Router } from "express";
import {
  createProject,
  deleteProject,
} from "../../controllers/v2/project.controller";

const projectRouter: Router = Router();

projectRouter.route("/").post(createProject);
projectRouter.route("/:id").delete(deleteProject);

export default projectRouter;
