const express = require("express");
require('dotenv').config() 
var cors = require("cors");


const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });


const app = express()
const port = process.env.PORT||4001;
console.log(port)

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


/* app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
 */
//TEMPLATES

//MIDDLEWARE
app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'))

//RUTAS
app.use('/admin', require('./routes/admin.route'));
app.use('/user',require('./routes/user.route'));
app.use('/',require('./routes/auth.routes'));
app.use('/moderator', require('./routes/admin.route'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


//LISTENER
app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
