# Use the official uv image for build and runtime
FROM ghcr.io/astral-sh/uv:python3.12-alpine

# Set working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files
COPY pyproject.toml uv.lock ./

# Install dependencies without installing the project itself
# This layer is cached as long as pyproject.toml/uv.lock don't change
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
