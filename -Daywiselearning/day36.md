<!-- we covered Add to Cart, Get Cart Items and more -->

<!-- first create cart model ->cart.ts -->

import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
tableName: "carts",
modelName: "Cart",
timestamps: true,
})
class Cart extends Model {
@Column({
primaryKey: true,
type: DataType.UUID,
defaultValue: DataType.UUIDV4,
})
declare id: string;

@Column({
type: DataType.INTEGER,
allowNull: false,
})
declare quantity: number;
}

export default Cart;

<!-- create relation between cart and product ,cart and user in connection.ts file -->

import { Sequelize } from "sequelize-typescript";
import \* as dotenv from "dotenv";
dotenv.config();
import User from "./models/userModel";
import Product from "./models/Product";
import Category from "./models/Category";
import Cart from "./models/Cart";
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

<!-- change herna ko lagi true banaune ani feri false  -->

sequelize.sync({ force: false }).then(() => {
console.log("synced !!");
});

<!-- relationship -->

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

Category.hasOne(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

<!-- add -->
<!-- // product-cart relation -->

User.hasMany(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

<!-- // user-cart relation -->

Product.hasMany(Cart, { foreignKey: "productId" });
Cart.belongsTo(Product, { foreignKey: "productId" });
export default sequelize;

<!-- create cartController.ts -->

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Cart from "../database/models/Cart";
import Product from "../database/models/Product";
import Category from "../database/models/Category";

class CartController {
async addToCart(req: AuthRequest, res: Response): Promise<void> {
const userId = req.user?.id;
const { quantity, productId } = req.body;
console.log(productId);
console.log(quantity);
if (!quantity || !productId) {
res.status(400).json({
message: "Please provide quantity,productId",
});
}
// check if the the product alreay exists in the cart table or not
let cartItem = await Cart.findOne({
where: {
productId,
userId,
},
});
if (cartItem) {
cartItem.quantity += quantity;
await cartItem.save();
} else {

<!-- // insert into Cart table -->

cartItem = await Cart.create({
quantity,
userId,
productId,
});
}
const data = await Cart.findAll({
where: {
userId,
},
});
res.status(200).json({
message: "Product added to cart",
data,
});
}

async getMyCarts(req: AuthRequest, res: Response): Promise<void> {
const userId = req.user?.id;
const cartItems = await Cart.findAll({
where: {
userId,
},
include: [
{
model: Product,
include: [
{
model: Category,
attributes: ["id", "categoryName"],
},
],
},
],
});
if (cartItems.length === 0) {
res.status(404).json({
message: "No item in the cart",
});
} else {
res.status(200).json({
message: "Cart items fetched succesfully",
data: cartItems,
});
}
}
}

export default new CartController();

<!-- create cartRoute.ts -->

import express, { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import cartController from "../controllers/cartController";
const router: Router = express.Router();

router
.route("/")
.post(authMiddleware.isAuthenticated, cartController.addToCart)
.get(authMiddleware.isAuthenticated, cartController.getMyCarts);

export default router;

<!-- import cartRoute in  index.ts(main file) -->

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
import cartRoute from "./routes/cartRoute";
app.use(express.json());

<!-- admin seeder -->

adminseeder();
app.use("/",userRoute);
app.use("/admin/product", productRoute);
app.use("/admin/category", categoryRoute);
app.use("/customer/cart", cartRoute);

app.listen(PORT, () => {
categoryController.seedCategory()
console.log("server has started", PORT);

});
