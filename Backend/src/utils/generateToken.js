import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT, {
    expiresIn: "30d", // تم تمديدها لـ 30 يوم لراحة المستخدم
  });
};

export default generateToken;
