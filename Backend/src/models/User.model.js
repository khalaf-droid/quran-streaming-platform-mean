import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    profilePicture: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favoriteRecitations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recitation",
      },
    ],
    favoriteSurahs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Surah",
      },
    ],
    followedReciters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reciter",
      },
    ],
    followedCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },
  { timestamps: true }
);

// Method to compare password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash password if it's modified
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
