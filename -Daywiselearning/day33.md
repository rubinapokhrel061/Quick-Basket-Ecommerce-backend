<!-- Authentication,Authorization, Add Product and more  -->
<!-- add secret key in .env file -->

DB_USERNAME=root
DB_PASSWORD=""
DB_NAME=Project2Backend
DB_HOST=127.0.0.1
DB_PORT=3306

<!-- add -->

SECRET_KEY="hahaha"

<!-- also change userController -->

import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
class AuthController {
public static async registerUser(req: Request, res: Response): Promise<void> {

<!-- add and change sectio  -->

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
<!-- add SECRET_KEY -->

const token = jwt.sign({ id: data.id },process.env.SECRET_KEY as string, {
expiresIn: "20d",
});
res.status(200).json({
message: "Logged in sucessfully",
data: token,
});

}
}
export default AuthController;

<!-- create  middleware folder and create authMiddleware.ts -->

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/userModel";

export interface AuthRequest extends Request {
user?: {
username: string;
email: string;
role: string;
password: string;
id: string;
};
}

export enum Role {
Admin = "admin",
Customer = "customer",
}

class AuthMiddleware {
async isAuthenticated(
req: AuthRequest,
res: Response,
next: NextFunction
): Promise<void> {
// get token from user
const token = req.headers.authorization;
if (!token || token === undefined) {
res.status(403).json({
message: "Token not provided",
});
return;
}
// verify token if it. it is legit or tampered
jwt.verify(
token,
process.env.SECRET_KEY as string,
async (err, decoded: any) => {
if (err) {
res.status(403).json({
message: "Invalid Token",
});
} else {
// check if that decoded object id user exist or not
try {
const userData = await User.findByPk(decoded.id);
if (!userData) {
res.status(404).json({
message: "No user with that token",
});
return;
}
req.user = userData;
next();
} catch (error) {
res.status(500).json({
message: "Something went wrong",
});
}
}
}
);
}

  <!-- check role customer and admin ma yeuta xa ki naii  -->

restrictTo(...roles: Role[]) {
return (req: AuthRequest, res: Response, next: NextFunction) => {
let userRole = req.user?.role as Role;
console.log(userRole);
if (!roles.includes(userRole)) {
res.status(403).json({
message: "you don't have permission",
});
} else {
next();
}
};
}
}

export default new AuthMiddleware();

<!-- create product table or models/product.ts -->

import {
Table,
Column,
Model,
DataType,
AllowNull,
} from "sequelize-typescript";

@Table({
tableName: "products",
modelName: "Product",
timestamps: true,
})
class Product extends Model {
@Column({
primaryKey: true,
type: DataType.UUID,
defaultValue: DataType.UUIDV4,
})
declare id: string;

@Column({
type: DataType.STRING,
allowNull: false,

<!-- required true -->

})
declare productName: string;

@Column({
type: DataType.TEXT,
})
declare productDescription: string;

@Column({
type: DataType.INTEGER,
})
declare productPrice: number;
@Column({
type: DataType.INTEGER,
})
declare productTotalStockQty: number;

@Column({
type: DataType.STRING,
})
declare productImageUrl: string;
}

export default Product;

<!-- product controller -->

import { Request, Response } from "express";
import Product from "../database/models/Product";
import { AuthRequest } from "../middleware/authMiddleware";

class ProductController {
async addProduct(req: AuthRequest, res: Response): Promise<void> {
const userId = req.user?.id;
const {
productName,
productDescription,
productTotalStockQty,
productPrice,
categoryId,
} = req.body;
let fileName;
if (req.file) {
fileName = req.file?.filename;
} else {
fileName =
"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhZHBob25lfGVufDB8fDB8fHww";
}
if (
!productName ||
!productDescription ||
!productTotalStockQty ||
!productPrice ||
!categoryId
) {
res.status(400).json({
message:
"Please provide productName,productDescription,productTotalStockQty,productPrice & categoryId",
});
return;
}
await Product.create({
productName,
productDescription,
productPrice,
productTotalStockQty,
productImageUrl: fileName,
userId: userId,
categoryId: categoryId,
});
res.status(200).json({
message: "Product added successfully",
});
}
}

export default new ProductController();

<!-- create multerMiddleware.ts -->

import multer from "multer";
import { Request } from "express";

const storage = multer.diskStorage({
destination: function (req: Request, file: Express.Multer.File, cb: any) {
const allowedFileTypes = ["image/jpg", "image/png", "image/jpeg"];
if (!allowedFileTypes.includes(file.mimetype)) {
cb(new Error("This filetype is not accepted"));
return;
}
cb(null, "./src/uploads");
},

filename: function (req: Request, file: Express.Multer.File, cb: any) {
cb(null, Date.now() + "-" + file.originalname);
},
});

export { multer, storage };

<!-- create uploads folder jaha image store hunxa -->

<!-- then create route for product -->
<!-- productRoute.ts -->

import express, { Router } from "express";
import authMiddleware, { Role } from "../middleware/authMiddleware";
import productController from "../controllers/productController";
import { multer, storage } from "../middleware/multerMiddleware";

const upload = multer({ storage: storage });
const router: Router = express.Router();

router
.route("/")
.post(
authMiddleware.isAuthenticated,
authMiddleware.restrictTo(Role.Admin),
upload.single("image"),
productController.addProduct
);

export default router;

<!-- import productRoute.ts in index.ts (main file) -->

import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 8080;

import \* as dotenv from "dotenv";
dotenv.config();

import "./database/conection";
import productRoute from "./routes/productRoute";
import userRoute from "./routes/userRoutes";
app.use(express.json());

<!-- admin seeder -->

adminseeder();
app.use("/",userRoute);
app.use("/admin/product", productRoute);
app.listen(PORT, () => {

console.log("server has started", PORT);

});

<!-- text addproduct using postman -->
