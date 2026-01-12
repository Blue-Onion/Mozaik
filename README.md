# Mozaik
bbjbjkb
Mozaik is an AI-powered Manim code generator that turns your ideas into clean, production-ready animation code within seconds. Built for developers and educators who value speed, clarity, and automation, Mozaik helps you skip repetitive setup and focus on creativity.

## 🚀 Features

- **AI-Powered Generation**: Convert natural language prompts into Manim Python code.
- **Instant Preview**: Generate and view animations directly within the platform.
- **Project Management**: Organize your animations into projects.
- **Dockerized Environment**: Secure and isolated execution of Manim code.
- **Modern Stack**: Built with Node.js, Express, PostgreSQL, and React (Frontend).

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Animation Engine**: Manim Community Edition (running in Docker)
- **AI Model**: Google Gemini / OpenAI (configurable)
- **Containerization**: Docker & Docker Compose

## 🏁 Quick Start

The easiest way to run Mozaik is using Docker Compose.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Mozaik
    ```

2.  **Configure Environment**
    Copy the example environment file and update it with your API keys.
    ```bash
    cp .env.example .env
    ```
    *Edit `.env` and add your `GOOGLE_AI_API_KEY` or `GEMINI_API_KEY`.*

3.  **Start the Application**
    ```bash
    docker-compose up -d --build
    ```

4.  **Run Migrations**
    ```bash
    docker exec mozaik-backend npx prisma migrate deploy
    ```

5.  **Access the App**
    - Backend API: `http://localhost:3001`
    - Health Check: `http://localhost:3001/health`

For detailed instructions, troubleshooting, and common issues, please refer to:
- [**Quick Start Guide**](./QUICK_START.md)
- [**Docker Setup Guide**](./README.DOCKER.md)

## 📂 Project Structure

```
Mozaik/
├── backend/            # Node.js Express API
│   ├── src/            # Source code
│   ├── prisma/         # Database schema
│   └── Dockerfile      # Backend Dockerfile
├── frontend/           # React Frontend (if applicable)
├── docker-compose.yml  # Docker composition
├── QUICK_START.md      # Detailed setup guide
└── README.md           # This file
```

## 📝 API Documentation

The backend provides RESTful endpoints for:
- **Auth**: User authentication
- **Projects**: Manage animation projects
- **Prompts**: Create and manage AI prompts
- **Videos**: Generate and retrieve rendered videos

See `backend/src/routes` for detailed route definitions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
