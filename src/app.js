require('dotenv').config()
const express = require("express");
var cors = require("cors");
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); 

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
    documentation: `http://localhost:${port}/api-docs`,
    endpoints: {
      auth: '/signup, /login, /renew',
      user: '/user/*',
      admin: '/admin/*'
    }
  });
});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
  console.log(` Documentación disponible en: http://localhost:${port}/api-docs`);
  console.log(` JSON Swagger: http://localhost:${port}/api-docs.json`);
});