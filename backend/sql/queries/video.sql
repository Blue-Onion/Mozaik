-- name: CreateVideo :one
INSERT INTO videos (id, userId, manimCode, createdAt, updatedAt)
VALUES ($1, $2, $3, NOW(), NOW())
RETURNING *;

-- name: GetVideo :one
SELECT * FROM videos
WHERE id = $1 AND userId = $2;

-- name: GetAllVideos :many
SELECT * FROM videos
WHERE userId = $1;
