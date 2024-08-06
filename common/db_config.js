const mongoose = require("mongoose");
require("dotenv").config();

const dashboardConnection = mongoose.createConnection(
  process.env.MONGO_DASHBOARD_URI
);
const userManagementConnection = mongoose.createConnection(
  process.env.MONGO_USERMANAGEMENT_URI
);
const projectConnection = mongoose.createConnection(
  process.env.MONGO_PROJECT_URI
);

const isConnect = (dbConnection) => {
  dbConnection.on("connected", () => {
    console.log(`${dbConnection.name} connected bro..`);
  });

  dbConnection.on("error", (err) => {
    console.log(`${dbConnection.name} connection err : `, err);
  });

  dbConnection.on("disconnected", () => {
    console.log(`${dbConnection.name} disconnected bro..`);
  });
};

isConnect(dashboardConnection);
isConnect(userManagementConnection);
isConnect(projectConnection);

module.exports = {
  dashboardConnection,
  userManagementConnection,
  projectConnection,
};
