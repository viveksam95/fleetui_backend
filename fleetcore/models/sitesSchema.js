const { Schema, model, mongoose } = require("mongoose");
const { projectConnection } = require("../../common/db_config");
const { Map, Robo } = require("../../application/models/mapSchema");

const projMapSchema = new Schema(
  {
    mapId: {
      type: Schema.Types.ObjectId,
      ref: Map,
      required: true,
    },
    mapName: {
      type: String,
      required: [true, "Map name is required!"],
      trim: true,
    },
  },
  { timestamps: true, _id: false, versionKey: false }
);

const siteSchema = new Schema(
  {
    siteName: {
      type: String,
      required: [true, "site name reqiured"],
      trime: true,
    },
    maps: { type: [projMapSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

const roboProjSchema = new Schema(
  {
    roboId: {
      type: Schema.Types.ObjectId,
      ref: Robo,
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

module.exports = { siteSchema, roboProjSchema, projMapSchema };
