import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";
import {
  createCollection,
  getCollections,
  getUserCollections,
  updateCollection,
  deleteCollection,
  addRecitationsToCollection,
  removeRecitationFromCollection,
  addCollaborator,
  removeCollaborator,
  getFeaturedCollections,
  getCollectionById,
} from "../controllers/Collection.controller.js";

const collectionRouter = express.Router();

/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: Get all public collections with filtering and pagination
 *     tags: [Collections]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Paginated public collections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 collections:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Collection'
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 totalCollections:
 *                   type: integer
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Morning Recitations
 *               description:
 *                 type: string
 *                 example: A peaceful collection for the morning
 *               isPublic:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 default: "true"
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 */
collectionRouter.get("/", getCollections);
collectionRouter.post("/", protect, upload.single("coverImage"), createCollection);

/**
 * @swagger
 * /api/collections/featured:
 *   get:
 *     summary: Get featured public collections
 *     tags: [Collections]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Featured collections
 */
collectionRouter.get("/featured", getFeaturedCollections);

/**
 * @swagger
 * /api/collections/user/me:
 *   get:
 *     summary: Get current user's collections (created or collaborated)
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Collection'
 */
collectionRouter.get("/user/me", protect, getUserCollections);

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     summary: Get a collection by ID (private collections require auth)
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection data with recitations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 *       403:
 *         description: Collection is private
 *       404:
 *         description: Collection not found
 *   put:
 *     summary: Update a collection (creator or collaborator)
 *     tags: [Collections]
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
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: string
 *                 enum: ["true", "false"]
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Collection updated
 *       403:
 *         description: Not authorized
 *   delete:
 *     summary: Delete a collection (creator only)
 *     tags: [Collections]
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
 *         description: Collection removed
 *       403:
 *         description: Not authorized
 */
collectionRouter.get("/:id", getCollectionById);
collectionRouter.put("/:id", protect, upload.single("coverImage"), updateCollection);
collectionRouter.delete("/:id", protect, deleteCollection);

/**
 * @swagger
 * /api/collections/{id}/add-recitations:
 *   put:
 *     summary: Add recitations to a collection
 *     tags: [Collections]
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
 *         description: Recitations added to collection
 */
collectionRouter.put("/:id/add-recitations", protect, addRecitationsToCollection);

/**
 * @swagger
 * /api/collections/{id}/add-collaborator:
 *   put:
 *     summary: Add a collaborator to a collection (creator only)
 *     tags: [Collections]
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Collaborator added
 */
collectionRouter.put("/:id/add-collaborator", protect, addCollaborator);

/**
 * @swagger
 * /api/collections/{id}/remove-recitation/{recitationId}:
 *   put:
 *     summary: Remove a recitation from a collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recitationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recitation removed from collection
 */
collectionRouter.put("/:id/remove-recitation/:recitationId", protect, removeRecitationFromCollection);

/**
 * @swagger
 * /api/collections/{id}/remove-collaborator:
 *   put:
 *     summary: Remove a collaborator from a collection (creator only)
 *     tags: [Collections]
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Collaborator removed
 */
collectionRouter.put("/:id/remove-collaborator", protect, removeCollaborator);

export default collectionRouter;
