const express = require("express");
const multer = require("multer");
const dashboardMapRouter = express.Router();
const {
  mapInsert,
  mapGet,
  newRoboInMap,
  deleteRoboInMap,
  deleteMap,
  delMapImg,
  newMapImg,
} = require("./../controllers/mapController");
const Map = require("./../models/mapSchema");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "proj_assets/dashboardMap"); // cb(err, value);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

dashboardMapRouter.post("/", upload.single("mapImg"), mapInsert);
dashboardMapRouter.get("/:mapId", mapGet);
dashboardMapRouter.put("/:mapName/robots", newRoboInMap);
dashboardMapRouter.delete("/:mapId/robots/:roboId", deleteRoboInMap);
dashboardMapRouter.delete("/:mapId", deleteMap);
dashboardMapRouter.delete("/:mapId/delete_img", delMapImg);
dashboardMapRouter.post(
  "/:mapId/replace_img",
  upload.single("mapImg"),
  delMapImg,
  newMapImg
);

module.exports = dashboardMapRouter;
