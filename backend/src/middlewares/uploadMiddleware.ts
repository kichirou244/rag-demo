import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const filename = file.originalname.toLowerCase();
    const isSupported =
      filename.endsWith(".txt") ||
      filename.endsWith(".md") ||
      filename.endsWith(".markdown");

    if (isSupported) {
      callback(null, true);
    } else {
      callback(new Error("Unsupported file type. Only .txt and .md files are supported"));
    }
  },
});
