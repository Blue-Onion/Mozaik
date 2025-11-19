FROM python:3.11-slim

# Install system dependencies including build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    pkg-config \
    meson \
    ninja-build \
    ffmpeg \
    sox \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    texlive \
    texlive-latex-extra \
    texlive-fonts-extra \
    texlive-latex-recommended \
    texlive-science \
    texlive-fonts-extra \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Install Manim Community
RUN pip install --no-cache-dir manim

# Create working directory
WORKDIR /manim

# Create output directory
RUN mkdir -p /manim/output

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["python3"]

