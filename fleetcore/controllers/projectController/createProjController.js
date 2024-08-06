const { projectModel, siteModel } = require("../../models/projectSchema");
const {
  authRegisterModel,
  userProjListschema,
} = require("../../../common/models/authRegisterSchema");

const createProject = async (req, res, next) => {
  const { projectName, siteName } = req.body.project;
  if (req.role === "User")
    return res.status(403).json({
      status: false,
      msg: "User not permitted to access project creation",
    });
  try {
    const doc = await projectModel.exists({ projectName: projectName });
    if (doc) {
      return res.status(400).json({ exists: true, msg: "Name already exists" });
    }

    const project = await new projectModel({
      projectName,
      sites: [{ siteName }],
    }).save();
    const user = await authRegisterModel.findOne({
      name: req.user,
      role: req.role,
    });
    user.projects.push({
      projectId: project._id,
      projectName: project.projectName,
    });
    const userdet = await user.save();

    return res.status(201).json({
      project: project,
      exists: false,
      userdet: userdet.projects,
      msg: "project created!",
    });
  } catch (err) {
    console.log("err occ : ", err);
    return res.status(500).json({ error: err, msg: "request not attained!" });
  }
};
module.exports = { createProject };

/* 
  const proj = await projectModel
  .findOne({ projectName: "project_21" })
  .populate({
    path: "sites.maps.mapId",
    model: "map",
  });
  const site = proj.sites.id("66962f64e1738e1f002d3122");
  const doc = new dumMapModel({ mapName: mapName });
  doc.save();
  site.maps.push({ mapId: doc._id, mapName: "mape2" });
  proj.save();
 */
