<!--  Relationship,Categories Seeding and more -->

<!-- relationship between user and product -->

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

<!-- add this in connection.ts file -->

import { Sequelize } from "sequelize-typescript";
import \* as dotenv from "dotenv";
dotenv.config();
import User from "./models/userModel";
import Product from "./models/Product";

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

<!-- relationship -->
<!-- add -->

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

export default sequelize;

<!-- change herna ko lagi true banaune ani feri false  -->

sequelize.sync({ force: true }).then(() => {
console.log("synced !!");
});

<!-- change productController file  -->

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
!productPrice
) {
res.status(400).json({
message:
"Please provide productName,productDescription,productTotalStockQty,productPrice",
});
return;
}
await Product.create({
productName,
productDescription,
productPrice,
productTotalStockQty,
productImageUrl: fileName,

<!-- add this -->

userId: userId,

});
res.status(200).json({
message: "Product added successfully",
});
}
}

export default new ProductController();

<!-- category model -->
<!-- category.ts -->

import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
tableName: "categories",
modelName: "Category",
timestamps: true,
})
class Category extends Model {
@Column({
primaryKey: true,
type: DataType.UUID,
defaultValue: DataType.UUIDV4,
})
declare id: string;

@Column({
type: DataType.STRING,
allowNull: false,
})
declare categoryName: string;
}

export default Category;

<!-- Relation between category and product -->
<!-- connection.ts -->

import { Sequelize } from "sequelize-typescript";
import \* as dotenv from "dotenv";
dotenv.config();
import User from "./models/userModel";
import Product from "./models/Product";
import Category from "./models/Category";

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

<!-- change herna ko lagi true banaune ani feri false  -->

sequelize.sync({ force: false }).then(() => {
console.log("synced !!");
});

<!-- relationship -->

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

<!-- add -->

Category.hasOne(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

export default sequelize;

<!--create  categoryController -->

import Category from "../database/models/Category";
import { Request, Response } from "express";

class CategoryController {
categoryData = [
{
categoryName: "Electronics",
},
{
categoryName: "Groceries",
},
{
categoryName: "Food/Beverages",
},
];
async seedCategory(): Promise<void> {
const datas = await Category.findAll();
if (datas.length === 0) {
const data = await Category.bulkCreate(this.categoryData);
console.log("Categories seeded successfully");
} else {
console.log("Categories already seeded");
}
}

}

export default new CategoryController();

<!-- change productController -->

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

<!-- add this -->

categoryId:categoryId

});
res.status(200).json({
message: "Product added successfully",
});
}
}

export default new ProductController();

<!-- call seedCategory  index.ts -->

import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 8080;

import \* as dotenv from "dotenv";
dotenv.config();

import "./database/conection";
import categoryController from "./controllers/categoryController";
import productRoute from "./routes/productRoute";
import userRoute from "./routes/userRoutes";
app.use(express.json());

<!-- admin seeder -->

adminseeder();
app.use("/",userRoute);
app.use("/admin/product", productRoute);
app.listen(PORT, () => {
categoryController.seedCategory()
console.log("server has started", PORT);

});

<!-- text addproduct using postman add category id-->

<!-- code for get product -->
<!-- productController.ts -->

import { Request, Response } from "express";
import Product from "../database/models/Product";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../database/models/userModel";
import Category from "../database/models/Category";

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
categoryId:categoryId

});
res.status(200).json({
message: "Product added successfully",
});
}

<!-- add this -->

async getAllProducts(req: Request, res: Response): Promise<void> {
const data = await Product.findAll({
include: [
{
model: User,

<!-- user and product ma relationship vako la user model batw id email username get gareko  -->

attributes: ["id", "email", "username"],
},
{
model: Category,
attributes: ["id", "categoryName"],
},
],
});
res.status(200).json({
message: "Products fetched successfully",
data,
});
}

}

export default new ProductController();

<!-- update productRoute -->
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

<!-- add this -->

.get(productController.getAllProducts);
);

export default router;

<!-- get product using postman -->
