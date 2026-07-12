import { ApiResponse } from "../../lib/ApiResponse";
import { AppError } from "../../lib/AppError";
import { asyncHandler } from "../../lib/asyncHandler";
import Project from "../../models/project.model";
import { createProjectValidation } from "../../validations/project.validation";

export const createProject = asyncHandler(async (req, res) => {
  const parsedData = createProjectValidation.safeParse(req.body);

  if (!parsedData.success) {
    throw AppError.badRequest(parsedData.error.issues[0].message);
  }

  const findProject = await Project.findOne({
    name: parsedData.data.name,
    userId: req.userId,
  });

  if (findProject) {
    throw AppError.badRequest("Project with the same name already exists");
  }

  const newProject = await Project.create({
    ...parsedData.data,
    userId: req.userId,
  });

  ApiResponse.success(res, newProject, "Project created successfully");
});
export const deleteProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  if (!projectId) {
    throw AppError.badRequest("Project ID is required");
  }
  const project = await Project.findOne({ _id: projectId, userId: req.userId });

  if (!project) {
    throw AppError.notFound("Project not found");
  }

  project.isDeleted = true;
  project.deletedAt = new Date();
  await project.save();

  ApiResponse.success(res, null, "Project deleted successfully");
});
