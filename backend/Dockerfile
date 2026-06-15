# Use a specialized uv image for speed
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    unzip \
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

# Fix 1: Set DENO_INSTALL before running the install script
ENV DENO_INSTALL="/root/.deno"

# Install Deno for yt-dlp JavaScript runtime/n-challenge solver
RUN curl -fsSL https://deno.land/install.sh | sh
ENV PATH="$DENO_INSTALL/bin:$PATH"

# Set working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen --no-install-project

# Fix 2: Copy entrypoint scripts explicitly BEFORE copying the whole app
# This ensures docker layer caching works perfectly for app changes
COPY entrypoint.sh /entrypoint.sh
COPY celery_entrypoint.sh /celery_entrypoint.sh
RUN chmod +x /entrypoint.sh /celery_entrypoint.sh

# Copy the rest of the application
COPY . .

# Fix 3: Grant read permissions to youtube_cookies.txt if it exists in the build context
RUN if [ -f youtube_cookies.txt ]; then chmod 644 youtube_cookies.txt; fi

# Install the project itself (if applicable)
RUN uv sync --frozen
RUN uv run playwright install chromium

# Create necessary directories
RUN mkdir -p staticfiles media

# Expose the port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["/entrypoint.sh"]