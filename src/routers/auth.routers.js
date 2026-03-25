import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} from "../controllers/auth-controles.js";
import userAuth from "../middleware/auth.js";

const authRouters = express.Router();

/**
 *  @route POST /api/auth/register
 *  @desc Register a new user
 *  @access Public
 */

authRouters.post("/register", registerUser);

authRouters.post("/login", loginUser);

authRouters.get("/logout", userAuth, logoutUser);

authRouters.get("/refresh-token", refreshToken);

export default authRouters;
