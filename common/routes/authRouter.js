const express = require("express");
const authRouter = express.Router();
const {
  login,
  logout,
  register,
} = require("../controllers/auth/authController");

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/logout", logout);
module.exports = authRouter;
