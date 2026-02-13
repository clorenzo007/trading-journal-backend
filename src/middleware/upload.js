import multer from "multer";

/**
 * Multer configuration for handling file uploads.
 * 
 * - Storage: Memory (buffer).
 * - Limit: 5MB per file.
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
