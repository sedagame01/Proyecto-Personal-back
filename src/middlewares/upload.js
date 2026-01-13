const multer = require("multer");
const fs = require("node:fs");

// Configuración simple: subidas a /public/upload
const upload = multer({ dest: "src/public/upload" });

// Función para renombrar la imagen a su nombre original
const saveImage = (file) => {
    const newPath = `src/public/upload/${file.originalname}`;
    fs.renameSync(file.path, newPath);
    const publicURL = `${process.env.URL_BASE}/upload/${file.originalname}`;
    return publicURL;
}

module.exports = {
    upload,
    saveImage
};
