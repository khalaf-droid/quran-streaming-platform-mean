import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Reciter from "../models/Reciter.model.js";
import Recitation from "../models/Recitation.model.js";
import Collection from "../models/Collection.model.js";
import User from "../models/User.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

//@desc - Create a new collection
//@route - POST /api/collections
//@Access - Private
export const createCollection = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;

  if (!name || !description) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Name and description are required");
  }

  const existingCollection = await Collection.findOne({
    name,
    creator: req.user._id,
  });

  if (existingCollection) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("A collection with this name already exists");
  }

  let coverImageUrl = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, "quran/collections");
    coverImageUrl = result.secure_url;
  }

  const collection = await Collection.create({
    name,
    description,
    creator: req.user._id,
    coverImage: coverImageUrl || undefined,
    isPublic: isPublic === "true",
  });

  res.status(StatusCodes.CREATED).json(collection);
});

//@desc - Get all collections with filtering and pagination
//@route - GET /api/collections
//@Access - Public
export const getCollections = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const filter = { isPublic: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const count = await Collection.countDocuments(filter);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const collections = await Collection.find(filter)
    .sort({ followers: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .populate("creator", "name profilePicture")
    .populate("collaborators", "name profilePicture");

  res.status(StatusCodes.OK).json({
    collections,
    page: parseInt(page),
    pages: Math.ceil(count / parseInt(limit)),
    totalCollections: count,
  });
});

//@desc - Get user's collections
//@route - GET /api/collections/user/me
//@Access - Private
export const getUserCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({
    $or: [{ creator: req.user._id }, { collaborators: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .populate("creator", "name profilePicture");

  res.status(StatusCodes.OK).json(collections);
});

//@desc - Get collection by ID
//@route - GET /api/collections/:id
//@Access - Private/Public
export const getCollectionById = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id)
    .populate("creator", "name profilePicture")
    .populate("collaborators", "name profilePicture")
    .populate({
      path: "recitations",
      populate: { path: "reciter", select: "name" },
    });

  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  if (
    !collection.isPublic &&
    !(
      req.user &&
      (collection.creator.equals(req.user._id) ||
        collection.collaborators.some((collab) => collab.equals(req.user._id)))
    )
  ) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("This collection is private");
  }

  res.status(StatusCodes.OK).json(collection);
});

//@desc - Update collection
//@route - PUT /api/collections/:id
//@Access - Private
export const updateCollection = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  if (
    !collection.creator.equals(req.user._id) &&
    !collection.collaborators.some((collab) => collab.equals(req.user._id))
  ) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Not authorized to update this collection");
  }

  collection.name = name || collection.name;
  collection.description = description || collection.description;

  if (collection.creator.equals(req.user._id)) {
    collection.isPublic = isPublic !== undefined ? isPublic === "true" : collection.isPublic;
  }

  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, "quran/collections");
    collection.coverImage = result.secure_url;
  }

  const updatedCollection = await collection.save();
  res.status(StatusCodes.OK).json(updatedCollection);
});

//@desc - Delete collection
//@route - DELETE /api/collections/:id
//@Access - Private
export const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  if (!collection.creator.equals(req.user._id)) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Not authorized to delete this collection");
  }

  await collection.deleteOne();
  res.status(StatusCodes.OK).json({ message: "Collection removed" });
});

//@desc - Add recitations to collection
//@route - PUT /api/collections/:id/add-recitations
//@Access - Private
export const addRecitationsToCollection = asyncHandler(async (req, res) => {
  const { recitationIds } = req.body;

  if (!recitationIds || !Array.isArray(recitationIds)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Recitation IDs are required");
  }

  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  if (
    !collection.creator.equals(req.user._id) &&
    !collection.collaborators.some((collab) => collab.equals(req.user._id))
  ) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Not authorized to modify this collection");
  }

  for (const rid of recitationIds) {
    const recitation = await Recitation.findById(rid);
    if (recitation && !collection.recitations.includes(rid)) {
      collection.recitations.push(rid);
    }
  }

  await collection.save();
  res.status(StatusCodes.OK).json(collection);
});

//@desc - Remove recitation from collection
//@route - PUT /api/collections/:id/remove-recitation/:recitationId
//@Access - Private
export const removeRecitationFromCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  if (
    !collection.creator.equals(req.user._id) &&
    !collection.collaborators.some((collab) => collab.equals(req.user._id))
  ) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Not authorized to modify this collection");
  }

  const { recitationId } = req.params;
  collection.recitations = collection.recitations.filter(
    (id) => id.toString() !== recitationId
  );

  await collection.save();
  res.status(StatusCodes.OK).json({ message: "Recitation removed from collection" });
});

//@desc - Add collaborator to collection
//@route - PUT /api/collections/:id/add-collaborator
//@Access - Private
export const addCollaborator = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("User not found");
  }

  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  if (!collection.creator.equals(req.user._id)) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Only the collection creator can add collaborators");
  }

  if (collection.collaborators.includes(userId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("User is already a collaborator");
  }

  collection.collaborators.push(userId);
  await collection.save();

  res.status(StatusCodes.OK).json(collection);
});

//@desc - Remove collaborator from collection
//@route - PUT /api/collections/:id/remove-collaborator
//@Access - Private
export const removeCollaborator = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  if (!collection.creator.equals(req.user._id)) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Only the collection creator can remove collaborators");
  }

  collection.collaborators = collection.collaborators.filter(
    (id) => id.toString() !== userId
  );

  await collection.save();
  res.status(StatusCodes.OK).json(collection);
});

//@desc - Get featured collections
//@route - GET /api/collections/featured
//@Access - Public
export const getFeaturedCollections = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const collections = await Collection.find({ isPublic: true })
    .limit(limit)
    .sort({ followers: -1 })
    .populate("creator", "name profilePicture");

  res.status(StatusCodes.OK).json(collections);
});
