<!-- Order, Order Details, Payment Table and more -->

<!-- create order model inside model folder ,Order.ts -->

import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
tableName: "orders",
modelName: "Order",
timestamps: true,
})
class Order extends Model {
@Column({
primaryKey: true,
type: DataType.UUID,
defaultValue: DataType.UUIDV4,
})
declare id: string;

@Column({
type: DataType.STRING,
allowNull: false,
validate: {
len: {
args: [10, 10],
msg: "Phone number must be 10 digits",
},
},
})
declare phoneNumber: string;

@Column({
type: DataType.STRING,
allowNull: false,
})
declare shippingAddress: string;

@Column({
type: DataType.FLOAT,
allowNull: false,
})
declare totalAmount: number;

@Column({
type: DataType.ENUM(
"pending",
"cancelled",
"delivered",
"ontheway",
"preparation"
),
defaultValue: "pending",
})
declare orderStatus: string;
}

export default Order;

<!-- create orderDetails model inside models folder ,OrderDetails.ts -->

import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
tableName: "orderdetails",
modelName: "OrderDetail",
timestamps: true,
})
class OrderDetail extends Model {
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

export default OrderDetail;

<!-- create payment model inside model folder , Payment.ts -->

import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
tableName: "payments",
modelName: "Payment",
timestamps: true,
})
class Payment extends Model {
@Column({
primaryKey: true,
type: DataType.UUID,
defaultValue: DataType.UUIDV4,
})
declare id: string;

@Column({
type: DataType.ENUM("cod", "khalti", "esewa"),
allowNull: false,
})
declare paymentMethod: string;

@Column({
type: DataType.ENUM("paid", "unpaid"),
defaultValue: "unpaid",
})
declare paymentStatus: string;

@Column({
type: DataType.STRING,
})
declare pidx: string;
}

export default Payment;

<!-- add new relation -->

import { Sequelize } from "sequelize-typescript";
import \* as dotenv from "dotenv";
import User from "./models/userModel";
import Product from "./models/Product";
import Category from "./models/Category";
import Cart from "./models/Cart";
import Order from "./models/Order";
import OrderDetail from "./models/OrderDetails";
import Payment from "./models/Payment";
dotenv.config();

const sequelize = new Sequelize({
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

<!-- //Relationship -->

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

Category.hasOne(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

<!-- // product-cart relation -->

User.hasMany(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

<!-- // user-cart relation -->

Product.hasMany(Cart, { foreignKey: "productId" });
Cart.belongsTo(Product, { foreignKey: "productId" });

<!-- // // order-orderdetail relation -->

Order.hasMany(OrderDetail, { foreignKey: "orderId" });
OrderDetail.belongsTo(Order, { foreignKey: "orderId" });

<!-- // orderdetail-product relation -->

Product.hasMany(OrderDetail, { foreignKey: "productId" });
OrderDetail.belongsTo(Product, { foreignKey: "productId" });

<!-- //order-payment relation -->

Payment.hasOne(Order, { foreignKey: "paymentId" });
Order.belongsTo(Payment, { foreignKey: "paymentId" });

<!-- //order-user relation -->

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

export default sequelize;
