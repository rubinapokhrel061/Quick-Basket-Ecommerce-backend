<!-- Data base connection in short way -->

<!-- Dotenv -->

npm install dotenv

<!-- create .env file -->

DB_USERNAME=root
DB_PASSWORD=""
DB_NAME=Project2Backend
DB_HOST=127.0.0.1
DB_PORT=3306
SECRET_KEY="hahaha"

<!-- access -->

import \* as dotenv from "dotenv";
dotenv.config();

<!-- npm i sequlize-typescript -->

import { Sequelize } from "sequelize-typescript";
import \* as dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize({
database: process.env.DB_NAME,
dialect: "mysql",
username: process.env.DB_USERNAME,
password: process.env.DB_PASSWORD,
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT),
models: [__dirname + "/models"],

  <!-- //model ko direction path kaha xa vanne  -->

});

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

export default sequelize;

<!-- import this in main file (index.ts) like this -->

import "./database/connection"

<!-- create models folder and create userModel.ts inside this folder -->

import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
tableName: "users",

  <!-- database ma table ko name -->

modelName: "User",

  <!-- project ma yo model laii kun name la bujne tyo name -->

timestamps: true,
})

class User extends Model {
@Column({
primaryKey: true,
type: DataType.UUID,

<!-- random id->(uuid) universally unique identifier -->

defaultValue: DataType.UUIDV4,
})
declare id: string;

@Column({
type: DataType.STRING,
})
declare username: string;

declare role: string;

@Column({
type: DataType.STRING,
})
declare email: string;

@Column({
type: DataType.STRING,
})
declare password: string;
}

export default User;

<!--tsconfig.json ma gayera enable garne -->

"experimentalDecorators": true /_ Enable experimental support for legacy experimental decorators. _/,
"emitDecoratorMetadata": true /\*

<!-- run project  -->

<!-- create controllers folder and create userController.ts-->

import { Request, Response } from "express";
import User from "../database/models/userModel";

class AuthController {
public static async registerUser(req: Request, res: Response): Promise<void> {

      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        res.status(400).json({
          message: "Please provide username,email,password",
        });
        return;
      }

      await User.create({
        username,
        email,
        password

      });

      res.status(200).json({
        message: "User registered successfully",
      });

}

}
export default AuthController;

<!-- then create routes folder and create userRoute.ts -->

import express, { Router } from "express";
import AuthController from "../controllers/userController";
const router: Router = express.Router();

router.route("/register").post(AuthController.registerUser);

export default router;

<!-- link userRoute in index.ts (main file) -->

import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 8080;

import \* as dotenv from "dotenv";
dotenv.config();

import "./database/conection";

import userRoute from "./routes/userRoutes";
app.use(express.json());
app.use("/",userRoute);

app.listen(PORT, () => {

console.log("server has started", PORT);

});
