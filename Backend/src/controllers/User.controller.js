import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import Recitation from "../models/Recitation.model.js";
import Reciter from "../models/Reciter.model.js";
import Collection from "../models/Collection.model.js";

//@desc - Register a new user
//@route - POST /api/users/register
//@Access - Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(StatusCodes.CREATED).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Invalid user data");
  }
});

//@desc - Login user
//@route - POST /api/users/login
//@Access - Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(StatusCodes.OK).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Invalid email or password");
  }
});

//@desc - Get user profile
//@route - GET /api/users/profile
//@Access - Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("favoriteRecitations", "title duration audioUrl")
    .populate("favoriteSurahs", "title revelationType coverImage")
    .populate("followedReciters", "name image")
    .populate("followedCollections", "name creator coverImage");

  if (user) {
    res.status(StatusCodes.OK).json(user);
  } else {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc - Update user profile
//@route - PUT /api/users/profile
//@Access - Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      if (!req.body.oldPassword) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Old password is required to set a new password");
      }
      
      const isMatch = await user.matchPassword(req.body.oldPassword);
      if (!isMatch) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("Incorrect old password");
      }
      
      user.password = req.body.password;
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "quran/users");
      user.profilePicture = result.secure_url;
    }

    const updatedUser = await user.save();

    res.status(StatusCodes.OK).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc - Favorite/unfavorite a recitation
//@route - PUT /api/users/favorite-recitation/:id
//@Access - Private
export const toggleFavoriteRecitation = asyncHandler(async (req, res) => {
  const recitationId = req.params.id;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("User not found");
  }

  const recitation = await Recitation.findById(recitationId);
  if (!recitation) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Recitation not found");
  }

  const recitationIndex = user.favoriteRecitations.indexOf(recitationId);

  if (recitationIndex === -1) {
    user.favoriteRecitations.push(recitationId);
    await Recitation.findByIdAndUpdate(recitationId, { $inc: { likes: 1 } });
  } else {
    user.favoriteRecitations.splice(recitationIndex, 1);
    // Ensure likes don't go below 0
    await Recitation.findByIdAndUpdate(recitationId, { $max: { likes: 0 }, $inc: { likes: -1 } });
  }

  await user.save();

  res.status(StatusCodes.OK).json({
    favoriteRecitations: user.favoriteRecitations,
    message: recitationIndex === -1 ? "Recitation added to favorites" : "Recitation removed from favorites",
  });
});

//@desc - Follow/unfollow a reciter
//@route - PUT /api/users/follow-reciter/:id
//@Access - Private
export const toggleFollowReciter = asyncHandler(async (req, res) => {
  const reciterId = req.params.id;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("User not found");
  }

  const reciter = await Reciter.findById(reciterId);
  if (!reciter) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Reciter not found");
  }

  const reciterIndex = user.followedReciters.indexOf(reciterId);

  if (reciterIndex === -1) {
    user.followedReciters.push(reciterId);
    await Reciter.findByIdAndUpdate(reciterId, { $inc: { followers: 1 } });
  } else {
    user.followedReciters.splice(reciterIndex, 1);
    await Reciter.findByIdAndUpdate(reciterId, { $max: { followers: 0 }, $inc: { followers: -1 } });
  }

  await user.save();

  res.status(StatusCodes.OK).json({
    followedReciters: user.followedReciters,
    message: reciterIndex === -1 ? "Reciter followed" : "Reciter unfollowed",
  });
});

//@desc - Follow/unfollow a collection
//@route - PUT /api/users/follow-collection/:id
//@Access - Private
export const toggleFollowCollection = asyncHandler(async (req, res) => {
  const collectionId = req.params.id;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("User not found");
  }

  const collection = await Collection.findById(collectionId);
  if (!collection) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Collection not found");
  }

  const collectionIndex = user.followedCollections.indexOf(collectionId);

  if (collectionIndex === -1) {
    user.followedCollections.push(collectionId);
    await Collection.findByIdAndUpdate(collectionId, { $inc: { followers: 1 } });
  } else {
    user.followedCollections.splice(collectionIndex, 1);
    await Collection.findByIdAndUpdate(collectionId, { $max: { followers: 0 }, $inc: { followers: -1 } });
  }

  await user.save();

  res.status(StatusCodes.OK).json({
    followedCollections: user.followedCollections,
    message: collectionIndex === -1 ? "Collection followed" : "Collection unfollowed",
  });
});

//@desc - Get all users (Admin only)
//@route - GET /api/users
//@Access - Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(StatusCodes.OK).json(users);
});
