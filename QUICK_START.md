# Quick Start Guide

## Prerequisites

1. **Install Docker Desktop for Mac**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop
   - Make sure Docker is running (check the Docker icon in your menu bar)

2. **Create `.env` file**
   ```bash
   cd /Users/adityasinghrawat/Desktop/project/Mozaik
   cp .env.example .env
   ```

3. **Edit `.env` file** with your configuration:
   ```bash
   # Required
   GOOGLE_AI_API_KEY=your-api-key-here
   JWT_SECRET=your-random-secret-key-here
   
   # Database (defaults work for docker-compose)
   DATABASE_URL=postgresql://postgres:postgres@db:5432/mozaik?schema=public
   ```

## Starting the Application

### Step 1: Make sure Docker is running

Check if Docker is running:
```bash
docker ps
```

If you get an error like "Cannot connect to the Docker daemon", you need to:
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar should be steady)
3. Try `docker ps` again

### Step 2: Navigate to project root

**Important:** Run docker-compose from the project root, not the backend directory:

```bash
cd /Users/adityasinghrawat/Desktop/project/Mozaik
```

### Step 3: Start all services

```bash
docker-compose up -d --build
```

This will:
- Build the backend Docker image
- Build the Manim Docker image
- Start PostgreSQL database
- Start all containers

### Step 4: Run database migrations

```bash
docker exec mozaik-backend npx prisma migrate deploy
```

Or if you need to create a new migration:
```bash
docker exec mozaik-backend npx prisma migrate dev
```

### Step 5: Verify everything is running

```bash
docker-compose ps
```

You should see:
- `mozaik-backend` - running
- `mozaik-manim` - running
- `mozaik-db` - running

## Common Issues

### Issue 1: "Cannot connect to the Docker daemon"

**Solution:**
1. Open Docker Desktop application
2. Wait for it to start completely
3. Check the Docker icon in your menu bar - it should be steady (not animated)
4. Try again

### Issue 2: "docker-compose: command not found"

**Solution:**
On newer Docker Desktop versions, use:
```bash
docker compose up -d --build
```
(Note: no hyphen between `docker` and `compose`)

### Issue 3: "The 'GOOGLE_AI_API_KEY' variable is not set"

**Solution:**
1. Create `.env` file in project root:
   ```bash
   cd /Users/adityasinghrawat/Desktop/project/Mozaik
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   GOOGLE_AI_API_KEY=your-actual-api-key
   ```

### Issue 4: Running from wrong directory

**Solution:**
Make sure you're in the project root (where `docker-compose.yml` is):
```bash
cd /Users/adityasinghrawat/Desktop/project/Mozaik
docker-compose up -d
```

## Checking Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f manim
docker-compose logs -f db
```

## Stopping Services

```bash
docker-compose down
```

## Restarting Services

```bash
docker-compose restart
```

## Complete Setup Commands

```bash
# 1. Navigate to project root
cd /Users/adityasinghrawat/Desktop/project/Mozaik

# 2. Create .env file
cp .env.example .env
# Edit .env with your API keys

# 3. Start Docker Desktop (if not running)

# 4. Build and start containers
docker-compose up -d --build

# 5. Run migrations
docker exec mozaik-backend npx prisma migrate deploy

# 6. Check status
docker-compose ps

# 7. Test API
curl http://localhost:3001/health
```

## API Endpoints

Once running, your API will be available at:
- **Base URL:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/health`
- **API Docs:** See `VIDEO_GENERATION_GUIDE.md`

