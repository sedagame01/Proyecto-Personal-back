require('dotenv').config()
const express = require("express");
var cors = require("cors");
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); 
const path = require('path');
const fs = require('fs'); // ✅ MOVIDO ARRIBA

const app = express()
const port = process.env.PORT || 4001;

// Configuración CORS
var whitelist = [
  "https://proyecto-personal-front.onrender.com", 
  "https://proyecto-personal-back.onrender.com", 
  `http://localhost:${port}`, 
  "http://localhost:3000",
  "http://127.0.0.1:3001",
  "http://localhost:5173",
  'https://cdn.esm.sh/react-leaflet/TileLayer',
  'https://cdn.esm.sh/react-leaflet/MapContainer'
];

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    console.log("Origin bloqueado:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, 
};

app.use(cors(corsOptions));

// ✅ SERVIR ARCHIVOS ESTÁTICOS (IMÁGENES) - LINEA CORREGIDA
app.use('/upload', express.static('public/upload'));

// ✅ Headers para CORS en imágenes
app.use('/upload', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  next();
});

// MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

// RUTAS
app.use('/admin', require('./routes/admin.route'));
app.use('/user', require('./routes/user.route'));
app.use('/', require('./routes/auth.routes'));
app.use('/moderator', require('./routes/admin.route'));

// SWAGGER DOCS
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "API Destinos Turísticos - Documentación"
}));

// JSON crudo para debug
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Ruta de health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API funcionando', 
    version: '1.0.0',
    uploads: 'Disponible en /upload',
    frontend: 'https://proyecto-personal-front.onrender.com',
    documentation: `http://localhost:${port}/api-docs`,
    endpoints: {
      auth: '/signup, /login, /renew',
      user: '/user/*',
      admin: '/admin/*',
      uploads: '/upload/* (imágenes)'
    }
  });
});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ CREAR CARPETA UPLOADS - LINEA CORREGIDA
const uploadDir = path.join(process.cwd(), 'public', 'upload');
console.log("📁 Ruta ABSOLUTA en Render:", uploadDir);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Carpeta uploads creada: ${uploadDir}`);
} else {
    console.log(`✅ Carpeta ya existe: ${uploadDir}`);
}

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
  console.log(`📚 Documentación: http://localhost:${port}/api-docs`);
  console.log(`🖼️  Imágenes disponibles en: https://proyecto-personal-back.onrender.com/upload/`);
  console.log(`🌍 Frontend: https://proyecto-personal-front.onrender.com`);
});