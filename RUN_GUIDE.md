# Complete Run Guide

## Step 1: Start All Containers

From the project root directory:

```bash
cd /Users/adityasinghrawat/Desktop/project/Mozaik

# Build and start all containers
docker-compose up -d --build
```

This will:
- Build the backend container
- Build the Manim container (with all dependencies)
- Start PostgreSQL database
- Start all services

## Step 2: Check Container Status

```bash
docker-compose ps
```

You should see all three containers running:
- `mozaik-backend`
- `mozaik-manim`
- `mozaik-db`

## Step 3: Run Database Migrations

```bash
docker exec mozaik-backend npx prisma migrate deploy
```

## Step 4: Verify API is Running

```bash
curl http://localhost:3001/health
```

Should return: `{"message":"ok","timestamp":"..."}`

## Step 5: Using the API

### Option A: Using cURL

#### 1. Register a User (First Time)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### 2. Login to Get Token

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

#### 3. Create a Project

```bash
PROJECT_ID=$(curl -s -X POST http://localhost:3001/api/project/create-project \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "Testing video generation"
  }' | jq -r '.project.id')

echo "Project ID: $PROJECT_ID"
```

#### 4. Create a Prompt

```bash
PROMPT_ID=$(curl -s -X POST http://localhost:3001/api/prompt/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Create a simple animation with a blue circle that appears and then fades out\",
    \"projectId\": \"$PROJECT_ID\"
  }" | jq -r '.prompt.id')

echo "Prompt ID: $PROMPT_ID"
```

#### 5. Generate Manim Code from Prompts

```bash
CODE=$(curl -s -X POST http://localhost:3001/api/code/generate-code \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\"
  }" | jq -r '.code')

echo "Generated Code:"
echo "$CODE"
```

#### 6. (Optional) Debug the Code

```bash
DEBUGGED_CODE=$(curl -s -X POST http://localhost:3001/api/code/debug-code \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$CODE\"
  }" | jq -r '.debuggedCode')

echo "Debugged Code:"
echo "$DEBUGGED_CODE"
```

#### 7. Generate Video from Code

```bash
VIDEO_RESPONSE=$(curl -s -X POST http://localhost:3001/api/video/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$CODE\",
    \"projectId\": \"$PROJECT_ID\",
    \"promptId\": \"$PROMPT_ID\"
  }")

echo "$VIDEO_RESPONSE" | jq '.'

VIDEO_URL=$(echo "$VIDEO_RESPONSE" | jq -r '.videoUrl')
echo "Video URL: http://localhost:3001$VIDEO_URL"
```

### Option B: Using JavaScript/Node.js

