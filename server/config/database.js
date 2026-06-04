const { Sequelize } = require("sequelize");
require("dotenv").config();

const dbName   = process.env.DB_NAME     || "careerhub";
const host     = process.env.DB_HOST     || "localhost";
const instance = process.env.DB_INSTANCE || "SQLEXPRESS";

const sequelize = new Sequelize(dbName, null, null, {
  dialect: "mssql",
  dialectOptions: {
    server: host,
    options: {
      instanceName:           instance,
      database:               dbName,
      trustServerCertificate: true,
      encrypt:                false,
      connectTimeout:         30000,
    },
    // Windows Authentication — uses your current Windows login, no password
    authentication: {
      type: "ntlm",
      options: { domain: "", userName: "", password: "" },
    },
  },
  logging: process.env.NODE_ENV === "development"
    ? (msg) => console.log("  [SQL]", msg.substring(0, 150))
    : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

module.exports = sequelize;
