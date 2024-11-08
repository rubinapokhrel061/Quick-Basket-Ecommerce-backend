import { Request, Response } from "express";
import Product from "../database/models/Product";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../database/models/userModel";
import Category from "../database/models/Category";
import Review from "../database/models/Review";

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
      fileName =
        "https://ecommerce-backend-9epn.onrender.com/" + req.file?.filename;
    } else {
      fileName =
        "https://commons.wikimedia.org/wiki/File:Image_not_available.png#/media/File:Image_not_available.png";
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
          "Please provide productName,,productDescription,productTotalStockQty,productPrice,categoryId",
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
      categoryId: categoryId,
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
        {
          model: Review,
          attributes: [
            "id",
            "productId",
            "reviewerName",
            "rating",
            "reviewContent",
          ],
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

  async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const {
      productName,
      productDescription,
      productTotalStockQty,
      productPrice,
      categoryId,
    } = req.body;

    const product = await Product.findOne({ where: { id } });
    if (!product) {
      res.status(404).json({
        message: "No product with that id",
      });
      return;
    }

    const updatedData: any = {};

    if (productName) updatedData.productName = productName;
    if (productDescription) updatedData.productDescription = productDescription;
    if (productTotalStockQty)
      updatedData.productTotalStockQty = productTotalStockQty;
    if (productPrice) updatedData.productPrice = productPrice;
    if (categoryId) updatedData.categoryId = categoryId;

    let fileName;
    if (req?.file) {
      fileName = "http://localhost:8080/uploads/" + req?.file?.filename;
      updatedData.productImageUrl = fileName;
    }

    await Product.update(updatedData, { where: { id } });

    res.status(200).json({
      message: "Product updated successfully",
    });
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

  async createProductReview(req: Request, res: Response): Promise<void> {
    const { rating, reviewContent, reviewerName, userId } = req.body;
    const { id } = req.params;
    console.log(rating, reviewContent, reviewerName, userId);
    try {
      if (!rating || !reviewContent) {
        res.status(400).json({
          message: "Please provide rating and review ",
        });
        return;
      }
      if (!reviewerName || !userId) {
        res.status(400).json({
          message: "Please Login first!",
        });
        return;
      }
      const product = await Product.findOne({ where: { id } });

      if (!product) {
        res.status(404).json({
          message: "Product not found",
        });
        return;
      }

      const alreadyReviewed = await Review.findOne({
        where: {
          productId: id,
          userId: userId,
        },
      });

      if (alreadyReviewed) {
        res.status(400).json({
          message: "You have already reviewed this product",
        });
        return;
      }

      await Review.create({
        productId: id,
        reviewerName,
        rating: Number(rating),
        reviewContent,
        userId,
      });

      const productReviews = await Review.findAll({
        where: { productId: id },
      });

      const numReviews = productReviews.length;

      const ratingSum = productReviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const avgRating = Math.floor(ratingSum / numReviews);

      await Product.update(
        { rating: avgRating, numReviews },
        { where: { id } }
      );

      res.status(200).json({
        message: "Review added successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong. Please try again later.",
      });
    }
  }
}

export default new ProductController();
