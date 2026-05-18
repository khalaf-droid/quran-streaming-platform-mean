import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Reciter from "../models/Reciter.model.js";
import Surah from "../models/Surah.model.js";
import Recitation from "../models/Recitation.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

//@desc - Create a new Surah
//@route - POST /api/surahs
//@Access - Private/Admin
export const createSurah = asyncHandler(async (req, res) => {
  const { title, titleArabic, surahNumber, revelationType, numberOfAyahs, juz, description } = req.body;

  if (!title || !titleArabic || !surahNumber || !revelationType || !numberOfAyahs || !juz) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Title, titleArabic, surahNumber, revelationType, numberOfAyahs, and juz are required");
  }

  // Check if surah already exists by number
  const surahExists = await Surah.findOne({ surahNumber });
  if (surahExists) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Surah with this number already exists");
  }

  let coverImageUrl = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, "quran/surahs");
    coverImageUrl = result.secure_url;
  }

  const surah = await Surah.create({
    title,
    titleArabic,
    surahNumber,
    revelationType,
    numberOfAyahs,
    juz,
    description,
    coverImage: coverImageUrl || undefined,
  });

  res.status(StatusCodes.CREATED).json(surah);
});

//@desc - Get all Surahs with filtering and pagination
//@route - GET /api/surahs
//@Access - Public
export const getSurahs = asyncHandler(async (req, res) => {
  const { revelationType, reciter, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (revelationType) filter.revelationType = revelationType;
  
  if (reciter) {
    const recitations = await Recitation.find({ reciter }).select("surah");
    const surahIds = recitations.map((r) => r.surah).filter(Boolean);
    filter._id = { $in: surahIds };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { titleArabic: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const count = await Surah.countDocuments(filter);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const surahs = await Surah.find(filter)
    .sort({ surahNumber: 1 })
    .limit(parseInt(limit))
    .skip(skip);

  res.status(StatusCodes.OK).json({
    surahs,
    page: parseInt(page),
    pages: Math.ceil(count / parseInt(limit)),
    totalSurahs: count,
  });
});

//@desc - Get surah by ID
//@route - GET /api/surahs/:id
//@Access - Public
export const getSurahById = asyncHandler(async (req, res) => {
  const surah = await Surah.findById(req.params.id)
    .populate({
      path: "recitations",
      select: "title duration audioUrl style",
      populate: {
        path: "reciter",
        select: "name image",
      },
    });

  if (surah) {
    res.status(StatusCodes.OK).json(surah);
  } else {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Surah not found");
  }
});

//@desc - Update surah details
//@route - PUT /api/surahs/:id
//@Access - Private/Admin
export const updateSurah = asyncHandler(async (req, res) => {
  const { title, titleArabic, surahNumber, revelationType, numberOfAyahs, juz, description } = req.body;
  const surah = await Surah.findById(req.params.id);

  if (!surah) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Surah not found");
  }

  surah.title = title || surah.title;
  surah.titleArabic = titleArabic || surah.titleArabic;
  surah.surahNumber = surahNumber || surah.surahNumber;
  surah.revelationType = revelationType || surah.revelationType;
  surah.numberOfAyahs = numberOfAyahs || surah.numberOfAyahs;
  surah.juz = juz || surah.juz;
  surah.description = description || surah.description;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, "quran/surahs");
    surah.coverImage = result.secure_url;
  }

  const updatedSurah = await surah.save();
  res.status(StatusCodes.OK).json(updatedSurah);
});

//@desc - Delete Surah
//@route - DELETE /api/surahs/:id
//@Access - Private/Admin
export const deleteSurah = asyncHandler(async (req, res) => {
  const surah = await Surah.findById(req.params.id);
  if (!surah) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Surah not found");
  }

  // Remove surah reference from all reciters' surahs list
  await Reciter.updateMany(
    { surahs: surah._id },
    { $pull: { surahs: surah._id } }
  );

  // Update recitations to remove surah reference
  await Recitation.updateMany({ surah: surah._id }, { $unset: { surah: 1 } });

  await surah.deleteOne();
  res.status(StatusCodes.OK).json({ message: "Surah removed" });
});

//@desc - Add Recitations to Surah
//@route - PUT /api/surahs/:id/add-recitations
//@Access - Private/Admin
export const addRecitationsToSurah = asyncHandler(async (req, res) => {
  const { recitationIds } = req.body;
  const surah = await Surah.findById(req.params.id);

  if (!surah) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Surah not found");
  }

  // Add recitations to surah (avoid duplicates)
  recitationIds.forEach((id) => {
    if (!surah.recitations.includes(id)) {
      surah.recitations.push(id);
    }
  });

  await surah.save();
  res.status(StatusCodes.OK).json(surah);
});

//@desc - Remove Recitation from Surah
//@route - PUT /api/surahs/:id/remove-recitation/:recitationId
//@Access - Private/Admin
export const removeRecitationFromSurah = asyncHandler(async (req, res) => {
  const { id, recitationId } = req.params;
  const surah = await Surah.findById(id);

  if (!surah) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Surah not found");
  }

  surah.recitations = surah.recitations.filter(
    (rid) => rid.toString() !== recitationId
  );

  await surah.save();
  res.status(StatusCodes.OK).json({ message: "Recitation removed from surah" });
});

//@desc - Get new releases (recently added surahs)
//@route - GET /api/surahs/new-releases
//@Access - Public
export const getNewReleases = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const surahs = await Surah.find({})
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(StatusCodes.OK).json(surahs);
});
