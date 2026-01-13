const queries = {
    getAllDestinos: `
        SELECT 
            d.*,
            COALESCE(ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') AS categories
        FROM Destinations d
        LEFT JOIN DestinationCategories dc ON d.id = dc.destination_id
        LEFT JOIN Categories c ON dc.category_id = c.id
        GROUP BY d.id
        ORDER BY d.id DESC
    `,

    getDestinosPendientes: `
        SELECT * 
        FROM Destinations 
        WHERE status = 'pending'
        ORDER BY id ASC
    `,

    createDestino: `
        INSERT INTO Destinations (name, description, province, images, status, "createdBy", is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `,

    addDestinoCategory: `
        INSERT INTO DestinationCategories (destination_id, category_id)
        VALUES ($1, $2)
    `,

    approveDestino: `
        UPDATE Destinations 
        SET status = 'active'
        WHERE id = $1
    `,

    updateDestino: `
    UPDATE Destinations
    SET name = $1, description = $2, province = $3, images = $4, is_public = $5
    WHERE id = $6
    RETURNING *
`,

    deleteDestino: `
    DELETE FROM Destinations
    WHERE id = $1
    RETURNING id
`,

    getAllCategories: `
        SELECT * 
        FROM Categories
        ORDER BY name ASC
    `,

    getAllUsers: `
        SELECT id, username, email, role, puntuaciontotal, created_at
        FROM Users
        ORDER BY created_at DESC
    `,

    changeUserRole: `
        UPDATE Users
        SET role = $1
        WHERE id = $2
        RETURNING id, username, role
    `,

    updateUser: `
        UPDATE Users
        SET username = $1, email = $2
        WHERE id = $3
        RETURNING id, username, email
    `,

    getUserProfile: `
        SELECT 
            u.*,
            COALESCE(ARRAY_AGG(DISTINCT b.name) FILTER (WHERE b.name IS NOT NULL), '{}') AS badges
        FROM Users u
        LEFT JOIN UserBadges ub ON u.id = ub."userId"
        LEFT JOIN Badges b ON ub."badgeId" = b.id
        WHERE u.id = $1
        GROUP BY u.id
    `,

    deleteUser: `
        DELETE FROM Users
        WHERE id = $1
        RETURNING id
    `,

    getReviewsByTarget: `
        SELECT r.*, u.username
        FROM Reviews r
        JOIN Users u ON r."userId" = u.id
        WHERE r."targetId" = $1 AND r."targetType" = $2
        ORDER BY r.created_at DESC
    `,

    deleteReview: `
        DELETE FROM Reviews
        WHERE id = $1
        RETURNING id
    `,
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
    rejectDestino: `
        UPDATE Destinations 
        SET status = 'rejected'
        WHERE id = $1
    `
};

module.exports = { queries };
