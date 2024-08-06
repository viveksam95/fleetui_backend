const { Schema, model, mongoose } = require("mongoose");
const { roboSchema, zoneSchema } = require("./roboSchema");
const { dashboardConnection } = require("../../common/db_config");

const roboProjSchema = new Schema(
  {
    roboId: {
      type: Schema.Types.ObjectId,
      ref: "Robo",
      required: true,
    },
    name: {
      type: String,
      required: [true, "name of the robo required!"],
      trim: true,
    },
  },
  { timestamps: true, versionKey: false, _id: false }
);

const mapSchema = new Schema(
  {
    mapName: {
      type: String,
      required: [true, "map_Name is required!"],
      trim: true,
      unique: true,
    },
    imgUrl: { type: String, default: "" },
    zones: {
      type: [zoneSchema],
      default: [],
    },
    robots: {
      type: [roboProjSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const Map = dashboardConnection.model("mapData", mapSchema, "mapData");
const Robo = dashboardConnection.model(
  "roboSpecifications",
  roboSchema,
  "roboSpecifications"
);

module.exports = { Map, Robo };
