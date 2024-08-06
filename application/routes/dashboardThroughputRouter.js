const express = require("express");
const dashboardThroughputRouter = express.Router();
const { throughput } = require("./../controllers/robotController");

dashboardThroughputRouter.get("/:mapId", throughput);

module.exports = dashboardThroughputRouter;
