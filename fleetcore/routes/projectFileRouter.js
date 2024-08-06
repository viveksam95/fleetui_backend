const express = require("express");
const multer = require("multer");
const {
  createProjFiles,
  compressProjectFile,
} = require("../controllers/fileController/fileExportController");
const {
  extractProjFile,
  parseProjectFile,
} = require("../controllers/fileController/fileImportController");
const projectFileRouter = express.Router();
const {
  validateToken,
} = require("../../common/controllers/auth/authController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "proj_assets/projectFile");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

projectFileRouter.post(
  "/upload-project",
  validateToken,
  upload.single("projFile"),
  extractProjFile,
  parseProjectFile
);

projectFileRouter.get(
  "/download-project/:project_name",
  validateToken,
  createProjFiles,
  compressProjectFile
);

module.exports = projectFileRouter;
