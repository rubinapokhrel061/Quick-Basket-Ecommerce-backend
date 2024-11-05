import { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../database/models/userModel";
import { AuthRequest, Role } from "../middleware/authMiddleware";

class AuthController {
  public static async registerUser(req: Request, res: Response): Promise<void> {
    const { username, email, password, role } = req.body;
    const userRole = role || Role.Customer;
    if (!username || !email || !password) {
      res.status(400).json({
        message: "Please provide username,email,password",
      });
      return;
    }

    await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 12),
      role: userRole,
    });

    res.status(200).json({
      message: "User registered successfully",
    });
  }

  public static async loginUser(req: Request, res: Response): Promise<void> {
    // user input
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        message: "Please provide email,password",
      });
      return;
    }
    // check whether user with above email exist or not

    const [data] = await User.findAll({
      where: {
        email: email,
      },
    });
    if (!data) {
      res.status(404).json({
        message: "No user with that email",
      });
      return;
    }

    // check password now
    const isMatched = bcrypt.compareSync(password, data.password);
    if (!isMatched) {
      res.status(403).json({
        message: "Invalid password",
      });
      return;
    }

    // generate token
    const token = jwt.sign({ id: data.id }, process.env.SECRET_KEY as string, {
      expiresIn: "20d",
    });
    res.status(200).json({
      message: "Logged in successfully",
      data: token,
    });
  }

  public static async fetchUsers(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const users = await User.findAll();
    if (users.length > 0) {
      res.status(200).json({
        message: "User fetched successfully",
        data: users,
      });
    } else {
      res.status(404).json({
        message: "you haven't any user ",
        data: [],
      });
    }
  }

  public static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const data = await User.destroy({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: "User deleted Successfully",
    });
  }

  public static async UpdateUser(req: Request, res: Response): Promise<void> {
    const { id, username, email, role } = req.body;

    // Validate that id, username, email, and role are provided
    if (!id || !username || !email || !role) {
      res.status(400).json({
        message: "Please provide id, username, email, and role",
      });
      return;
    }

    try {
      // Check if the user exists by their id
      const existingUser = await User.findByPk(id);

      if (!existingUser) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      // Check if the new email already exists in the system (if it's being updated)
      if (existingUser.email !== email) {
        const emailExists = await User.findOne({
          where: {
            email,
          },
        });

        if (emailExists) {
          res.status(400).json({
            message: "Email is already taken by another user",
          });
          return;
        }
      }

      // Prepare the data to update
      const updatedData: any = {
        username,
        email,
        role,
      };

      // Only update the password if provided
      if (req.body.password) {
        updatedData.password = bcrypt.hashSync(req.body.password, 12);
      }

      // Update the user in the database
      await User.update(updatedData, {
        where: {
          id,
        },
      });

      res.status(200).json({
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error in UpdateUser:", error);
      res.status(500).json({
        message: "An error occurred while processing your request",
      });
    }
  }
}

export default AuthController;
