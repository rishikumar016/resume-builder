import express from "express";

const authRouter = express.Router();

/**
 *  @route POST /api/auth/register
 *  @desc Register a new user
 *  @access Public
 */
authRouter.post("/register", registerUser);

export default authRouter;
