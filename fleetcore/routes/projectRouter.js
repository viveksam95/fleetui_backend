const express = require("express");
const {
  createProject,
} = require("../controllers/projectController/createProjController");
const {
  getProject,
  getProjectList,
} = require("../controllers/projectController/getProjectController");
const {
  validateToken,
} = require("../../common/controllers/auth/authController");

const projectRouter = express.Router();
projectRouter.post("/project", validateToken, createProject);
projectRouter.get("/projects/project-list", validateToken, getProjectList);
projectRouter.get("/:projectId", validateToken, getProject);

module.exports = projectRouter;
