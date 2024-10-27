import User from "./database/models/userModel";
import bcrypt from "bcrypt";

const adminseeder = async (): Promise<void> => {
  const [data] = await User.findAll({
    where: {
      email: "admin@gmail.com",
    },
  });
  if (!data) {
    await User.create({
      email: "admin@gmail.com",
      password: bcrypt.hashSync("admin@123", 8),
      username: "admin",
      role: "admin",
    });
    console.log("admin credentials seeded sucessfully");
  } else {
    console.log("admin credentials already seeded");
  }
};
export default adminseeder;
