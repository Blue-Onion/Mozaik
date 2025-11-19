# Video Generation Guide

## Overview

The video generation API takes Manim Python code and compiles it into an MP4 video file in an isolated Docker container.

## Prerequisites

1. **Docker and Docker Compose must be running**
   ```bash
   docker-compose up -d
   ```

2. **Ensure the Manim container is running**
   ```bash
   docker ps | grep mozaik-manim
   ```

3. **Authenticate** - You need a valid JWT token from `/api/auth/login`

## API Endpoint

### Generate Video

**POST** `/api/video/generate`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "from manim import *\n\nclass MyScene(Scene):\n    def construct(self):\n        circle = Circle()\n        self.play(Create(circle))",
  "promptId": "optional-prompt-uuid",
  "projectId": "optional-project-uuid"
}
```

**Response (Success):**
```json
{
  "success": true,
  "video": {
    "id": "video-uuid",
    "videoUrl": "/uploads/videos/video_abc123.mp4",
    "durationSec": null,
    "resolution": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "videoUrl": "/uploads/videos/video_abc123.mp4",
  "fileSize": 1234567,
  "message": "Video generated successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to generate video. Please check your Manim code for errors.",
  "details": "Error message here"
}
```

## Step-by-Step Process

### 1. Generate Manim Code (Optional)

First, you can generate Manim code from prompts:

```bash
POST /api/code/generate-code
{
  "projectId": "your-project-id"
}
```

This returns Manim code that you can then use for video generation.

### 2. Debug Code (Optional)

If you want to debug/fix the generated code:

```bash
POST /api/code/debug-code
{
  "code": "your-manim-code-here"
}
```

### 3. Generate Video

Use the code (generated or custom) to create a video:

```bash
POST /api/video/generate
{
  "code": "from manim import *\n\nclass MyScene(Scene):\n    def construct(self):\n        circle = Circle()\n        self.play(Create(circle))",
  "promptId": "optional",
  "projectId": "optional"
}
```

## Example: Complete Workflow

### Using cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Generate code from prompts
CODE=$(curl -X POST http://localhost:3001/api/code/generate-code \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"your-project-id"}' \
  | jq -r '.code')

# 3. Generate video from code
curl -X POST http://localhost:3001/api/video/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"$CODE\",\"projectId\":\"your-project-id\"}"
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function generateVideo() {
  try {
    // 1. Login
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'user@example.com',
      password: 'password'
    });
    const token = loginRes.data.token;

    // 2. Generate code (optional)
    const codeRes = await axios.post(
      `${API_BASE}/api/code/generate-code`,
      { projectId: 'your-project-id' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const code = codeRes.data.code;

    // 3. Generate video
    const videoRes = await axios.post(
      `${API_BASE}/api/video/generate`,
      {
        code: code,
        projectId: 'your-project-id',
        promptId: 'optional-prompt-id'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Video URL:', videoRes.data.videoUrl);
    console.log('Full URL:', `${API_BASE}${videoRes.data.videoUrl}`);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

generateVideo();
```

### Using Python

```python
import requests

API_BASE = "http://localhost:3001"

# 1. Login
login_response = requests.post(
    f"{API_BASE}/api/auth/login",
    json={"email": "user@example.com", "password": "password"}
)
token = login_response.json()["token"]

headers = {"Authorization": f"Bearer {token}"}

# 2. Generate code (optional)
code_response = requests.post(
    f"{API_BASE}/api/code/generate-code",
    json={"projectId": "your-project-id"},
    headers=headers
)
code = code_response.json()["code"]

# 3. Generate video
video_response = requests.post(
    f"{API_BASE}/api/video/generate",
    json={
        "code": code,
        "projectId": "your-project-id"
    },
    headers=headers
)

video_data = video_response.json()
print(f"Video URL: {API_BASE}{video_data['videoUrl']}")
```

## Manim Code Requirements

Your Manim code must:

1. **Import Manim properly:**
   ```python
   from manim import *
   ```

2. **Define a Scene class:**
   ```python
   class MyScene(Scene):
       def construct(self):
           # Your animation code here
           pass
   ```

3. **Be compatible with Manim Community v0.17+**

## Example Manim Code

```python
from manim import *

class SimpleCircle(Scene):
    def construct(self):
        circle = Circle(color=BLUE)
        square = Square(color=RED)
        
        self.play(Create(circle))
        self.wait(1)
        self.play(Transform(circle, square))
        self.wait(1)
        self.play(FadeOut(square))
```

## Accessing Generated Videos

Once generated, videos are accessible at:
```
http://localhost:3001/uploads/videos/{filename}.mp4
```

Or use the `videoUrl` from the API response.

## Troubleshooting

### Video generation fails

1. **Check Manim container is running:**
   ```bash
   docker ps | grep mozaik-manim
   ```

2. **Check container logs:**
   ```bash
   docker logs mozaik-manim
   ```

3. **Verify code syntax:**
   - Use `/api/code/debug-code` to check for errors
   - Ensure all imports are correct
   - Check Manim version compatibility

4. **Check disk space:**
   ```bash
   df -h
   ```

### Video not found

- Check the `uploads/videos` directory exists
- Verify file permissions
- Check Docker volume mounts in `docker-compose.yml`

### Timeout errors

- Complex animations may take longer than 5 minutes
- Increase timeout in `video.service.js` if needed
- Consider using lower quality (`-ql` instead of `-qh`)

## Quality Settings

The current setup uses `-ql` (low quality) for faster rendering. To change:

Edit `backend/src/services/video.service.js`:
```javascript
// Change from -ql to -qh for high quality
const manimCommand = `docker exec ${MANIM_CONTAINER} manim -qh /manim/${codeFileName} ...`;
```

Quality options:
- `-ql` - Low quality (480p, 15fps) - Fast
- `-qm` - Medium quality (720p, 30fps) - Medium
- `-qh` - High quality (1080p, 60fps) - Slow

