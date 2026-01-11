const authQuerys = {
    // Buscamos por email
    findOne: `SELECT * FROM Users WHERE email = $1`,
    

    anadir_usuario: `
        INSERT INTO Users (username, email, password, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, username, email, role;`
};

module.exports = authQuerys;