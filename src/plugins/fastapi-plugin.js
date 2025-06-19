import { BasePlugin } from './base-plugin.js';

export class FastAPIPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'fastapi',
      displayName: 'Python + FastAPI',
      category: 'stack',
      projectTypes: ['backend', 'fullstack'],
      languages: ['Python'],
      icon: '🚀',
      description: 'Modern, fast (high-performance), web framework for building APIs with Python'
    };
  }

  static get requirements() {
    return {
      python: '>=3.8.0',
      pip: '>=21.0.0'
    };
  }

  getDependencies() {
    const deps = ['fastapi', 'uvicorn[standard]', 'python-multipart', 'python-dotenv'];
    
    if (this.config.database === 'postgresql') {
      deps.push('asyncpg', 'databases[postgresql]');
    } else if (this.config.database === 'mongodb') {
      deps.push('motor', 'beanie');
    } else if (this.config.database === 'mysql') {
      deps.push('aiomysql', 'databases[mysql]');
    } else if (this.config.database === 'sqlite') {
      deps.push('aiosqlite', 'databases[sqlite]');
    }

    if (this.config.authentication === 'jwt') {
      deps.push('python-jose[cryptography]', 'passlib[bcrypt]');
    } else if (this.config.authentication === 'oauth') {
      deps.push('authlib', 'python-jose[cryptography]', 'passlib[bcrypt]');
    }

    if (this.config.orm) {
      deps.push('sqlalchemy', 'alembic');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    return [
      'pytest',
      'pytest-asyncio',
      'httpx',
      'black',
      'flake8',
      'mypy',
      'pre-commit'
    ];
  }

  getFileStructure() {
    return `app/
├── __init__.py
├── main.py
├── core/
│   ├── __init__.py
│   ├── config.py
│   ├── security.py
│   └── dependencies.py
├── api/
│   ├── __init__.py
│   ├── deps.py
│   └── v1/
│       ├── __init__.py
│       ├── api.py
│       └── endpoints/
│           ├── __init__.py
│           ├── auth.py
│           └── users.py
├── crud/
│   ├── __init__.py
│   ├── base.py
│   └── crud_user.py
├── db/
│   ├── __init__.py
│   ├── base.py
│   ├── session.py
│   └── init_db.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   └── token.py
└── schemas/
    ├── __init__.py
    ├── user.py
    └── token.py
tests/
├── __init__.py
├── conftest.py
└── api/
    ├── __init__.py
    └── test_auth.py
requirements.txt
requirements-dev.txt
.env
.env.example
alembic.ini
pyproject.toml`;
  }

  getConfigFiles() {
    const files = [];

    // Main FastAPI app
    files.push({
      name: 'app/main.py',
      language: 'python',
      content: `from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.api.v1.api import api_router
from app.core.config import settings

# Load environment variables
load_dotenv()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A FastAPI application",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "FastAPI is running"}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )`
    });

    // Configuration
    files.push({
      name: 'app/core/config.py',
      language: 'python',
      content: `import os
from typing import List, Optional, Union
from pydantic import BaseSettings, validator, AnyHttpUrl


class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Application"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server configuration
    HOST: str = "localhost"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    # Testing
    TESTING: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()`
    });

    // API Router
    files.push({
      name: 'app/api/v1/api.py',
      language: 'python',
      content: `from fastapi import APIRouter

from app.api.v1.endpoints import auth, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])`
    });

    // Auth endpoint
    files.push({
      name: 'app/api/v1/endpoints/auth.py',
      language: 'python',
      content: `from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.schemas.token import Token

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # This is a simplified example - implement proper user authentication
    if form_data.username == "admin" and verify_password("admin", "$2b$12$example_hash"):
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": form_data.username}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )`
    });

    // OAuth configuration if enabled
    if (this.config.authentication === 'oauth') {
      files.push({
        name: 'app/api/v1/endpoints/oauth.py',
        language: 'python',
        content: `from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.token import Token

router = APIRouter()

# OAuth configuration
config = Config('.env')
oauth = OAuth(config)

# Google OAuth
google = oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# GitHub OAuth
github = oauth.register(
    name='github',
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)


@router.get("/login/{provider}")
async def oauth_login(provider: str, request: Request):
    """
    Initiate OAuth login with specified provider
    """
    if provider == "google":
        redirect_uri = request.url_for('oauth_callback', provider='google')
        return await google.authorize_redirect(request, redirect_uri)
    elif provider == "github":
        redirect_uri = request.url_for('oauth_callback', provider='github')
        return await github.authorize_redirect(request, redirect_uri)
    else:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")


@router.get("/callback/{provider}")
async def oauth_callback(provider: str, request: Request):
    """
    Handle OAuth callback and create access token
    """
    try:
        if provider == "google":
            token = await google.authorize_access_token(request)
            user_info = token.get('userinfo')
            if not user_info:
                user_info = await google.parse_id_token(request, token)
        elif provider == "github":
            token = await github.authorize_access_token(request)
            resp = await github.get('user', token=token)
            user_info = resp.json()
        else:
            raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
        
        # Create access token for user
        access_token = create_access_token(data={"sub": user_info.get("email")})
        
        # Redirect to frontend with token or return token
        return {"access_token": access_token, "token_type": "bearer", "user": user_info}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth authentication failed: {str(e)}")`
      });

      // Update config.py to include OAuth settings
      files.push({
        name: 'app/core/oauth_config.py',
        language: 'python',
        content: `import os
from typing import Optional
from pydantic import BaseSettings


class OAuthSettings(BaseSettings):
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # GitHub OAuth
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    
    # OAuth URLs
    OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/v1/oauth/callback"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


oauth_settings = OAuthSettings()`
      });
    }

    // Security utilities
    files.push({
      name: 'app/core/security.py',
      language: 'python',
      content: `from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)`
    });

    // Pydantic schemas
    files.push({
      name: 'app/schemas/token.py',
      language: 'python',
      content: `from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None`
    });

    files.push({
      name: 'app/schemas/user.py',
      language: 'python',
      content: `from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        orm_mode = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str`
    });

    // Requirements files
    files.push({
      name: 'requirements.txt',
      language: 'text',
      content: this.getDependencies().production.join('\n')
    });

    files.push({
      name: 'requirements-dev.txt',
      language: 'text',
      content: [...this.getDependencies().production, ...this.getDevDependencies()].join('\n')
    });

    // Environment files
    let envContent = `# Server Configuration
HOST=localhost
PORT=8000
DEBUG=True

# Security
SECRET_KEY="your-super-secret-key-change-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# CORS Origins (comma-separated)
BACKEND_CORS_ORIGINS="http://localhost:3000,http://localhost:8080"

# Testing
TESTING=False`;

    if (this.config.authentication === 'oauth') {
      envContent += `

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
OAUTH_REDIRECT_URI="http://localhost:8000/api/v1/oauth/callback"`;
    }

    files.push({
      name: '.env.example',
      language: 'bash',
      content: envContent
    });

    // PyProject.toml for modern Python packaging
    files.push({
      name: 'pyproject.toml',
      language: 'toml',
      content: `[tool.black]
line-length = 88
target-version = ['py38']
include = '\\.pyi?$'
extend-exclude = '''
/(
  # directories
  \\.eggs
  | \\.git
  | \\.hg
  | \\.mypy_cache
  | \\.tox
  | \\.venv
  | build
  | dist
)/
'''

[tool.isort]
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
line_length = 88

[tool.mypy]
python_version = "3.8"
check_untyped_defs = true
ignore_missing_imports = true
warn_unused_ignores = true
warn_redundant_casts = true
warn_unused_configs = true

[tool.pytest.ini_options]
minversion = "6.0"
addopts = "-ra -q --strict-markers --strict-config"
testpaths = [
    "tests",
]`
    });

    // Docker configuration if deployment is docker
    if (this.config.deployment === 'docker') {
      files.push({
        name: 'Dockerfile',
        language: 'dockerfile',
        content: `# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \\
    && apt-get install -y --no-install-recommends \\
        build-essential \\
        curl \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \\
    && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY ./app /app/app

# Create non-root user
RUN groupadd -r fastapi && useradd -r -g fastapi fastapi \\
    && chown -R fastapi:fastapi /app
USER fastapi

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`
      });

      files.push({
        name: 'docker-compose.yml',
        language: 'yaml',
        content: `version: '3.8'

services:
  fastapi:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/fastapi_db
      - DEBUG=False
    depends_on:
      - db
    volumes:
      - ./app:/app/app
    networks:
      - fastapi-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fastapi_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - fastapi-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - fastapi-network

volumes:
  postgres_data:

networks:
  fastapi-network:
    driver: bridge`
      });

      files.push({
        name: '.dockerignore',
        language: 'text',
        content: `__pycache__
*.pyc
*.pyo
*.pyd
.Python
env
pip-log.txt
pip-delete-this-directory.txt
.tox
.coverage
.pytest_cache
.coverage.*
htmlcov
.env
.git
.gitignore
README.md
.DS_Store
.vscode
.idea
*.egg-info
dist
build
.mypy_cache
.pytest_cache
tests/
docs/`
      });
    }

    return files;
  }

  getCommands() {
    return {
      dev: 'uvicorn app.main:app --host localhost --port 8000 --reload',
      start: 'uvicorn app.main:app --host 0.0.0.0 --port 8000',
      test: 'pytest',
      lint: 'black . && flake8 . && mypy .',
      format: 'black . && isort .',
      migrate: 'alembic upgrade head',
      'migrate:create': 'alembic revision --autogenerate -m'
    };
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '🚀 FastAPI Application',
      content: `This is a production-ready FastAPI application with:

- **Performance**: Built on Starlette and Pydantic for high performance
- **Type Safety**: Full type hints and automatic data validation
- **Documentation**: Automatic OpenAPI/Swagger documentation
- **Security**: JWT authentication, CORS, and security middleware
- **Modern Python**: Uses Python 3.8+ features and async/await
- **Testing**: Comprehensive test suite with pytest

### API Endpoints:
- \`GET /health\` - Health check
- \`GET /docs\` - Interactive API documentation (Swagger)
- \`GET /redoc\` - Alternative API documentation
- \`POST /api/v1/auth/login\` - User authentication
- \`GET /api/v1/users/\` - Get users (protected)

### Development:
\`\`\`bash
pip install -r requirements-dev.txt  # Install dependencies
python -m uvicorn app.main:app --reload  # Start development server
pytest  # Run tests
black . && flake8 . && mypy .  # Lint and type check
\`\`\``
    });

    if (this.config.database) {
      sections.push({
        title: '🗄️ Database Integration',
        content: `Database configuration for ${this.getDatabaseLabel()}:

- Async database operations for optimal performance
- SQLAlchemy ORM with Alembic migrations
- Database connection pooling
- Pydantic models for data validation
- CRUD operations in \`app/crud/\`

### Setup:
1. Create your database
2. Update \`DATABASE_URL\` in \`.env\`
3. Run \`alembic upgrade head\` for migrations`
      });
    }

    return sections;
  }

  getDatabaseLabel() {
    const labels = {
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'sqlite': 'SQLite'
    };
    return labels[this.config.database] || this.config.database;
  }

  getSupportedFeatures() {
    return ['rest-api', 'async', 'type-hints', 'validation', 'documentation', 'authentication', 'database', 'high-performance'];
  }

  getSecurityGuidelines() {
    return [
      'Always use Pydantic models for input validation',
      'Use parameterized queries with SQLAlchemy to prevent SQL injection',
      'Implement rate limiting using slowapi',
      'Use HTTPS in production',
      'Store sensitive data in environment variables',
      'Implement proper error handling without exposing system details',
      'Use JWT tokens with appropriate expiration times',
      'Hash passwords using passlib with bcrypt',
      'Validate and sanitize all user inputs',
      'Use dependency injection for authentication checks',
      'Enable CORS only for trusted origins in production'
    ];
  }

  getTestingStrategy() {
    return `- Unit tests for API endpoints using httpx
- Async testing with pytest-asyncio
- Database tests with test database
- Mock external services in tests
- Test data validation with Pydantic models
- Integration tests for authentication flows
- Test API documentation generation`;
  }

  getLanguageExtension() {
    return 'py';
  }

  getTemplateVariables() {
    return {
      isFastAPI: true,
      hasRESTAPI: true,
      hasAsyncSupport: true,
      hasTypeHints: true,
      hasValidation: true,
      hasDocumentation: true,
      hasAuthentication: this.config.authentication !== 'none',
      isHighPerformance: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // FastAPI is compatible with most plugins except other backend frameworks
    const incompatible = ['express', 'fastify', 'django', 'rails', 'gin'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}