Create a file `test-api.js`:

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testVideoGeneration() {
  try {
    // 1. Register (or skip if already registered)
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      console.log('✓ User registered');
    } catch (e) {
      if (e.response?.status === 409) {
        console.log('✓ User already exists');
      } else {
        throw e;
      }
    }

    // 2. Login
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✓ Logged in');

    const headers = { Authorization: `Bearer ${token}` };

    // 3. Create Project
    const projectRes = await axios.post(
      `${API_BASE}/api/project/create-project`,
      {
        name: 'My First Project',
        description: 'Testing video generation'
      },
      { headers }
    );
    const projectId = projectRes.data.project.id;
    console.log(`✓ Project created: ${projectId}`);

    // 4. Create Prompt
    const promptRes = await axios.post(
      `${API_BASE}/api/prompt/create`,
      {
        text: 'Create a simple animation with a blue circle that appears and then fades out',
        projectId: projectId
      },
      { headers }
    );
    const promptId = promptRes.data.prompt.id;
    console.log(`✓ Prompt created: ${promptId}`);

    // 5. Generate Code
    console.log('⏳ Generating Manim code...');
    const codeRes = await axios.post(
      `${API_BASE}/api/code/generate-code`,
      { projectId: projectId },
      { headers }
    );
    const code = codeRes.data.code;
    console.log('✓ Code generated');
    console.log('Code preview:', code.substring(0, 100) + '...');

    // 6. (Optional) Debug Code
    console.log('⏳ Debugging code...');
    const debugRes = await axios.post(
      `${API_BASE}/api/code/debug-code`,
      { code: code },
      { headers }
    );
    const debuggedCode = debugRes.data.debuggedCode;
    console.log('✓ Code debugged');

    // 7. Generate Video
    console.log('⏳ Generating video (this may take a few minutes)...');
    const videoRes = await axios.post(
      `${API_BASE}/api/video/generate`,
      {
        code: debuggedCode,
        projectId: projectId,
        promptId: promptId
      },
      { headers }
    );
    
    const videoUrl = `${API_BASE}${videoRes.data.videoUrl}`;
    console.log('✓ Video generated successfully!');
    console.log(`Video URL: ${videoUrl}`);
    console.log(`File size: ${(videoRes.data.fileSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testVideoGeneration();
```

Run it:
```bash
npm install axios
node test-api.js
```

### Option C: Using Python

Create a file `test_api.py`:

```python
import requests
import time

API_BASE = "http://localhost:3001"

def test_video_generation():
    try:
        # 1. Register
        try:
            requests.post(f"{API_BASE}/api/auth/register", json={
                "email": "test@example.com",
                "password": "password123",
                "name": "Test User"
            })
            print("✓ User registered")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 409:
                print("✓ User already exists")
            else:
                raise

        # 2. Login
        login_res = requests.post(f"{API_BASE}/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        token = login_res.json()["token"]
        print("✓ Logged in")

        headers = {"Authorization": f"Bearer {token}"}

        # 3. Create Project
        project_res = requests.post(
            f"{API_BASE}/api/project/create-project",
            json={
                "name": "My First Project",
                "description": "Testing video generation"
            },
            headers=headers
        )
        project_id = project_res.json()["project"]["id"]
        print(f"✓ Project created: {project_id}")

        # 4. Create Prompt
        prompt_res = requests.post(
            f"{API_BASE}/api/prompt/create",
            json={
                "text": "Create a simple animation with a blue circle that appears and then fades out",
                "projectId": project_id
            },
            headers=headers
        )
        prompt_id = prompt_res.json()["prompt"]["id"]
        print(f"✓ Prompt created: {prompt_id}")

        # 5. Generate Code
        print("⏳ Generating Manim code...")
        code_res = requests.post(
            f"{API_BASE}/api/code/generate-code",
            json={"projectId": project_id},
            headers=headers
        )
        code = code_res.json()["code"]
        print("✓ Code generated")
        print(f"Code preview: {code[:100]}...")

        # 6. Debug Code
        print("⏳ Debugging code...")
        debug_res = requests.post(
            f"{API_BASE}/api/code/debug-code",
            json={"code": code},
            headers=headers
        )
        debugged_code = debug_res.json()["debuggedCode"]
        print("✓ Code debugged")

        # 7. Generate Video
        print("⏳ Generating video (this may take a few minutes)...")
        video_res = requests.post(
            f"{API_BASE}/api/video/generate",
            json={
                "code": debugged_code,
                "projectId": project_id,
                "promptId": prompt_id
            },
            headers=headers
        )

        video_data = video_res.json()
        video_url = f"{API_BASE}{video_data['videoUrl']}"
        print("✓ Video generated successfully!")
        print(f"Video URL: {video_url}")
        print(f"File size: {video_data['fileSize'] / 1024 / 1024:.2f} MB")

    except Exception as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

if __name__ == "__main__":
    test_video_generation()
```

Run it:
```bash
pip install requests
python test_api.py
```

## Quick Test with Simple Code

If you want to test video generation directly without generating code first:

```bash
# Get your token first (from login step above)
TOKEN="your-token-here"

# Generate video with simple test code
curl -X POST http://localhost:3001/api/video/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "from manim import *\n\nclass TestScene(Scene):\n    def construct(self):\n        circle = Circle(color=BLUE)\n        self.play(Create(circle))\n        self.wait(1)\n        self.play(FadeOut(circle))"
  }'
```

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Manim only (to see video generation progress)
docker-compose logs -f manim
```

## Stopping Containers

```bash
docker-compose down
```

## Restarting After Changes

```bash
docker-compose restart
```

## Troubleshooting

### Check if containers are running:
```bash
docker ps
```

### Check container logs:
```bash
docker logs mozaik-backend
docker logs mozaik-manim
```

### Rebuild if needed:
```bash
docker-compose down
docker-compose up -d --build
```

