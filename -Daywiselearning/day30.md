<!-- Encryption,Decryption,Hashing and more -->

<!-- for node js we use bcrypt for hashing technique -->

npm i bcrypt
npm i @types/bcrypt

<!-- userController.ts -->

import { Request, Response } from "express";
import User from "../database/models/userModel";

<!-- change -->

import bcrypt from "bcrypt"
class AuthController {
public static async registerUser(req: Request, res: Response): Promise<void> {

      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        res.status(400).json({
          message: "Please provide username,email,password",
        });
        return;
      }

      await User.create({
        username,
        email,
        <!-- change -->
        password:bcrypt.hashSync(password,8)
      });

      res.status(200).json({
        message: "User registered successfully",
      });

}

}
export default AuthController;
