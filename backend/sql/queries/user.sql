-- name: CreateUser :one
INSERT INTO
    users (
        id,
        Name,
        Email,
        password,
        createdAt,
        updatedAt
    )
VALUES ($1, $2, $3, $4,$5,$6) rETURNING id,
    name,
    createdAt,
    updatedAt;
;

-- name: GetUser :one
SELECT id, name, email FROM users WHERE id = $1;
-- name: GetUserByEmail :one
SELECT id, password FROM users WHERE email = $1;
