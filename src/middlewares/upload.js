const multer = require("multer");
const path = require("path");
const fs = require("fs");
//  Definir ruta ABSOLUTA para uploads
const uploadDir = path.join(__dirname, "../public/upload");

//  Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//  Configurar almacenamiento con nombres únicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Crear nombre único para evitar sobreescritura
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

//  Función para generar URL pública
const saveImage = (file) => {
  if (!file) return null;
  
  // En producción, usa la URL absoluta del backend
  const baseURL = process.env.NODE_ENV === 'production' 
    ? `https://proyecto-personal-back.onrender.com`
    : `http://localhost:${process.env.PORT || 4001}`;
    
  return `${baseURL}/upload/${file.filename}`;
}

module.exports = {
  upload,
  saveImage
};