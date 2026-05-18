import multer from "multer";
import path from "path";

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter - only allow audio and image files
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format. Only audio or image files are allowed!"), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Max file size
  fileFilter,
});

export default upload;
