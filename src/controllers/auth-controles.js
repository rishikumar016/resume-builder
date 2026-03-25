import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { AppError } from "../middleware/error.js";

export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const isAlreadyExist = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (isAlreadyExist) {
      return next(new AppError("Username or Email already exists", 400));
    }

    const newUser = new User({
      username,
      email,
      password,
    });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return next(error);
  }
};
export { registerUser };
