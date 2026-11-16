const sequelize = require("../config/db");
const Found = require("./Found");
const Admin = require("./Admin");

// Objek db yang membungkus semua model dan instance Sequelize
const db = {
  sequelize,
  Found,
  Admin,
};

module.exports = db;
