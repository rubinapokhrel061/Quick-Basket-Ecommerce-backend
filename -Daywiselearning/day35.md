<!-- Product, Category Controller  -->

<!-- get single product and delete product controller -->
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

<!-- add this -->

async getSingleProduct(req: Request, res: Response): Promise<void> {
const id = req.params.id;
const data = await Product.findOne({
where: {
id: id,
},
include: [
{
model: User,
attributes: ["id", "email", "username"],
},
{
model: Category,
attributes: ["id", "categoryName"],
},
],
});
if (!data) {
res.status(404).json({
message: "No product with that id",
});
} else {
res.status(200).json({
message: "Product fetched successfully",
data,
});
}
}
async deleteProduct(req: Request, res: Response): Promise<void> {
const { id } = req.params;
const data = await Product.findAll({
where: {
id: id,
},
});
if (data.length > 0) {
await Product.destroy({
where: {
id: id,
},
});
res.status(200).json({
message: "Product deleted successfully",
});
} else {
res.status(404).json({
message: "No product with that id",
});
}
}

}

export default new ProductController();

<!--update product route  -->
<!--get single product and delete product -->

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
)
.get(productController.getAllProducts);

<!-- add this -->

router
.route("/:id")
.get(productController.getSingleProduct)
.delete(
authMiddleware.isAuthenticated,
authMiddleware.restrictTo(Role.Admin),
productController.deleteProduct
);

export default router;

<!-- add ,get,update and delete category controller -->
<!-- categoryControlller.ts -->

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

async addCategory(req: Request, res: Response): Promise<void> {
const { categoryName } = req.body;
if (!categoryName) {
res.status(400).json({ message: "Please provide categoryName" });
return;
}

    await Category.create({
      categoryName,
    });
    res.status(200).json({
      message: "Category Added successfully",
    });

}

async getCategories(req: Request, res: Response): Promise<void> {
const data = await Category.findAll();
res.status(200).json({
message: "Categories fetched",
data,
});
}

async deleteCategory(req: Request, res: Response) {
const { id } = req.params;
const data = await Category.findAll({
where: {
id,
},
});
if (data.length === 0) {
res.status(404).json({
message: "No category with that id",
});
} else {
await Category.destroy({
where: {
id,
},
});
res.status(200).json({
message: "Category deleted",
});
}
}
async updateCategory(req: Request, res: Response): Promise<void> {
const { id } = req.params;
const { categoryName } = req.body;
await Category.update(
{ categoryName },
{
where: {
id,
},
}
);
res.status(200).json({
message: "Category updated",
});
}

}

export default new CategoryController();

<!-- add ,get,update and delete categoryRoute -->
<!--create  categoryRoute.ts -->

import express, { Router } from "express";
import authMiddleware, { Role } from "../middleware/authMiddleware";
import categoryController from "../controllers/categoryController";
const router: Router = express.Router();

router
.route("/")
.post(
authMiddleware.isAuthenticated,
authMiddleware.restrictTo(Role.Admin),
categoryController.addCategory
)
.get(categoryController.getCategories);

router
.route("/:id")
.delete(
authMiddleware.isAuthenticated,
authMiddleware.restrictTo(Role.Admin),
categoryController.deleteCategory
)
.patch(
authMiddleware.isAuthenticated,
authMiddleware.restrictTo(Role.Admin),
categoryController.updateCategory
);

export default router;

<!-- import route index.ts -->

import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 8080;

import \* as dotenv from "dotenv";
dotenv.config();

import "./database/conection";
import categoryController from "./controllers/categoryController";
import productRoute from "./routes/productRoute";
import userRoute from "./routes/userRoutes";
import categoryRoute from "./routes/categoryRoute";
app.use(express.json());

<!-- admin seeder -->

adminseeder();
app.use("/",userRoute);
app.use("/admin/product", productRoute);

<!-- add -->

app.use("/admin/category", categoryRoute);
app.listen(PORT, () => {
categoryController.seedCategory()
console.log("server has started", PORT);

});
