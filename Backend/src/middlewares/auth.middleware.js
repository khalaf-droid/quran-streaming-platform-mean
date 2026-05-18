import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import { StatusCodes } from "http-status-codes";

// Middleware to protect routes - verify JWT token and set req.user
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get the token from the header
      token = req.headers.authorization.split(" ")[1];

      // verify token
      const decoded = jwt.verify(token, process.env.JWT);

      // Set req.user to the user found in the token
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.UNAUTHORIZED);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Not authorized, no token found");
  }
});

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Not authorized as an admin");
  }
};
