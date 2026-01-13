const { Pool } = require('pg');
require('dotenv').config();

// Verificamos si estamos en producción (Render) o en local
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.CONNECTION_CHAIN,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Modifica esta lógica: si existe DATABASE_URL (estás en Render), usa SSL
    ssl: process.env.DATABASE_URL 
        ? { rejectUnauthorized: false } 
        : false
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error de conexion a DB:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};