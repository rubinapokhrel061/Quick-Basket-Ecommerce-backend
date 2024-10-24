 <!-- Admin Seeder, Middleware and more -->

 <!-- A seeder function is a piece of code that is responsible for populating a database with initial or dummy data. -->

<!-- create adminSeeder.ts -->

import User from "./database/models/userModel";
import bcrypt from "bcrypt";

const adminseeder = async (): Promise<void> => {
const [data] = await User.findAll({
where: {
email: "p2admin@gmail.com",
},
});
if (!data) {
await User.create({
email: "p2admin@gmail.com",
password: bcrypt.hashSync("p2password", 8),
username: "p2admin",
role: "admin",
});
console.log("admin credentials seeded sucessfully");
} else {
console.log("admin credentials already seeded");
}
};
export default adminseeder;

<!-- call adminseeder in index.ts file(main) like this -->

adminseeder();

<!-- middleware -->
<!-- first check login or not -> uthorized persion or not ->add product -->
