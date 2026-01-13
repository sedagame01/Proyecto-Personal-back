const userQuerys = {
    buscarDestinos: `
        SELECT 
            d.*,
            COALESCE(ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') AS categories
        FROM Destinations d
        LEFT JOIN DestinationCategories dc ON d.id = dc.destination_id
        LEFT JOIN Categories c ON dc.category_id = c.id
        WHERE (
            LOWER(d.name) LIKE '%' || LOWER($1) || '%' OR
            LOWER(d.province) LIKE '%' || LOWER($1) || '%'
        )
        AND d.status = 'active'
        GROUP BY d.id
    `,

    crearReview: `
        INSERT INTO Reviews ("userId", "targetId", "targetType", comment, stars)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `,

    sugerirDestino: `
        INSERT INTO Destinations (name, description, province, images, status, createdby, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `,

    actualizarPerfil: `
        UPDATE Users
        SET username = $1, email = $2
        WHERE id = $3
        RETURNING id, username, email
    `,

    obtenerMisDestinos: `
        SELECT *
        FROM Destinations
        WHERE createdby = $1
        ORDER BY id DESC
    `,

    obtenerMisReviews: `
        SELECT r.*, d.name AS destino_nombre
        FROM Reviews r
        LEFT JOIN Destinations d ON r."targetId" = d.id
        WHERE r."userId" = $1
        AND r."targetType" = 'destination'
        ORDER BY r.created_at DESC
    `,
    
    buscarUsuarios: `
        SELECT id, username, email, role, puntuaciontotal 
        FROM Users 
        WHERE LOWER(username) LIKE '%' || LOWER($1) || '%'
    `,

    // CORREGIDO: Usamos LEFT JOIN para evitar errores si el usuario no existe
    obtenerDestinoPorId: `
        SELECT d.*, u.username as autor 
        FROM Destinations d
        LEFT JOIN Users u ON d.createdby = u.id
        WHERE d.id = $1
    `,

    obtenerReviewsDestino: `
        SELECT r.*, u.username 
        FROM Reviews r
        JOIN Users u ON r."userId" = u.id
        WHERE r."targetId" = $1 AND r."targetType" = 'destination'
        ORDER BY r.created_at DESC
    `,
    updateDestino: `
    UPDATE Destinations
    SET name = $1, description = $2, province = $3, images = $4, is_public = $5
    WHERE id = $6
    RETURNING *
`,
getAllDestinos: `
        SELECT * FROM Destinations 
        WHERE status = 'active'
        ORDER BY id DESC
    `,
};

module.exports = { userQuerys };