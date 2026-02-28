import multer from "multer";
import fs from "node:fs";

export const multer_local = ({
  custom_path = "General",
  custom_types = [],
} = {}) => {
  const fullPath = `uploads/${custom_path}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      console.log(file);

      cb(null, uniqueSuffix + "_" + file.originalname);
    },
  });

  function fileFilter(req, file, cb) {
    if (!custom_types.includes(file.mimetype)) {
      cb(new Error("invalid file type"));
    }
    cb(null, true);
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};
