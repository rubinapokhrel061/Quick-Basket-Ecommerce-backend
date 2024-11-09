import multer from "multer";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: any) {
    const allowedFileTypes = ["image/jpg", "image/png", "image/jpeg"];
    if (!allowedFileTypes.includes(file.mimetype)) {
      cb(new Error("This filetype is not accepted"));
      return;
    }
    cb(null, "./uploads");
  },

  filename: function (req: Request, file: Express.Multer.File, cb: any) {
    const sanitizedFileName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + sanitizedFileName);
  },
});

export { multer, storage };
