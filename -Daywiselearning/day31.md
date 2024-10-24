 <!-- Login,Token,Error handling and more -->

<!-- token: identifier of who you are in  the system -->
<!-- in node js use jwt(json web token) -->

npm i jsonwebtoken
npm i @types/jsonwebtoken --save-dev

 <!-- login controller -->

import { Request, Response } from "express";
import User from "../database/models/userModel";

import bcrypt from "bcrypt";

<!-- add -->

import jwt from "jsonwebtoken";
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
         password:bcrypt.hashSync(password,8)

      });

      res.status(200).json({
        message: "User registered successfully",
      });

}

 <!-- add section  -->

public static async loginUser(req: Request, res: Response): Promise<void> {

<!-- //user input -->

const { email, password } = req.body;
if (!email || !password) {
res.status(400).json({
message: "Please provide email & password",
});
return;
}

<!-- //check whether user with above email exist or not -->

const [data] = await User.findAll({
where: {
email: email,
},
});
if (!data) {
res.status(400).json({
message: "No user with that email",
});
return;
}

<!-- //check password now -->
<!-- password-> check garne password and data.password->database ma vako password -->

const isMatched = bcrypt.compareSync(password, data.password);
if (!isMatched) {
res.status(403).json({
message: "Invalid email or password",
});
return;
}

<!-- generate token  -->

const token = jwt.sign({ id: data.id }, "hello", {
expiresIn: "20d",
});
res.status(200).json({
message: "Logged in sucessfully",
data: token,
});

}
}
export default AuthController;

<!-- define route (login)   -->

import express, { Router } from "express";
import AuthController from "../controllers/userController";

const router: Router = express.Router();
router.route("/register").post(AuthController.registerUser);
router.route("/login").post(AuthController.loginUser);
export default router;

<!-- test using postman -->

<!-- kunaii column add garna paryo model ma vane  -->

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

<!-- add this new column -->

@Column({
type: DataType.ENUM("customer", "admin"),
defaultValue: "customer",
})
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

<!-- change controller with error handling try catch -->

import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
class AuthController {
public static async registerUser(req: Request, res: Response): Promise<void> {

<!-- add and change sectio  -->

try{
const { username, email, password, role } = req.body;
if (!username || !email || !password) {
res.status(400).json({
message: "Please provide username,email,password",
});
return;
}

      await User.create({
        username,
        email,
         password:bcrypt.hashSync(password,8)
      role:role

      });

      res.status(200).json({
        message: "User registered successfully",
      });

}catch(error:any){
res.status(500).json({
message:error.message
})
}

}

public static async loginUser(req: Request, res: Response): Promise<void> {

<!-- //user input -->

const { email, password } = req.body;
if (!email || !password) {
res.status(400).json({
message: "Please provide email & password",
});
return;
}

<!-- //check whether user with above email exist or not -->

const [data] = await User.findAll({
where: {
email: email,
},
});
if (!data) {
res.status(400).json({
message: "No user with that email",
});
return;
}

<!-- //check password now -->
<!-- password-> check garne password and data.password->database ma vako password -->

const isMatched = bcrypt.compareSync(password, data.password);
if (!isMatched) {
res.status(403).json({
message: "Invalid email or password",
});
return;
}

<!-- generate token  -->

const token = jwt.sign({ id: data.id }, "hello", {
expiresIn: "20d",
});
res.status(200).json({
message: "Logged in sucessfully",
data: token,
});

}
}
export default AuthController;

<!-- subaii ma try catch lagaunu ko alternative error handle garna yeuta global function banaune jasla funtion naii return garxa -->

<!-- create services folder  and create file catchAsyncError.ts -->

import { Request, Response } from "express";

const errorHandler = (fn: Function) => {
return (req: Request, res: Response) => {
fn(req, res).catch((err: Error) => {
return res.status(500).json({
messsage: "Internal Error",
errorMessage: err.message,
});
});
};
};
export default errorHandler;

<!-- controller ko try catch laii hataune  ani userRoute ma global function call garne-->

import express, { Router } from "express";
import AuthController from "../controllers/userController";
import errorHandler from "../services/catchAsyncError";
const router: Router = express.Router();

<!-- like this -->

router.route("/register").post(errorHandler(AuthController.registerUser));
router.route("/login").post(errorHandler(AuthController.loginUser));
export default router;
