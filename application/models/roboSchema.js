const { Schema, model, mongoose } = require("mongoose");

const zoneSchema = new Schema(
  {
    zoneName: { type: String, required: true, trim: true },
    zoneCoordinates: [{ x: Number, y: Number, _id: false }],
  },
  { versionKey: false }
);

const roboSchema = new Schema(
  {
    roboName: { type: String, required: true, unique: true },
    type: { type: String, default: "AGV" },
    ipAdd: { type: String, default: "" },
    macAdd: { type: String, default: "" },
    status: { type: String, required: true, default: "idle" },
    location: {
      type: [{ x: Number, y: Number, _id: false }],
      _id: false,
      default: [{ x: 0, y: 0 }],
    },
    batteryStatus: { type: Number, required: true, min: 0, max: 100 },
    roboTask: [{ type: String, _id: false }],
    error: {
      type: [{ type: String }],
      default: [],
    },
  },
  { timestamps: true, strict: false, versionKey: false }
);

module.exports = { roboSchema, zoneSchema };
