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
  )
  .get(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    orderController.fetchOrders
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
router
  .route("/admin/payment/:id")
  .patch(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    errorHandler(orderController.changePaymentStatus)
  );

router
  .route("/admin/:id")
  .patch(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    errorHandler(orderController.changeOrderStatus)
  )
  .delete(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    errorHandler(orderController.deleteOrder)
  );

export default router;
