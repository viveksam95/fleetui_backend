const { Schema, model } = require("mongoose");
const { siteSchema, roboProjSchema } = require("./sitesSchema");
const { projectConnection } = require("../../common/db_config");

const projectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: [true, "project name is required!"],
      trim: true,
      unique: true,
    },
    sites: {
      type: [siteSchema],
      default: [],
    },
    robots: {
      type: [roboProjSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const projectModel = projectConnection.model(
  "projectDets",
  projectSchema,
  "projectDets"
);

const siteModel = projectConnection.model("site", siteSchema, "site");

module.exports = { projectModel, siteModel };
