import mongoose from "mongoose";

const reciterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Reciter name is required"],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
    },
    styles: [ // بدل genres
      {
        type: String,
      },
    ],
    followers: {
      type: Number,
      default: 0,
    },
    surahs: [ // بدل albums
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Surah",
      },
    ],
    recitations: [ // بدل songs
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recitation",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reciterSchema.index({ followers: -1 });

const Reciter = mongoose.model("Reciter", reciterSchema);

export default Reciter;
