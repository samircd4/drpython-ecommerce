# Use a specialized uv image for speed
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    # Playwright dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen --no-install-project

# Copy the rest of the application
COPY . .

# Install the project itself (if applicable)
RUN uv sync --frozen
RUN uv run playwright install chromium

# Create necessary directories
RUN mkdir -p staticfiles media

# Expose the port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Use a script for entrypoint to handle migrations
COPY entrypoint.sh /entrypoint.sh
COPY celery_entrypoint.sh /celery_entrypoint.sh
RUN chmod +x /entrypoint.sh /celery_entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
