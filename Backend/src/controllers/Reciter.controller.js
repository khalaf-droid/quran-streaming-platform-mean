import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Reciter from "../models/Reciter.model.js";
import Surah from "../models/Surah.model.js";
import Recitation from "../models/Recitation.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

//@desc - Create a new Reciter
//@route - POST /api/reciters
//@Access - Private/Admin
export const createReciter = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Request body is required");
  }
  const { name, bio, styles } = req.body;

  if (!name || !bio || !styles) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Name, bio, and styles are required");
  }

  const existingReciter = await Reciter.findOne({ name });
  if (existingReciter) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Reciter already exists");
  }

  let imageUrl = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, "quran/reciters");
    imageUrl = result.secure_url;
  }

  const reciter = await Reciter.create({
    name,
    bio,
    styles,
    isVerified: true,
    image: imageUrl,
  });

  res.status(StatusCodes.CREATED).json(reciter);
});

//@desc - Get all reciters with filtering and pagination
//@route - GET /api/reciters
//@Access - Public
export const getReciters = asyncHandler(async (req, res) => {
  const { style, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (style) filter.styles = { $in: [style] };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  const count = await Reciter.countDocuments(filter);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reciters = await Reciter.find(filter)
    .sort({ followers: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  res.status(StatusCodes.OK).json({
    reciters,
    page: parseInt(page),
    pages: Math.ceil(count / parseInt(limit)),
    totalReciters: count,
  });
});

//@desc - Get Reciter by ID
//@route - GET /api/reciters/:id
//@Access - Public
export const getReciterById = asyncHandler(async (req, res) => {
  const reciter = await Reciter.findById(req.params.id);
  if (reciter) {
    res.status(StatusCodes.OK).json(reciter);
  } else {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Reciter not found");
  }
});

//@desc - Update Reciter Details
//@route - PUT /api/reciters/:id
//@Access - Private/Admin
export const updateReciter = asyncHandler(async (req, res) => {
  const { name, bio, styles, isVerified } = req.body;
  const reciter = await Reciter.findById(req.params.id);

  if (!reciter) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Reciter not found");
  }

  reciter.name = name || reciter.name;
  reciter.bio = bio || reciter.bio;
  reciter.styles = styles || reciter.styles;
  reciter.isVerified = isVerified !== undefined ? isVerified === "true" : reciter.isVerified;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, "quran/reciters");
    reciter.image = result.secure_url;
  }

  const updatedReciter = await reciter.save();
  res.status(StatusCodes.OK).json(updatedReciter);
});

//@desc - Delete Reciter
//@route - DELETE /api/reciters/:id
//@Access - Private/Admin
export const deleteReciter = asyncHandler(async (req, res) => {
  const reciter = await Reciter.findById(req.params.id);
  if (!reciter) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Reciter not found");
  }

  // Find all recitations of this reciter
  const recitations = await Recitation.find({ reciter: reciter._id }).select("_id");
  const recitationIds = recitations.map((r) => r._id);

  // Pull these recitation IDs from all Surahs
  if (recitationIds.length > 0) {
    await Surah.updateMany(
      { recitations: { $in: recitationIds } },
      { $pull: { recitations: { $in: recitationIds } } }
    );
  }

  // Delete all recitations by reciter
  await Recitation.deleteMany({ reciter: reciter._id });

  await reciter.deleteOne();
  res.status(StatusCodes.OK).json({ message: "Reciter removed and recitations cleaned up" });
});

//@desc - Get top reciters by followers
//@route - GET /api/reciters/top
//@Access - Public
export const getTopReciters = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const reciters = await Reciter.find()
    .sort({ followers: -1 })
    .limit(limit);
  res.status(StatusCodes.OK).json(reciters);
});

//@desc - Get Reciter's top recitations
//@route - GET /api/reciters/:id/top-recitations
//@Access - Public
export const getReciterTopRecitations = asyncHandler(async (req, res) => {
  const reciterId = req.params.id;
  const limit = parseInt(req.query.limit) || 5;

  const recitations = await Recitation.find({ reciter: reciterId })
    .sort({ plays: -1 })
    .limit(limit)
    .populate("surah", "title coverImage");

  if (recitations.length > 0) {
    res.status(StatusCodes.OK).json(recitations);
  } else {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("No recitations found for this reciter");
  }
});
