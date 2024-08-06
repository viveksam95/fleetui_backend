const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:4200",
      // "http://192.168.11.183:3000",
      // "http://localhost:57065",
    ], // WIP...
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(
  "/dashboard",
  express.static(path.join("proj_assets", "dashboardMap")) // "/dashboard/map_1.jpg"
);

module.exports = app;
