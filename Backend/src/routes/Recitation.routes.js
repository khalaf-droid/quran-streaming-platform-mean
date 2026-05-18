import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";
import {
  createRecitation,
  getRecitations,
  getRecitationById,
  updateRecitation,
  deleteRecitation,
  getTopRecitations,
  getNewReleases,
} from "../controllers/Recitation.controller.js";

const recitationRouter = express.Router();

const recitationUpload = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

/**
 * @swagger
 * /api/recitations:
 *   get:
 *     summary: Get all recitations with filtering and pagination
 *     tags: [Recitations]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *         description: Filter by style (e.g. Murattal, Mujawwad)
 *       - in: query
 *         name: reciter
 *         schema:
 *           type: string
 *         description: Filter by reciter ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or style
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
 *         description: Paginated list of recitations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recitations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recitation'
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 totalRecitations:
 *                   type: integer
 *   post:
 *     summary: Upload a new recitation (Admin only)
 *     tags: [Recitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, reciterId, audio]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Surah Al-Fatiha - Murattal
 *               reciterId:
 *                 type: string
 *               surahId:
 *                 type: string
 *               duration:
 *                 type: number
 *                 example: 180
 *               style:
 *                 type: string
 *                 example: Murattal
 *               tafsir:
 *                 type: string
 *               audio:
 *                 type: string
 *                 format: binary
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Recitation uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recitation'
 */
recitationRouter.get("/", getRecitations);
recitationRouter.post("/", protect, isAdmin, recitationUpload, createRecitation);

/**
 * @swagger
 * /api/recitations/top:
 *   get:
 *     summary: Get top recitations by play count
 *     tags: [Recitations]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top recitations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recitation'
 */
recitationRouter.get("/top", getTopRecitations);

/**
 * @swagger
 * /api/recitations/new-releases:
 *   get:
 *     summary: Get recently added recitations
 *     tags: [Recitations]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Latest recitations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recitation'
 */
recitationRouter.get("/new-releases", getNewReleases);

/**
 * @swagger
 * /api/recitations/{id}:
 *   get:
 *     summary: Get a recitation by ID (also increments play count)
 *     tags: [Recitations]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recitation data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recitation'
 *       404:
 *         description: Recitation not found
 *   put:
 *     summary: Update a recitation (Admin only)
 *     tags: [Recitations]
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
 *               title:
 *                 type: string
 *               style:
 *                 type: string
 *               tafsir:
 *                 type: string
 *               audio:
 *                 type: string
 *                 format: binary
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Recitation updated
 *       404:
 *         description: Recitation not found
 *   delete:
 *     summary: Delete a recitation (Admin only)
 *     tags: [Recitations]
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
 *         description: Recitation removed
 *       404:
 *         description: Recitation not found
 */
recitationRouter.get("/:id", getRecitationById);
recitationRouter.put("/:id", protect, isAdmin, recitationUpload, updateRecitation);
recitationRouter.delete("/:id", protect, isAdmin, deleteRecitation);

export default recitationRouter;
