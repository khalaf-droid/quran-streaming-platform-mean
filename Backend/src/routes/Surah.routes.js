import express from "express";
import {
  createSurah,
  getSurahs,
  getSurahById,
  updateSurah,
  deleteSurah,
  addRecitationsToSurah,
  removeRecitationFromSurah,
  getNewReleases,
} from "../controllers/Surah.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const surahRouter = express.Router();

/**
 * @swagger
 * /api/surahs:
 *   get:
 *     summary: Get all surahs with filtering and pagination
 *     tags: [Surahs]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: revelationType
 *         schema:
 *           type: string
 *           enum: [Meccan, Medinan]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or Arabic title
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
 *         description: List of surahs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 surahs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Surah'
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 totalSurahs:
 *                   type: integer
 *   post:
 *     summary: Create a new surah (Admin only)
 *     tags: [Surahs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, titleArabic, surahNumber, revelationType, numberOfAyahs, juz]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Al-Fatiha
 *               titleArabic:
 *                 type: string
 *                 example: الفاتحة
 *               surahNumber:
 *                 type: integer
 *                 example: 1
 *               revelationType:
 *                 type: string
 *                 enum: [Meccan, Medinan]
 *               numberOfAyahs:
 *                 type: integer
 *                 example: 7
 *               juz:
 *                 type: integer
 *                 example: 1
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Surah created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Surah'
 */
surahRouter.get("/", getSurahs);
surahRouter.post("/", protect, isAdmin, upload.single("coverImage"), createSurah);

/**
 * @swagger
 * /api/surahs/new-releases:
 *   get:
 *     summary: Get recently added surahs
 *     tags: [Surahs]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of newest surahs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Surah'
 */
surahRouter.get("/new-releases", getNewReleases);

/**
 * @swagger
 * /api/surahs/{id}:
 *   get:
 *     summary: Get a single surah by ID (with recitations)
 *     tags: [Surahs]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Surah data with its recitations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Surah'
 *       404:
 *         description: Surah not found
 *   put:
 *     summary: Update a surah (Admin only)
 *     tags: [Surahs]
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
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Surah updated
 *       404:
 *         description: Surah not found
 *   delete:
 *     summary: Delete a surah and its recitations (Admin only)
 *     tags: [Surahs]
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
 *         description: Surah removed
 *       404:
 *         description: Surah not found
 */
surahRouter.get("/:id", getSurahById);
surahRouter.put("/:id", protect, isAdmin, upload.single("coverImage"), updateSurah);
surahRouter.delete("/:id", protect, isAdmin, deleteSurah);

/**
 * @swagger
 * /api/surahs/{id}/add-recitations:
 *   put:
 *     summary: Add recitations to a surah (Admin only)
 *     tags: [Surahs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recitationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Recitations added to surah
 */
surahRouter.put("/:id/add-recitations", protect, isAdmin, addRecitationsToSurah);

/**
 * @swagger
 * /api/surahs/{id}/remove-recitation/{recitationId}:
 *   delete:
 *     summary: Remove a recitation from a surah (Admin only)
 *     tags: [Surahs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Surah ID
 *       - in: path
 *         name: recitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recitation ID to remove
 *     responses:
 *       200:
 *         description: Recitation removed from surah
 */
surahRouter.delete("/:id/remove-recitation/:recitationId", protect, isAdmin, removeRecitationFromSurah);

export default surahRouter;
