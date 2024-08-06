const express = require("express");
const roboSpecificationRouter = express.Router();
const { createRobo } = require("../controllers/robotController");

roboSpecificationRouter.post("/", createRobo);

module.exports = roboSpecificationRouter;
