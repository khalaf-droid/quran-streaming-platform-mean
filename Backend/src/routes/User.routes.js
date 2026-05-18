import express from "express";
import { body, validationResult } from "express-validator";
import { authLimiter, apiLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleFavoriteRecitation,
  toggleFollowReciter,
  toggleFollowCollection,
} from "../controllers/User.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const userRouter = express.Router();

// Validation Middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
  };
};

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth & Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
userRouter.post(
  "/register", 
  authLimiter,
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
  ]),
  registerUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth & Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
userRouter.post(
  "/login",
  authLimiter,
  validate([
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ]),
  loginUser
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth & Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth & Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.get("/profile", protect, getUserProfile);
userRouter.put(
  "/profile", 
  protect, 
  apiLimiter,
  upload.single("profilePicture"),
  validate([
    body("email").optional().isEmail().normalizeEmail(),
    body("password").optional().isLength({ min: 6 })
  ]),
  updateUserProfile
);

/**
 * @swagger
 * /api/users/favorite-recitation/{id}:
 *   put:
 *     summary: Toggle favorite recitation (add or remove)
 *     tags: [Auth & Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recitation ID to toggle
 *     responses:
 *       200:
 *         description: Favorite status toggled
 *       404:
 *         description: Recitation not found
 */
userRouter.put("/favorite-recitation/:id", protect, apiLimiter, toggleFavoriteRecitation);

/**
 * @swagger
 * /api/users/follow-reciter/{id}:
 *   put:
 *     summary: Toggle follow reciter (follow or unfollow)
 *     tags: [Auth & Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reciter ID to toggle
 *     responses:
 *       200:
 *         description: Follow status toggled
 *       404:
 *         description: Reciter not found
 */
userRouter.put("/follow-reciter/:id", protect, apiLimiter, toggleFollowReciter);

/**
 * @swagger
 * /api/users/follow-collection/{id}:
 *   put:
 *     summary: Toggle follow collection (follow or unfollow)
 *     tags: [Auth & Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID to toggle
 *     responses:
 *       200:
 *         description: Follow status toggled
 *       404:
 *         description: Collection not found
 */
userRouter.put("/follow-collection/:id", protect, apiLimiter, toggleFollowCollection);

export default userRouter;
