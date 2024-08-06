const { Schema, model, mongoose } = require("mongoose");
const { userManagementConnection } = require("../db_config");
const { projectModel } = require("../../fleetcore/models/projectSchema");

const userProjListschema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "projectModel" },
    projectName: {
      type: String,
      required: [true, "Project_name is required!"],
      trim: true,
    },
  },
  { _id: false, versionKey: false }
);

const authRegisterSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "user name is required!"],
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: [true, "user role is required!"],
      enum: ["User", "Maintainer", "Administrator"],
      trim: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    projects: {
      type: [userProjListschema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const authRegisterModel = userManagementConnection.model(
  "User",
  authRegisterSchema,
  "User"
);

module.exports = { authRegisterModel, userProjListschema };
