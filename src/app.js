const express = require("express");
require('dotenv').config() 
var cors = require("cors");


const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });


const app = express()
const port = process.env.PORT||4001;
console.log(port)

//CUIDADO EN LA WHITELIST HAY QUE AÑADIR EL PUERTO QUE LLAMA DESDE EL FRONT
var whitelist = [
  "https://client-6sec.onrender.com",
  "https://server-yo1g.onrender.com", 
  `http://localhost:${port}`, 
  "http://localhost:3000",
  "http://127.0.0.1:3001",
  "http://localhost:5173"
];

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman o server-side requests
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    console.log("Origin bloqueado:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // <--- importante para cookies
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



//LISTENER
app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
