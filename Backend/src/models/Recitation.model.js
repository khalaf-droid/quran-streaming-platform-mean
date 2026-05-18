import mongoose from "mongoose";

const recitationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recitation title is required"],
      trim: true,
    },
    reciter: { // بدل artist
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reciter",
      required: [true, "Reciter is required"],
    },
    surah: { // بدل album
      type: mongoose.Schema.Types.ObjectId,
      ref: "Surah",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
    },
    coverImage: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
    },
    style: { // بدل genre
      type: String,
      trim: true,
    },
    tafsir: { // بدل lyrics
      type: String,
      trim: true,
    },
    plays: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    featuredReciters: [ // بدل featuredArtists
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reciter",
      },
    ],
  },
  { timestamps: true }
);

// Format the duration (mm:ss)
recitationSchema.virtual("formattedDuration").get(function () {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});

// Configure schema to include virtuals when converted to JSON
recitationSchema.set("toJSON", { virtuals: true });
recitationSchema.set("toObject", { virtuals: true });

recitationSchema.index({ likes: -1 });
recitationSchema.index({ createdAt: -1 });

const Recitation = mongoose.model("Recitation", recitationSchema);

export default Recitation;
