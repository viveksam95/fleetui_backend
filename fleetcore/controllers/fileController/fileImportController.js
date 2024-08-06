const decompress = require("decompress");
const fs = require("fs");
const path = require("path");
const { copyImages } = require("./fileExportController");
const { projectModel } = require("../../models/projectSchema");
const { Map, Robo } = require("../../../application/models/mapSchema");
const {
  authRegisterModel,
} = require("../../../common/models/authRegisterSchema");

const validateExtractedFile = async ({ target }) => {
  let fileArr = ["/mapInfo.json", "/projInfo.json", "/roboInfo.json"];
  const files = fs.readdirSync(target);
  if (files.length < 3) return false;
  for (const file of fileArr) {
    if (!fs.existsSync(target + file)) return false;
  }
  return true;
};

const renameProjFile = async ({ res, target, alterName }) => {
  let doc = await projectModel.exists({ projectName: alterName });
  if (doc)
    return res.status(409).json({
      idExist: false,
      nameExist: true,
      msg: "project with this name already exists, you can't insert into database",
    });
  const data = JSON.parse(fs.readFileSync(target + "/projInfo.json"));
  data.project.projectName = alterName;
  fs.writeFileSync(target + "/projInfo.json", JSON.stringify(data, null, 2));
};

const clearFiles = ({ target }) => {
  const files = fs.readdirSync(target);
  for (const file of files) {
    if (fs.existsSync(`${target}/${file}`)) fs.unlinkSync(`${target}/${file}`);
  }
};

const clearCopiedImg = ({ target, img }) => {
  const dest = path.resolve("./proj_assets/dashboardMap");
  for (let image of img) {
    if (fs.existsSync(dest + `/${image}`)) fs.unlinkSync(dest + `/${image}`);
  }
};

const isRoboConflict = async ({ target }) => {
  let { robos } = JSON.parse(fs.readFileSync(target + "/roboInfo.json"));

  for (const robo of robos) {
    const doc = await Robo.exists({ roboName: robo.roboName });
    if (doc)
      return [
        true,
        "robo with this name already exist in your DB,try modifying at concerned project",
      ];
  }

  return [false, ""];
};

const isMapConflict = async ({ target }) => {
  let { maps } = JSON.parse(fs.readFileSync(target + "/mapInfo.json"));

  for (const map of maps) {
    const doc = await Map.exists({ mapName: map.mapName });
    if (doc)
      return [
        true,
        "Map with this name already exist in your DB, try modifying at concerned project",
      ];
  }

  return [false, ""];
};

const restoreRobots = async ({ target }) => {
  const { robos } = JSON.parse(
    fs.readFileSync(target + "/roboInfo.json", "utf-8")
  );
  for (const robo of robos) {
    await new Robo(robo).save();
  }
};

const restoreMaps = async ({ target }) => {
  const { maps } = JSON.parse(
    fs.readFileSync(target + "/mapInfo.json", "utf-8")
  );
  // const doc = await Robo.insertMany(maps);
  for (const map of maps) {
    await new Map(map).save();
  }
};

const restoreProject = async ({ target }) => {
  const { project } = JSON.parse(
    fs.readFileSync(target + "/projInfo.json", "utf-8")
  );
  const doc = await new projectModel(project).save();
  return doc;
};

const clearInsertedData = async ({ target }) => {
  const { robos } = JSON.parse(fs.readFileSync(target + "/roboInfo.json"));
  const { maps } = JSON.parse(fs.readFileSync(target + "/mapInfo.json"));
  const { project } = JSON.parse(fs.readFileSync(target + "/projInfo.json"));
  for (const robo of robos) {
    let doc = await Robo.exists({ _id: robo._id });
    if (doc) await Robo.deleteOne({ _id: robo._id });
  }
  for (const map of maps) {
    let doc = await Map.exists({ _id: map._id });
    if (doc) await Map.deleteOne({ _id: map._id });
  }
  let doc = await projectModel.exists({ _id: project._id });
  if (doc) await projectModel.deleteOne({ _id: project._id });
};

const saveToUser = async ({ req, project }) => {
  let user = await authRegisterModel.exists({
    name: req.user,
    role: req.role,
  });
  if (!user) return null;
  user = await authRegisterModel.findOne({
    name: req.user,
    role: req.role,
  });
  user.projects.push({
    projectId: project._id,
    projectName: project.projectName,
  });
  const userdet = await user.save();
  let updtUser = await authRegisterModel
    .findOne({
      name: req.user,
      role: req.role,
    })
    .select("-password");
  return updtUser;
};

