const fs = require("fs");
const path = require("path");
const { Map, Robo } = require("../../../application/models/roboSchema");
const { projectModel, siteModel } = require("../../models/projectSchema");
const {
  authRegisterModel,
} = require("../../../common/models/authRegisterSchema");
const archiver = require("archiver");

const populateField = async ({ projectName, path, model, selectedField }) => {
  const doc = await projectModel
    .findOne({ projectName: projectName })
    .populate({
      path: path,
      model: model,
    })
    .select({ selectedField: 1, _id: 0 });

  return doc;
};

const initiateProjFile = async ({ projDoc, imgUrlArr }) => {
  let data = {};
  const filePath = path.resolve(
    __dirname,
    "../../../proj_assets/tempDist/projInfo.json"
  );
  // const data = JSON.parse(fs.readFileSync(filePath));
  data.project = projDoc;
  data.img = imgUrlArr;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {});
  // fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
};

const initiateMapFile = async ({ maps }) => {
  let arr = [];
  let data = {};
  const filePath = path.resolve(
    __dirname,
    "../../../proj_assets/tempDist/mapInfo.json"
  );
  maps.forEach((mapArr) => {
    mapArr.forEach((map) => {
      arr.push(map.mapId);
    });
  });
  data.maps = arr;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {});
  // fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
};

const initiateRoboFile = async ({ robos }) => {
  // let data = {};
  const data = { robos };
  const filePath = path.resolve(
    __dirname,
    "../../../proj_assets/tempDist/roboInfo.json"
  );
  // data.robos = robos;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {});
  // fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
};

const parseImgUrl = ({ maps }) => {
  // let arr = [];
  // maps.forEach((map) => {
  //   map.forEach((element) => {
  //     arr.push(element.mapId.imgUrl.split("/")[2]);
  //   });
  // });
  // return arr;
  return maps.flatMap((map) =>
    map.map((element) => element.mapId.imgUrl.split("/")[2])
  );
};

const copyImages = async ({ imgUrlArr, src, dest }) => {
  const sourcePath = path.resolve(__dirname, `../../../proj_assets/${src}`);
  const destPath = path.resolve(__dirname, `../../../proj_assets/${dest}`);
  imgUrlArr?.forEach((img) => {
    fs.copyFileSync(`${sourcePath}/${img}`, `${destPath}/${img}`);
  });
};

const createProjFiles = async (req, res, next) => {
  const projectName = req.params.project_name;
  try {
    const doc = await projectModel.exists({ projectName });
    if (!doc)
      return res
        .status(400)
        .json({ exist: false, msg: "project (project name) not found!" });
    const roboDoc = await populateField({
      projectName: projectName,
      path: "robots.roboId",
      model: Robo,
      selectedField: "roboId",
    });
    const mapDoc = await populateField({
      projectName: projectName,
      path: "sites.maps.mapId",
      model: Map,
      selectedField: "maps.mapId",
    });
    const projDoc = await projectModel.findOne({ projectName });
    const robos = roboDoc.robots.map((robo) => robo.roboId);
    const maps = mapDoc.sites.map((map) => map.maps);
    let imgUrlArr = parseImgUrl({ maps });
    await copyImages({ imgUrlArr, src: "dashboardMap", dest: "tempDist" });
    await initiateProjFile({ projDoc, imgUrlArr });
    await initiateRoboFile({ robos });
    await initiateMapFile({ maps });
    next();
  } catch (err) {
    console.log("error occ : ", err);
    res.status(500).json({ error: err, msg: "operation failed" });
  }
};

const compressProjectFile = async (req, res, next) => {
  let target = path.resolve("proj_assets/tempDist/");
  let toZip = path.resolve(
    `proj_assets/projectFile/${req.params.project_name}.zip`
  );
  try {
    const output = fs.createWriteStream(toZip);
    const archive = archiver("zip", { zlib: { level: 9 } });
    const files = fs.readdirSync(target);

    output.on("close", () => {
      console.log("zip gonna sent");
      res.download(toZip, `/${req.params.project_name}.zip`, (err) => {
        if (err) {
          console.log("Error while downloading : ", err);
          res.status(500).json({
            downloaded: false,
            msg: "Error downloading file, try again",
          });
        } else {
          console.log("zip has been sent");
          files.forEach((file) => {
            if (fs.existsSync(`${target}/${file}`))
              fs.unlinkSync(`${target}/${file}`);
          });
          fs.unlinkSync(toZip);
        }
      });
    });
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      return res.status(500).json({
        archived: false,
        msg: "Error creating zip archive, try again",
      });
    });
    archive.pipe(output);

    files.forEach((file) => {
      const filePath = path.join(target, file);
      archive.append(fs.createReadStream(filePath), {
        name: path.basename(file),
      });
    });
    archive.finalize();

    /* res.on("finish", () => {
      files.forEach((file) => {
        if (fs.existsSync(`${target}/${file}`))
          fs.unlinkSync(`${target}/${file}`);
      });
      fs.unlinkSync(toZip);
    }); // triggers the event, where the response completely sent to the client.. */
  } catch (error) {
    console.log("error occ : ", error);
    res.status(500).json({ error: error, msg: "operation failed" });
  }
};

module.exports = {
  createProjFiles,
  compressProjectFile,
  copyImages,
};
