<!-- Order, Customer Side Order APis and more -->

<!-- add type of TransactionVerificationResponse,TransactionStatus  in orderType.ts  -->

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

export interface KhaltiResponse {
pidx: string;
payment_url: string;
expires_at: Date | string;
expires_in: number;
user_fee: number;
}
export interface TransactionVerificationResponse {
pidx: string;
total_amount: number;
status: TransactionStatus;
transaction_id: string;
fee: number;
refunded: boolean;
}
export enum TransactionStatus {
Completed = "completed",
Refunded = "refunded",
Pending = "pending",
Initiated = "initiated",
}

<!-- add verifyTransaction  in orderController -->

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

<!-- add this -->

async verifyTransaction(req: AuthRequest, res: Response): Promise<void> {
const { pidx } = req.body;

    if (!pidx) {
      res.status(400).json({
        message: "Please provide pidx",
      });
      return;
    }
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: "key 968b182426d044ceb20a9a2d288dca83",
        },
      }
    );
    const data: TransactionVerificationResponse = response.data;
    console.log(data);
    if (data.status === TransactionStatus.Completed) {
      await Payment.update(
        { paymentStatus: "paid" },
        {
          where: {
            pidx: pidx,
          },
        }
      );
      res.status(200).json({
        message: "Payment verified successfully",
      });
    } else {
      res.status(200).json({
        message: "Payment not verified",
      });
    }

}

}

<!-- add verification payment route in orderRoutes  -->

import authMiddleware from '../middleware/authMiddleware'
import errorHandler from '../services/catchAsyncErrror'
import orderController from '../controllers/orderController'
const router:Router = express.Router()
router.route('/').post(authMiddleware.isAuthenticated,errorHandler(orderController.createOrder))
router.route('/verify').post(authMiddleware.isAuthenticated,errorHandler(orderController.verifyTransaction))

export default router

<!-- add OrderStatus type for deleteOrder   -->
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

export interface KhaltiResponse {
pidx: string;
payment_url: string;
expires_at: Date | string;
expires_in: number;
user_fee: number;
}
export interface TransactionVerificationResponse {
pidx: string;
total_amount: number;
status: TransactionStatus;
transaction_id: string;
fee: number;
refunded: boolean;
}
export enum TransactionStatus {
Completed = "completed",
Refunded = "refunded",
Pending = "pending",
Initiated = "initiated",
}

export enum OrderStatus {
Pending = "pending",
Cancelled = "cancelled ",
Ontheway = "ontheway",
Delivered = "delivered",
Preparation = "preparation",
}

<!-- add fetchMyOrders,fetchOrderDetails,cancelMyOrder in  orderController.ts -->

import { Response, Request } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
KhaltiResponse,
OrderData,
OrderStatus,
PaymentMethod,
PaymentStatus,
TransactionStatus,
TransactionVerificationResponse,
} from "../types/orderTypes";
import Order from "../database/models/Order";
import Payment from "../database/models/Payment";
import OrderDetail from "../database/models/OrderDetails";
import axios from "axios";
import Product from "../database/models/Product";

class ExtendedOrder extends Order {
declare paymentId: string | null;
}

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

    const paymentData = await Payment.create({
      paymentMethod: paymentDetails.paymentMethod,
    });
    const orderData = await Order.create({
      phoneNumber,
      shippingAddress,
      totalAmount,
      userId,
      paymentId: paymentData.id,
    });

    for (var i = 0; i < items.length; i++) {
      await OrderDetail.create({
        quantity: items[i].quantity,
        productId: items[i].productId,
        orderId: orderData.id,
      });
    }
    if (paymentDetails.paymentMethod === PaymentMethod.Khalti) {
      // khalti integration
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
async verifyTransaction(req: AuthRequest, res: Response): Promise<void> {
const { pidx } = req.body;

    if (!pidx) {
      res.status(400).json({
        message: "Please provide pidx",
      });
      return;
    }
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: "key 968b182426d044ceb20a9a2d288dca83",
        },
      }
    );
    const data: TransactionVerificationResponse = response.data;
    console.log(data);
    if (data.status === TransactionStatus.Completed) {
      await Payment.update(
        { paymentStatus: "paid" },
        {
          where: {
            pidx: pidx,
          },
        }
      );
      res.status(200).json({
        message: "Payment verified successfully",
      });
    } else {
      res.status(200).json({
        message: "Payment not verified",
      });
    }

}
// customer SIDE Starts here
async fetchMyOrders(req: AuthRequest, res: Response): Promise<void> {
const userId = req.user?.id;
const orders = await Order.findAll({
where: {
userId,
},
include: [
{
model: Payment,
},
],
});
if (orders.length > 0) {
res.status(200).json({
message: "order fetched successfully",
data: orders,
});
} else {
res.status(404).json({
message: "you haven't ordered anything yet..",
data: [],
});
}
}
async fetchOrderDetails(req: AuthRequest, res: Response): Promise<void> {
const orderId = req.params.id;
const orderDetails = await OrderDetail.findAll({
where: {
orderId,
},
include: [
{
model: Product,
},
],
});
if (orderDetails.length > 0) {
res.status(200).json({
message: "orderDetails fetched successfully",
data: orderDetails,
});
} else {
res.status(404).json({
message: "no any orderDetails of that id",
data: [],
});
}
}
async cancelMyOrder(req: AuthRequest, res: Response): Promise<void> {
const userId = req.user?.id;
const orderId = req.params.id;
const order: any = await Order.findAll({
where: {
userId,
id: orderId,
},
});
if (
order?.orderStatus === OrderStatus.Ontheway ||
order?.orderStatus === OrderStatus.Preparation
) {
res.status(200).json({
message: "You cannot cancell order when it is in ontheway or prepared",
});
return;
}
await Order.update(
{ orderStatus: OrderStatus.Cancelled },
{
where: {
id: orderId,
},
}
);
res.status(200).json({
message: "Order cancelled successfully",
});
}

}

export default new OrderController();

<!-- add route in orderRoute -->

import express, { Router } from "express";
import authMiddleware, { Role } from "../middleware/authMiddleware";

import orderController from "../controllers/orderController";
import errorHandler from "../services/catchAsyncError";
const router: Router = express.Router();

router
.route("/")
.post(
authMiddleware.isAuthenticated,
errorHandler(orderController.createOrder)
);
router
.route("/verify")
.post(
authMiddleware.isAuthenticated,
errorHandler(orderController.verifyTransaction)
);

router
.route("/customer/")
.get(
authMiddleware.isAuthenticated,
errorHandler(orderController.fetchMyOrders)
);
router
.route("/customer/:id")
.patch(
authMiddleware.isAuthenticated,
authMiddleware.restrictTo(Role.Customer),
errorHandler(orderController.cancelMyOrder)
)
.get(
authMiddleware.isAuthenticated,
errorHandler(orderController.fetchOrderDetails)
);

export default router;
