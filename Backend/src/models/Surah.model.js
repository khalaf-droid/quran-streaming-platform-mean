import mongoose from "mongoose";

const surahSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Surah title is required"],
      trim: true,
    },
    titleArabic: {
      type: String,
      required: [true, "Arabic title is required"],
      trim: true,
    },
    surahNumber: {
      type: Number,
      required: [true, "Surah number is required"],
      unique: true,
    },
    revelationType: { // "Meccan" or "Medinan" بدل releasedDate
      type: String,
      required: [true, "Revelation type is required"],
      enum: ["Meccan", "Medinan"],
    },
    numberOfAyahs: { // عدد الآيات
      type: Number,
      required: [true, "Number of Ayahs is required"],
    },
    juz: { // رقم الجزء
      type: Number,
      required: [true, "Juz number is required"],
    },
    coverImage: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
    },
    recitations: [ // بدل songs
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recitation",
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Surah = mongoose.model("Surah", surahSchema);

export default Surah;
