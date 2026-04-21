-- name: CreateUser :one
INSERT INTO
    users (
        id,
        Salary,
        role,
        password,
        createdAt,
        updatedAt
    )
VALUES ($1, $2, $3, $4, $5,$6) RETURNING id,
    name,
    createdAt,
    updatedAt;
;

-- name: GetUser :one
SELECT id, name, email FROM users WHERE id = $1;
-- name: GetUserByEmail :one
SELECT id, password FROM users WHERE email = $1;