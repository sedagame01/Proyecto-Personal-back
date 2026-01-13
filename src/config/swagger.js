// src/swagger-completo.js - TODO hardcodeado
const port = process.env.PORT || 4001;

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Destinos Turísticos - Documentación Completa',
    version: '1.0.0',
    description: 'Todas las rutas documentadas manualmente'
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Servidor local'
    }
  ],
  tags: [
    { name: 'Autenticación', description: 'Login y registro' },
    { name: 'Usuarios', description: 'Gestión de usuarios' },
    { name: 'Destinos', description: 'Destinos turísticos' },
    { name: 'Admin', description: 'Administración' }
  ],
  paths: {
    // ========== AUTH ==========
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
                  contrasenia: { type: 'string', format: 'password', minLength: 6, example: 'password123' }
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
    '/renew': {
      get: {
        tags: ['Autenticación'],
        summary: 'Renovar token JWT',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Token renovado' }
        }
      }
    },
    
    // ========== ADMIN ==========
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener todos los usuarios',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { 
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Usuario' }
                }
              }
            }
          }
        }
      }
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener usuario por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }],
        responses: {
          '200': { description: 'Usuario encontrado' }
        }
      },
      put: {
        tags: ['Admin'],
        summary: 'Actualizar usuario',
        security: [{ bearerAuth: [] }],
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Usuario actualizado' }
        }
      },
      delete: {
        tags: ['Admin'],
        summary: 'Eliminar usuario',
        security: [{ bearerAuth: [] }],
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }],
        responses: {
          '204': { description: 'Usuario eliminado' }
        }
      }
    },
    '/admin/users/role/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Cambiar rol de usuario',
        security: [{ bearerAuth: [] }],
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rol'],
                properties: {
                  rol: { type: 'string', enum: ['user', 'admin', 'moderator'] }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Rol actualizado' }
        }
      }
    },
    
    // ========== DESTINOS ADMIN ==========
    '/admin/destinations/all': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener todos los destinos',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de destinos' }
        }
      }
    },
    '/admin/destinations/pending': {
      get: {
        tags: ['Admin'],
        summary: 'Destinos pendientes',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Destinos pendientes de aprobación' }
        }
      }
    },
    '/admin/categories': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener categorías',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de categorías' }
        }
      }
    },
    
    // Agrega más rutas según necesites...
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el token: Bearer {token}'
      }
    },
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: { type: 'string' },
          email: { type: 'string', format: 'email' },
          rol: { type: 'string', enum: ['user', 'admin', 'moderator'] },
          fotoPerfil: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Destino: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: { type: 'string' },
          descripcion: { type: 'string' },
          pais: { type: 'string' },
          ciudad: { type: 'string' },
          categoria: { type: 'string' },
          estado: { type: 'string', enum: ['aprobado', 'pendiente', 'rechazado'] },
          temporada: { type: 'string', enum: ['alta', 'media', 'baja'] }
        }
      }
    }
  }
};



module.exports = swaggerSpec;