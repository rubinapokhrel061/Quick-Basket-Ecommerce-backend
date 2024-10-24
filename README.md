<!-- day28 -->

-> npm i --save-dev typescript

-> ts ko tsconfig file ko lagi
-> npx tsc --init

<!-- ts and js code path provide inside tsconfig.json file -->
<!-- ts code || ts file path -->

"rootDir":"src"

<!-- build js code || js file path -->

"outDir":"build"

<!-- main file index.js in ts basic code -->

import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 8080;

app.get("/",(req:Request,res:Response)=>{
res.send("Hello world")
})
app.listen(PORT, () => {

console.log("server has started", PORT);
app;
});

<!-- node la ts file run gardaina tesaile js ma convert garnu parxa -->

npx tsc

<!-- aba build vitrako js file run garne  -->

node build/app.js

<!-- or  package.json -->

"start":"npx tsc && node build/app.js"

<!-- database connection -->

npm i sequelize mysql2

<!-- npm i --save-dev @types/sequelize -->

<!-- src/config/dbconfig.ts -->

type Database = {
host: string;
user: string;
password: string;
db: string;
dialect: "mysql" | "postgres" | "sqlite";
pool: {
max: number;
min: number;
idle: number;
acquire: number;
};
};

const dbConfig: Database = {
host: "localhost",
user: "root",
password: "",
db: "project2database",
dialect: "mysql",
pool: {
idle: 10000,
max: 5,
min: 0,
acquire: 10000,
},
};
export default dbConfig;

 <!-- After -->
 <!-- src/model/index.ts -->

import { Sequelize, DataType } from "sequelize";
import dbConfig from "../config/dbConfig";

const sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, {
host: dbConfig.host,
dialect: dbConfig.dialect,
port: 3307,
pool: {
acquire: dbConfig.pool.acquire,
min: dbConfig.pool.min,
max: dbConfig.pool.max,
idle: dbConfig.pool.idle,
},
});

sequelize.authenticate().then(() => {
console.log("connected");
});
const db: any = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize.sync({ force: false }).then(() => {
console.log("Yes migrated");
});

export default db;

<!-- after this  -->

connect database index file to main(app.ts) file

import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 8080;

<!-- connection -->

require("./model/index");

app.get("/",(req:Request,res:Response)=>{
res.send("Hello world")
})
app.listen(PORT, () => {

console.log("server has started", PORT);
app;
});

<!-- auto restart in ts -->
<!-- run without change ts file to js // run time maii ts laii js ma convert garera run garne  -->

1.first

<!-- create new json file nodeman.json -->

{
"watch": ["src"],
"ext": ".ts,.js",
"ignore": [],
"exec": "npx ts-node ./src/index.ts"
}

2.go package.json
"start":"npx nodemon"

<!-- npx la nodemon lai execute garauxa -->

<!-- rimraf la previously build vako config file laii hatauxa -->

npm i rimraf --save-dev

<!-- add this in package.json file-->

"build":"rimraf ./build && tsc"

<!-- then run command npm run build for delete existing file and create again   -->
