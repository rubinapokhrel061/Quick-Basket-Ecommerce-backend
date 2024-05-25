"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
// import errorHandler from "../services/catchAsyncError";
const router = express_1.default.Router();
router.route("/register").post(userController_1.default.registerUser);
router.route("/login").post(userController_1.default.loginUser);
exports.default = router;
