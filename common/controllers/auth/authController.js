const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authRegisterModel } = require("../../models/authRegisterSchema");

const validateToken = async (req, res, next) => {
  const token = req.cookies._token;
  if (!token)
    return res.status(401).json({ tokenValid: null, msg: "Access denied" });
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    // console.log(err, decoded)
    if (!err) {
      req.user = decoded.user;
      req.role = decoded.role;
      return next();
    }
    return res
      .status(403)
      .json({ tokenValid: false, msg: "Invalid token", error: err });
  });
};

const login = async (req, res) => {
  const { name, role, password } = req.body.user;
  try {
    const user = await authRegisterModel.find({ name: name, role: role });
    if (!user.length)
      return res.status(404).json({
        isUserExist: false,
        msg: "user (or) role not found",
        user: null,
      });
    const isMatch = await bcrypt.compare(name + password, user[0].password);
    if (isMatch) {
      const token = jwt.sign(
        { user: name, role: role },
        process.env.JWT_SECRET_KEY
      );
      return res
        .cookie("_token", token, { httpOnly: true }) //sameSite: "Strict" only from the originated site..
        .status(200)
        .json({
          isUserExist: true,
          msg: "User found",
          user: {
            id: user[0]._id,
            name: user[0].name,
            role: user[0].role,
            priority: user[0].priority,
            projects: user[0].projects,
          },
        });
    }

    return res
      .status(401) // Unauthorized
      .json({ isUserExist: true, msg: "wrong password!", user: null });
  } catch (err) {
    console.log("err occ : ", err);
    return res.status(500).json({ operation: "login failed!", error: err });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("_token");
    res.clearCookie("_user");
    return res
      .status(200)
      .json({ msg: "cookies deleted!", isCookieDeleted: true });
  } catch (error) {
    console.log("error in logout : ", error);
    return res.status(500).json({ operation: "logout failed!", error: err });
  }
};

const register = async (req, res) => {
  const { name, role, password } = req.body.user;
  try {
    const alterPass = name + password;
    const hashhedPassword = await bcrypt.hash(alterPass, 2);
    const doc = await authRegisterModel.findOne({ name: name, role: role });
    if (!doc) {
      const newData = new authRegisterModel({
        name: name,
        password: hashhedPassword,
        role: role,
        priority: role === "Administrator" ? 1 : role === "Maintainer" ? 2 : 3,
      });

      const updatedDoc = await newData.save();
      return res.status(200).json({
        operation: "succeed",
        updatedDoc: {
          name: updatedDoc.name,
          role: updatedDoc.role,
          id: updatedDoc._id,
          password: password,
          projects: updatedDoc.projects,
        },
      });
    }
    return res
      .status(409) // 409 - already exists!
      .json({ isExist: true, msg: "person already exists" });
  } catch (err) {
    console.log("err occ : ", err);
    return res
      .status(500)
      .json({ operation: "registration failed!", error: err });
  }
};

module.exports = { login, logout, register, validateToken };
