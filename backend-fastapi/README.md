# Backend FastAPI

BIT-MITRA backend built with FastAPI, SQLAlchemy (async), and PostgreSQL.

## Setup

```bash
# Create virtual environment with uv
uv venv
source .venv/bin/activate

# Install dependencies
uv pip install -e .

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run development server
uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
