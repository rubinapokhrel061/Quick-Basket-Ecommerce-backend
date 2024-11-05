import express, { Router } from "express";
import AuthController from "../controllers/userController";
import errorHandler from "../services/catchAsyncError";
import authMiddleware, { Role } from "../middleware/authMiddleware";

const router: Router = express.Router();
router.route("/register").post(errorHandler(AuthController.registerUser));
router.route("/login").post(errorHandler(AuthController.loginUser));
router
  .route("/users")
  .get(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    errorHandler(AuthController.fetchUsers)
  );

router
  .route("/user/:id")

  .delete(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    errorHandler(AuthController.deleteUser)
  )
  .patch(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    errorHandler(AuthController.UpdateUser)
  );
export default router;
