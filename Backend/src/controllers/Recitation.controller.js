import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Reciter from "../models/Reciter.model.js";
import Surah from "../models/Surah.model.js";
import Recitation from "../models/Recitation.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

//@desc - Create a new recitation
//@route - POST /api/recitations
//@Access - Private/Admin
export const createRecitation = asyncHandler(async (req, res) => {
  const {
    title,
    reciterId,
    surahId,
    duration,
    style,
    tafsir,
    featuredReciters,
  } = req.body;

  const reciter = await Reciter.findById(reciterId);
  if (!reciter) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Reciter not found");
  }

  if (surahId) {
    const surah = await Surah.findById(surahId);
    if (!surah) {
      res.status(StatusCodes.NOT_FOUND);
      throw new Error("Surah not found");
    }
  }

  if (!req.files || !req.files.audio) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Audio file is required");
  }

  const audioResult = await uploadToCloudinary(
    req.files.audio[0].path,
    "quran/recitations"
  );

  let coverImageUrl = "";
  if (req.files && req.files.cover) {
    const imageResult = await uploadToCloudinary(
      req.files.cover[0].path,
      "quran/covers"
    );
    coverImageUrl = imageResult.secure_url;
  }

  const recitation = await Recitation.create({
    title,
    reciter: reciterId,
    surah: surahId || null,
    duration,
    audioUrl: audioResult.secure_url,
    style,
    tafsir,
    featuredReciters: featuredReciters ? JSON.parse(featuredReciters) : [],
    coverImage: coverImageUrl || undefined,
  });

  // Add recitation to reciter's recitations
  reciter.recitations.push(recitation._id);
  await reciter.save();

  // Add recitation to surah if provided
  if (surahId) {
    const surah = await Surah.findById(surahId);
    surah.recitations.push(recitation._id);
    await surah.save();
  }

  res.status(StatusCodes.CREATED).json(recitation);
});

//@desc - Get all recitations with filtering and pagination
//@route - GET /api/recitations
//@Access - Public
export const getRecitations = asyncHandler(async (req, res) => {
  const { style, reciter, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (style) filter.style = style;
  if (reciter) filter.reciter = reciter;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { style: { $regex: search, $options: "i" } },
    ];
  }

  const count = await Recitation.countDocuments(filter);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const recitations = await Recitation.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .populate("reciter", "name image")
    .populate("surah", "title coverImage")
    .populate("featuredReciters", "name");

  res.status(StatusCodes.OK).json({
    recitations,
    page: parseInt(page),
    pages: Math.ceil(count / parseInt(limit)),
    totalRecitations: count,
  });
});

//@desc - Get a recitation by ID
//@route - GET /api/recitations/:id
//@Access - Public
export const getRecitationById = asyncHandler(async (req, res) => {
  const recitation = await Recitation.findById(req.params.id)
    .populate("reciter", "name image bio")
    .populate("surah", "title coverImage revelationType")
    .populate("featuredReciters", "name image");

  if (recitation) {
    recitation.plays += 1;
    await recitation.save();
    res.status(StatusCodes.OK).json(recitation);
  } else {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Recitation not found");
  }
});

//@desc - Update recitation Details
//@route - PUT /api/recitations/:id
//@Access - Private/Admin
export const updateRecitation = asyncHandler(async (req, res) => {
  const {
    title,
    reciterId,
    surahId,
    duration,
    style,
    tafsir,
    featuredReciters,
  } = req.body;

  const recitation = await Recitation.findById(req.params.id);
  if (!recitation) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Recitation not found");
  }

  recitation.title = title || recitation.title;
  recitation.surah = surahId || recitation.surah;
  recitation.style = style || recitation.style;
  recitation.tafsir = tafsir || recitation.tafsir;
  recitation.reciter = reciterId || recitation.reciter;
  recitation.duration = duration || recitation.duration;
  recitation.featuredReciters = featuredReciters
    ? JSON.parse(featuredReciters)
    : recitation.featuredReciters;

  if (req.files && req.files.cover) {
    const imageResult = await uploadToCloudinary(
      req.files.cover[0].path,
      "quran/covers"
    );
    recitation.coverImage = imageResult.secure_url;
  }

  if (req.files && req.files.audio) {
    const audioResult = await uploadToCloudinary(
      req.files.audio[0].path,
      "quran/recitations"
    );
    recitation.audioUrl = audioResult.secure_url;
  }

  const updatedRecitation = await recitation.save();
  res.status(StatusCodes.OK).json(updatedRecitation);
});

//@desc - Delete Recitation
//@route - DELETE /api/recitations/:id
//@Access - Private/Admin
export const deleteRecitation = asyncHandler(async (req, res) => {
  const recitation = await Recitation.findById(req.params.id);
  if (!recitation) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Recitation not found");
  }

  // Remove recitation from reciter's list
  await Reciter.updateOne({ _id: recitation.reciter }, { $pull: { recitations: recitation._id } });

  // Remove recitation from surah's list if it belongs to one
  if (recitation.surah) {
    await Surah.updateOne({ _id: recitation.surah }, { $pull: { recitations: recitation._id } });
  }

  await recitation.deleteOne();
  res.status(StatusCodes.OK).json({ message: "Recitation removed" });
});

//@desc - Get Top recitations by plays
//@route - GET /api/recitations/top
//@Access - Public
export const getTopRecitations = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const recitations = await Recitation.find()
    .sort({ plays: -1 })
    .limit(limit)
    .populate("reciter", "name image")
    .populate("surah", "title coverImage");
  res.status(StatusCodes.OK).json(recitations);
});

//@desc - Get new releases (recently added recitations)
//@route - GET /api/recitations/new-releases
//@Access - Public
export const getNewReleases = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const recitations = await Recitation.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("reciter", "name image")
    .populate("surah", "title coverImage");
  res.status(StatusCodes.OK).json(recitations);
});