const handleError = async (res, target, img, err, msg) => {
  if (img.length) clearCopiedImg({ target, img });
  await clearInsertedData({ target });
  clearFiles({ target });
  res.status(500).json({ error: err, msg: msg, errMsg: err.message });
};

const handleConflict = (res, target, img, msg) => {
  clearCopiedImg({ target, img });
  clearFiles({ target });
  res.status(409).json({ conflicts: true, msg: msg });
};
//..

const extractProjFile = async (req, res, next) => {
  if (req.role === "User")
    return res.status(403).json({
      status: false,
      msg: "User not permitted to access project creation",
    });
  try {
    const absPath = path.resolve("./proj_assets/projectFile"); // returns absolute path of the given file or folder! (helps to find a file)
    const destDirName = path.basename(
      // ( dist.txt - .txt ) => dist
      req.file.originalname,
      path.extname(req.file.originalname) // returns extension type
    );
    // respond has been sent.. background process (incase of emergency use timeOut)
    await decompress(absPath + `/${req.file.originalname}`, absPath); // absPath + `/${destDirName}` [ alter ]
    if (fs.existsSync(absPath + `/${req.file.originalname}`))
      fs.unlinkSync(absPath + `/${req.file.originalname}`);
    next();
  } catch (err) {
    console.log("error occ : ", err);
    res
      .status(500)
      .json({ error: err, msg: "Internal server Error, operation failed" });
  }
};

const parseProjectFile = async (req, res, next) => {
  const { isRenamed, alterName } = JSON.parse(req.body.projRename);
  // let isRenamed = false;
  // let alterName = "altered_name";
  const target = path.resolve("./proj_assets/projectFile/");

  const isDirValidate = await validateExtractedFile({ target });
  if (!isDirValidate)
    return res.status(400).json({ isZipValidate: false, msg: "Files missing" });

  try {
    if (isRenamed) await renameProjFile({ res, target, alterName });

    const { project, img } = JSON.parse(
      fs.readFileSync(target + "/projInfo.json")
    );
    const { _id, projectName } = project;
    const doc = await projectModel.findById(_id);
    if (doc) {
      clearFiles({ target });
      return res.status(409).json({
        idExist: true,
        msg: "Seems project already exists!(project with this Id already exist)",
      });
    }
    const data = await projectModel.exists({ projectName: projectName });
    if (data) {
      clearFiles({ target });
      return res.status(409).json({
        idExist: false,
        nameExist: true,
        msg: "project with this name already exists, you can't insert into database",
      });
    }

    let res1 = await isRoboConflict({ target });
    let res2 = await isMapConflict({ target });
    if (res1[0]) return handleConflict(res, target, img, res1[1]);
    if (res2[0]) return handleConflict(res, target, img, res2[1]);

    if (img.length)
      copyImages({
        imgUrlArr: img,
        src: "projectFile",
        dest: "dashboardMap",
      });

    await restoreRobots({ target });
    await restoreMaps({ target });
    await restoreProject({ target });
    let userDet = await saveToUser({ req, project });
    if (!userDet)
      return handleError(
        res,
        target,
        img,
        new Error("User not found"),
        "User not found!"
      );

    const projDoc = await projectModel.find({ projectName: projectName });
    clearFiles({ target });
    return res.status(200).json({
      err: null,
      conflicts: null,
      user: userDet,
      project: projDoc,
      msg: "project Inserted!",
    });
  } catch (err) {
    if (fs.existsSync(target + "/projInfo.json")) {
      const { project, img } = JSON.parse(
        fs.readFileSync(target + "/projInfo.json")
      );
      clearCopiedImg({ target, img });
    }
    console.log("error occ : ", err);
    const isDirValidate = await validateExtractedFile({ target });
    if (isDirValidate) await clearInsertedData({ target });
    clearFiles({ target });
    if (err.code === 11000) {
      return res.status(500).json({
        error: err.message,
        msg: "Trying to insert duplicate data to DB",
      });
    }
    res.status(500).json({
      error: err,
      msg: "Internal server Error ( operation failed )",
      errMsg: err.message,
    });
  }
};

module.exports = { extractProjFile, parseProjectFile };
