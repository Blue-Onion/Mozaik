# Docker Setup for Mozaik

## Prerequisites

- Docker
- Docker Compose

## Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your configuration:**
   - Set your `GOOGLE_AI_API_KEY` or `GEMINI_API_KEY`
   - Update `JWT_SECRET` with a secure random string
   - Adjust database credentials if needed

3. **Build and start containers:**
   ```bash
   docker-compose up -d --build
   ```

4. **Run database migrations:**
   ```bash
   docker exec mozaik-backend npx prisma migrate deploy
   ```

## Services

- **backend**: Node.js API server (port 3001)
- **manim**: Manim execution container (runs on-demand)
- **db**: PostgreSQL database (port 5432)

## API Endpoints

### Generate Video
```
POST /api/video/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "from manim import *\nclass MyScene(Scene):\n    def construct(self):\n        ...",
  "promptId": "optional-uuid",
  "projectId": "optional-uuid"
}
```

### Get Video
```
GET /api/video/:id
Authorization: Bearer <token>
```

## Stopping Services

```bash
docker-compose down
```

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f manim
```

## Troubleshooting

1. **Manim container not found:**
   - Ensure the manim container is running: `docker ps`
   - Start it: `docker-compose up -d manim`

2. **Video generation fails:**
   - Check Manim container logs: `docker-compose logs manim`
   - Verify code syntax is correct
   - Check disk space for video output

3. **Database connection issues:**
   - Ensure database is running: `docker-compose ps db`
   - Check DATABASE_URL in .env matches docker-compose settings

