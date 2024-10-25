<!-- Order Creation, Khalti Integration and more -->

<!--create interface  -->
<!-- orderTypes.ts -->

export interface OrderData {
phoneNumber: string;
shippingAddress: string;
totalAmount: number;
paymentDetails: {
paymentMethod: PaymentMethod;
paymentStatus?: PaymentStatus;
pidx?: string;
};
items: OrderDetails[];
}

export interface OrderDetails {
quantity: number;
productId: string;
}

export enum PaymentMethod {
Cod = "cod",
Khalti = "khalti",
}

export enum PaymentStatus {
Paid = "paid",
Unpaid = "unpaid",
}

<!--create orderController.ts -->

import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { OrderData, PaymentMethod } from "../types/orderTypes";
import Order from "../database/models/Order";
import Payment from "../database/models/Payment";
import OrderDetail from "../database/models/OrderDetails";
const items = [
{
quantity : 2,
productId : 2
},
{
quantity : 2,
productId : 2
},
{
quantity : 2,
productId : 2
}
]
class OrderController{
async createOrder(req:AuthRequest,res:Response):Promise<void>{
const userId = req.user?.id
const {phoneNumber,shippingAddress,totalAmount,paymentDetails,items}:OrderData = req.body
if(!phoneNumber || !shippingAddress || !totalAmount || !paymentDetails || !paymentDetails.paymentMethod || items.length == 0 ){
res.status(400).json({
message : "Please provide phoneNumber,shippingAddress,totalAmount,paymentDetails,items"
})
return
}
const orderData = await Order.create({
phoneNumber,
shippingAddress,
totalAmount,
userId
})
await Payment.create({
paymentMethod : paymentDetails.paymentMethod
})
for(var i = 0 ; i<items.length ; i++){
await OrderDetail.create({
quantity : items[i].quantity,
productId : items[0].productId,
orderId : orderData.id
})
}
if(paymentDetails.paymentMethod === PaymentMethod.Khalti){

<!-- // khalti integration -->

}else{
res.status(200).json({
message : "Order placed successfully"
})
}
}
}

<!-- khalti integration -->

1.khalti payment gateway
2.web checkout
3.sendbox access ->here ma jane for testing
4.merchant acccount banaune
5.account banera dashboard khulepaxi stting ma jane live secret key line

import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { OrderData, PaymentMethod } from "../types/orderTypes";
import Order from "../database/models/Order";
import Payment from "../database/models/Payment";
import OrderDetail from "../database/models/OrderDetails";

class OrderController {
async createOrder(req: AuthRequest, res: Response): Promise<void> {
const userId = req.user?.id;
const {
phoneNumber,
shippingAddress,
totalAmount,
paymentDetails,
items,
}: OrderData = req.body;
if (
!phoneNumber ||
!shippingAddress ||
!totalAmount ||
!paymentDetails ||
!paymentDetails.paymentMethod ||
items.length == 0
) {
res.status(400).json({
message:
"Please provide phoneNumber,shippingAddress,totalAmount,paymentDetails,items",
});
return;
}
const orderData = await Order.create({
phoneNumber,
shippingAddress,
totalAmount,
userId,
});
await Payment.create({
paymentMethod: paymentDetails.paymentMethod,
});
for (var i = 0; i < items.length; i++) {
await OrderDetail.create({
quantity: items[i].quantity,
productId: items[0].productId,
orderId: orderData.id,
});
}
if (paymentDetails.paymentMethod === PaymentMethod.Khalti) {

<!-- // khalti integration -->

      const data = {
        return_url: "http://localhost:5173/success/",
        purchase_order_id: orderData.id,
        amount: totalAmount * 100,
        website_url: "http://localhost:5173/",
        purchase_order_name: "orderName_" + orderData.id,
      };
      const response = await axios.post(
        "https://a.khalti.com/api/v2/epayment/initiate/",
        data,
        {
          headers: {
            Authorization: "key 968b182426d044ceb20a9a2d288dca83",
          },
        }
      );

} else {
res.status(200).json({
message: "Order placed successfully",
});
}
}
}

<!--create orderRoute.ts -->

import authMiddleware from '../middleware/authMiddleware'
import errorHandler from '../services/catchAsyncErrror'
import orderController from '../controllers/orderController'
const router:Router = express.Router()
router.route('/').post(authMiddleware.isAuthenticated,errorHandler(orderController.createOrder))
export default router

<!-- import orderRoute index.ts -->

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
import orderRoute from "./routes/orderRoute";

app.use(express.json());

<!-- admin seeder -->

adminseeder();
app.use("/",userRoute);
app.use("/admin/product", productRoute);
app.use("/admin/category", categoryRoute);
app.use("/customer/cart", cartRoute);
app.use("/order", orderRoute);
app.listen(PORT, () => {
categoryController.seedCategory()
console.log("server has started", PORT);

});

<!-- add khalitResponse interface in orderTypes.ts  -->

export interface OrderData {
phoneNumber: string;
shippingAddress: string;
totalAmount: number;
paymentDetails: {
paymentMethod: PaymentMethod;
paymentStatus?: PaymentStatus;
pidx?: string;
};
items: OrderDetails[];
}

export interface OrderDetails {
quantity: number;
productId: string;
}

export enum PaymentMethod {
Cod = "cod",
Khalti = "khalti",
}

export enum PaymentStatus {
Paid = "paid",
Unpaid = "unpaid",
}

<!-- add this -->

export interface KhaltiResponse {
pidx: string;
payment_url: string;
expires_at: Date | string;
expires_in: number;
user_fee: number;
}

<!-- khaltipayment response handle in orderController -->

import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { OrderData, PaymentMethod } from "../types/orderTypes";
import Order from "../database/models/Order";
import Payment from "../database/models/Payment";
import OrderDetail from "../database/models/OrderDetails";

class OrderController {
async createOrder(req: AuthRequest, res: Response): Promise<void> {
const userId = req.user?.id;
const {
phoneNumber,
shippingAddress,
totalAmount,
paymentDetails,
items,
}: OrderData = req.body;
if (
!phoneNumber ||
!shippingAddress ||
!totalAmount ||
!paymentDetails ||
!paymentDetails.paymentMethod ||
items.length == 0
) {
res.status(400).json({
message:
"Please provide phoneNumber,shippingAddress,totalAmount,paymentDetails,items",
});
return;
}
const orderData = await Order.create({
phoneNumber,
shippingAddress,
totalAmount,
userId,
});
await Payment.create({
paymentMethod: paymentDetails.paymentMethod,
});
for (var i = 0; i < items.length; i++) {
await OrderDetail.create({
quantity: items[i].quantity,
productId: items[0].productId,
orderId: orderData.id,
});
}
if (paymentDetails.paymentMethod === PaymentMethod.Khalti) {

<!-- // khalti integration -->

      const data = {
        return_url: "http://localhost:5173/success/",
        purchase_order_id: orderData.id,
        amount: totalAmount * 100,
        website_url: "http://localhost:5173/",
        purchase_order_name: "orderName_" + orderData.id,
      };
      const response = await axios.post(
        "https://a.khalti.com/api/v2/epayment/initiate/",
        data,
        {
          headers: {
            Authorization: "key 968b182426d044ceb20a9a2d288dca83",
          },
        }
      );

<!-- add this -->

const khaltiResponse: KhaltiResponse = response.data;
paymentData.pidx = khaltiResponse.pidx;
paymentData.save();
res.status(200).json({
message: "order placed successfully",
url: khaltiResponse.payment_url,
});
} else {
res.status(200).json({
message: "Order placed successfully",
});
}
}
}
