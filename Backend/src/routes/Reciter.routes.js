import express from "express";
import {
  createReciter,
  getReciters,
  getReciterById,
  updateReciter,
  deleteReciter,
  getTopReciters,
  getReciterTopRecitations,
} from "../controllers/Reciter.controller.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const reciterRouter = express.Router();

/**
 * @swagger
 * /api/reciters:
 *   get:
 *     summary: Get all reciters with filtering and pagination
 *     tags: [Reciters]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *         description: Filter by recitation style (e.g. Murattal, Mujawwad)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or bio
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of reciters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reciters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reciter'
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 totalReciters:
 *                   type: integer
 *   post:
 *     summary: Create a new reciter (Admin only)
 *     tags: [Reciters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, bio, styles]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mishary Rashid Al-Afasy
 *               bio:
 *                 type: string
 *                 example: Famous Kuwaiti Quran reciter
 *               styles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Murattal", "Mujawwad"]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Reciter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reciter'
 *       400:
 *         description: Missing required fields or reciter already exists
 */
reciterRouter.get("/", getReciters);
reciterRouter.post("/", protect, isAdmin, upload.single("image"), createReciter);

/**
 * @swagger
 * /api/reciters/top:
 *   get:
 *     summary: Get top reciters by follower count
 *     tags: [Reciters]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of top reciters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reciter'
 */
reciterRouter.get("/top", getTopReciters);

/**
 * @swagger
 * /api/reciters/{id}/top-recitations:
 *   get:
 *     summary: Get a reciter's top recitations by play count
 *     tags: [Reciters]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reciter ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of top recitations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recitation'
 *       404:
 *         description: No recitations found
 */
reciterRouter.get("/:id/top-recitations", getReciterTopRecitations);

/**
 * @swagger
 * /api/reciters/{id}:
 *   get:
 *     summary: Get a single reciter by ID
 *     tags: [Reciters]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reciter data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reciter'
 *       404:
 *         description: Reciter not found
 *   put:
 *     summary: Update a reciter (Admin only)
 *     tags: [Reciters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               styles:
 *                 type: array
 *                 items:
 *                   type: string
 *               isVerified:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Reciter updated successfully
 *       404:
 *         description: Reciter not found
 *   delete:
 *     summary: Delete a reciter and all their recitations (Admin only)
 *     tags: [Reciters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reciter removed
 *       404:
 *         description: Reciter not found
 */
reciterRouter.get("/:id", getReciterById);
reciterRouter.put("/:id", protect, isAdmin, upload.single("image"), updateReciter);
reciterRouter.delete("/:id", protect, isAdmin, deleteReciter);

export default reciterRouter;
