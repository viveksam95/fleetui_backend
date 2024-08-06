const express = require("express");
const dashbdGrossCountRouter = express.Router();
const { getGrossCount } = require("./../controllers/robotController");
dashbdGrossCountRouter.get("/gross_count", getGrossCount);

module.exports = dashbdGrossCountRouter;
