const express = require("express");
const dashboardUptimeRouter = express.Router();
const { uptime } = require("../controllers/robotController");
dashboardUptimeRouter.get("/:mapId", uptime);

module.exports = dashboardUptimeRouter;
