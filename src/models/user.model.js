import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config.js";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, "Username already exists"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.getAccessToken = function () {
  return jwt.sign({ _id: this._id }, config.JWT_SECRET, {
    expiresIn: "15m",
  });
};

UserSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, tokenVersion: this.tokenVersion },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
};

UserSchema.methods.validatePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
