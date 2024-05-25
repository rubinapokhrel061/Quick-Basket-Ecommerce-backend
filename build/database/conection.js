"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_typescript_1.Sequelize({
    database: process.env.DB_NAME,
    dialect: "mysql",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    models: [__dirname + "/models"],
});
console.log(process.env.DB_NAME);
console.log(process.env.DB_HOST);
sequelize
    .authenticate()
    .then(() => {
    console.log("connected");
})
    .catch((err) => {
    console.log(err);
});
sequelize.sync({ force: false }).then(() => {
    console.log("synced !!");
});
exports.default = sequelize;
