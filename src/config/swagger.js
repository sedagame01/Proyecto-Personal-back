// Asegúrate de importar la librería
const swaggerJsdoc = require('swagger-jsdoc'); 

const port = process.env.PORT || 4001;

// Definición base (Metadata + Rutas manuales)
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Destinos Turísticos - Documentación Completa',
    version: '1.0.0',
    description: 'Documentación combinada (Manual + JSDoc)'
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Servidor local'
    },
    {
      url: 'https://proyecto-personal-back.onrender.com',
      description: 'Servidor Producción'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el token: Bearer {token}'
      }
    },
    // NOTA: He movido tus schemas manuales aquí, pero ten cuidado,
    // ya que en user.route.js también defines 'Usuario' y 'Destino'.
    // Swagger intentará fusionarlos o uno sobrescribirá al otro.
    schemas: {
      UsuarioManual: { // Renombrado para evitar conflicto con el JSDoc de user.route.js
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: { type: 'string' },
          email: { type: 'string', format: 'email' },
          rol: { type: 'string', enum: ['user', 'admin', 'moderator'] }
        }
      }
    }
  },
  // Aquí pegamos tus rutas manuales (Auth, Admin, etc.)
  paths: {
    // ========== AUTH (Hardcodeado) ==========
    '/signup': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'email', 'contrasenia'],
                properties: {
                  nombre: { type: 'string', example: 'Juan Pérez' },
                  email: { type: 'string', format: 'email', example: 'juan@example.com' },
                  contrasenia: { type: 'string', format: 'password', minLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Usuario creado exitosamente' },
          '400': { description: 'Error de validación' }
        }
      }
    },
    '/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'contrasenia'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  contrasenia: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login exitoso' },
          '401': { description: 'Credenciales incorrectas' }
        }
      }
    },
    // ... (Puedes dejar aquí el resto de tus rutas Admin hardcodeadas) ...
  }
};

// Opciones para swagger-jsdoc
const options = {
  swaggerDefinition,
  // IMPORTANTE: Aquí indicamos dónde buscar los comentarios @swagger
  // Ajusta la ruta según tu estructura de carpetas real
  apis: [
    './routes/*.js',       // Si tus rutas están en la raíz/routes
    './src/routes/*.js',   // Si usas src
    './controllers/*.js'   // A veces se documenta en controladores
  ], 
};

// Generar la especificación dinámica
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;