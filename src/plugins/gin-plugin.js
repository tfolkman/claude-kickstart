import { BasePlugin } from './base-plugin.js';

export class GinPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'gin',
      displayName: 'Go + Gin',
      category: 'stack',
      projectTypes: ['backend', 'fullstack'],
      languages: ['Go'],
      icon: '🍸',
      description: 'Fast HTTP web framework written in Go'
    };
  }

  static get requirements() {
    return {
      go: '>=1.19.0'
    };
  }

  getDependencies() {
    const deps = [
      'github.com/gin-gonic/gin',
      'github.com/gin-contrib/cors',
      'github.com/gin-contrib/secure',
      'github.com/joho/godotenv'
    ];
    
    if (this.config.database === 'postgresql') {
      deps.push('github.com/lib/pq', 'gorm.io/gorm', 'gorm.io/driver/postgres');
    } else if (this.config.database === 'mysql') {
      deps.push('gorm.io/gorm', 'gorm.io/driver/mysql');
    } else if (this.config.database === 'sqlite') {
      deps.push('gorm.io/gorm', 'gorm.io/driver/sqlite');
    } else if (this.config.database === 'mongodb') {
      deps.push('go.mongodb.org/mongo-driver/mongo');
    }

    if (this.config.authentication === 'jwt') {
      deps.push('github.com/golang-jwt/jwt/v5');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    return [
      'github.com/stretchr/testify',
      'github.com/gin-contrib/pprof',
      'github.com/swaggo/gin-swagger',
      'github.com/swaggo/files'
    ];
  }

  getFileStructure() {
    return `cmd/
└── server/
    └── main.go
internal/
├── config/
│   └── config.go
├── handlers/
│   ├── auth.go
│   ├── health.go
│   └── users.go
├── middleware/
│   ├── auth.go
│   ├── cors.go
│   └── logger.go
├── models/
│   └── user.go
├── repository/
│   ├── interfaces.go
│   └── user_repository.go
├── services/
│   ├── auth_service.go
│   └── user_service.go
└── utils/
    ├── database.go
    ├── jwt.go
    └── validator.go
pkg/
└── api/
    └── router.go
docs/
├── swagger.json
└── swagger.yaml
scripts/
├── build.sh
└── migrate.sh
.env
.env.example
go.mod
go.sum
Dockerfile
docker-compose.yml
Makefile`;
  }

  getConfigFiles() {
    const files = [];

    // Main application entry point
    files.push({
      name: 'cmd/server/main.go',
      language: 'go',
      content: `package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	
	"myapp/internal/config"
	"myapp/pkg/api"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg := config.New()

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := api.NewRouter(cfg)

	// Start server
	log.Printf("🍸 Gin server starting on %s", cfg.ServerAddress())
	log.Printf("📍 Environment: %s", cfg.Environment)
	
	if err := router.Run(cfg.ServerAddress()); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}`
    });

    // Configuration
    files.push({
      name: 'internal/config/config.go',
      language: 'go',
      content: `package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Environment   string
	Host         string
	Port         int
	DatabaseURL  string
	JWTSecret    string
	JWTExpireHours int
}

func New() *Config {
	return &Config{
		Environment:    getEnv("ENVIRONMENT", "development"),
		Host:          getEnv("HOST", "localhost"),
		Port:          getEnvAsInt("PORT", 8080),
		DatabaseURL:   getEnv("DATABASE_URL", ""),
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpireHours: getEnvAsInt("JWT_EXPIRE_HOURS", 24),
	}
}

func (c *Config) ServerAddress() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}`
    });

    // Router setup
    files.push({
      name: 'pkg/api/router.go',
      language: 'go',
      content: `package api

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/secure"
	"github.com/gin-gonic/gin"

	"myapp/internal/config"
	"myapp/internal/handlers"
	"myapp/internal/middleware"
)

func NewRouter(cfg *config.Config) *gin.Engine {
	router := gin.New()

	// Recovery middleware
	router.Use(gin.Recovery())

	// Logger middleware
	router.Use(middleware.Logger())

	// Security middleware
	router.Use(secure.New(secure.Config{
		AllowedHosts:          []string{},
		SSLRedirect:           cfg.IsProduction(),
		STSSeconds:            315360000,
		STSIncludeSubdomains:  true,
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: "default-src 'self'",
	}))

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check endpoint
	router.GET("/health", handlers.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes
		auth := v1.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
		}

		// Protected routes
		protected := v1.Group("/users")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			protected.GET("/", handlers.GetUsers)
			protected.GET("/me", handlers.GetCurrentUser)
			protected.PUT("/me", handlers.UpdateCurrentUser)
		}
	}

	return router
}`
    });

    // Health check handler
    files.push({
      name: 'internal/handlers/health.go',
      language: 'go',
      content: `package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthResponse struct {
	Status    string    \`json:"status"\`
	Timestamp time.Time \`json:"timestamp"\`
	Message   string    \`json:"message"\`
}

func HealthCheck(c *gin.Context) {
	response := HealthResponse{
		Status:    "OK",
		Timestamp: time.Now(),
		Message:   "Gin server is running",
	}

	c.JSON(http.StatusOK, response)
}`
    });

    // User model
    files.push({
      name: 'internal/models/user.go',
      language: 'go',
      content: `package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           \`json:"id" gorm:"primaryKey"\`
	Username  string         \`json:"username" gorm:"uniqueIndex;not null"\`
	Email     string         \`json:"email" gorm:"uniqueIndex;not null"\`
	Password  string         \`json:"-" gorm:"not null"\`
	FirstName string         \`json:"first_name"\`
	LastName  string         \`json:"last_name"\`
	IsActive  bool           \`json:"is_active" gorm:"default:true"\`
	CreatedAt time.Time      \`json:"created_at"\`
	UpdatedAt time.Time      \`json:"updated_at"\`
	DeletedAt gorm.DeletedAt \`json:"-" gorm:"index"\`
}

type UserCreateRequest struct {
	Username  string \`json:"username" binding:"required,min=3,max=50"\`
	Email     string \`json:"email" binding:"required,email"\`
	Password  string \`json:"password" binding:"required,min=8"\`
	FirstName string \`json:"first_name" binding:"required"\`
	LastName  string \`json:"last_name" binding:"required"\`
}

type UserUpdateRequest struct {
	FirstName string \`json:"first_name"\`
	LastName  string \`json:"last_name"\`
}

type UserResponse struct {
	ID        uint      \`json:"id"\`
	Username  string    \`json:"username"\`
	Email     string    \`json:"email"\`
	FirstName string    \`json:"first_name"\`
	LastName  string    \`json:"last_name"\`
	IsActive  bool      \`json:"is_active"\`
	CreatedAt time.Time \`json:"created_at"\`
	UpdatedAt time.Time \`json:"updated_at"\`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}`
    });

    // Auth handlers
    files.push({
      name: 'internal/handlers/auth.go',
      language: 'go',
      content: `package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"myapp/internal/models"
	"myapp/internal/utils"
)

type LoginRequest struct {
	Username string \`json:"username" binding:"required"\`
	Password string \`json:"password" binding:"required"\`
}

type LoginResponse struct {
	Token string                \`json:"token"\`
	User  models.UserResponse   \`json:"user"\`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// This is a simplified example - implement proper user lookup from database
	if req.Username == "admin" && req.Password == "admin123" {
		// Generate JWT token
		token, err := utils.GenerateJWT(req.Username, "your-secret-key")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		user := models.UserResponse{
			ID:        1,
			Username:  req.Username,
			Email:     "admin@example.com",
			FirstName: "Admin",
			LastName:  "User",
			IsActive:  true,
		}

		c.JSON(http.StatusOK, LoginResponse{
			Token: token,
			User:  user,
		})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
}

func Register(c *gin.Context) {
	var req models.UserCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user (simplified - implement proper database logic)
	user := models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  string(hashedPassword),
		FirstName: req.FirstName,
		LastName:  req.LastName,
		IsActive:  true,
	}

	c.JSON(http.StatusCreated, user.ToResponse())
}`
    });

    // JWT utilities
    files.push({
      name: 'internal/utils/jwt.go',
      language: 'go',
      content: `package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Username string \`json:"username"\`
	jwt.RegisteredClaims
}

func GenerateJWT(username, secretKey string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	
	claims := &Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

func ValidateJWT(tokenString, secretKey string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}`
    });

    // Auth middleware
    files.push({
      name: 'internal/middleware/auth.go',
      language: 'go',
      content: `package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	
	"myapp/internal/utils"
)

func AuthMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Extract token from Bearer scheme
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := utils.ValidateJWT(tokenString, secretKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("username", claims.Username)
		c.Next()
	}
}`
    });

    // Logger middleware
    files.push({
      name: 'internal/middleware/logger.go',
      language: 'go',
      content: `package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}`
    });

    // Go module file
    files.push({
      name: 'go.mod',
      language: 'text',
      content: `module myapp

go 1.21

require (
	github.com/gin-contrib/cors v1.4.0
	github.com/gin-contrib/secure v0.0.1
	github.com/gin-gonic/gin v1.9.1
	github.com/golang-jwt/jwt/v5 v5.0.0
	github.com/joho/godotenv v1.4.0
	golang.org/x/crypto v0.9.0
)

require (
	github.com/bytedance/sonic v1.9.1 // indirect
	github.com/chenzhuoyu/base64x v0.0.0-20221115062448-fe3a3abad311 // indirect
	github.com/gabriel-vasile/mimetype v1.4.2 // indirect
	github.com/gin-contrib/sse v0.1.0 // indirect
	github.com/go-playground/locales v0.14.1 // indirect
	github.com/go-playground/universal-translator v0.18.1 // indirect
	github.com/go-playground/validator/v10 v10.14.0 // indirect
	github.com/goccy/go-json v0.10.2 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/klauspost/cpuid/v2 v2.2.4 // indirect
	github.com/leodido/go-urn v1.2.4 // indirect
	github.com/mattn/go-isatty v0.0.19 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/pelletier/go-toml/v2 v2.0.8 // indirect
	github.com/twitchyliquid64/golang-asm v0.15.1 // indirect
	github.com/ugorji/go/codec v1.2.11 // indirect
	golang.org/x/arch v0.3.0 // indirect
	golang.org/x/net v0.10.0 // indirect
	golang.org/x/sys v0.8.0 // indirect
	golang.org/x/text v0.9.0 // indirect
	google.golang.org/protobuf v1.30.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)`
    });

    // Environment files
    files.push({
      name: '.env.example',
      language: 'bash',
      content: `# Server Configuration
ENVIRONMENT=development
HOST=localhost
PORT=8080

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE_HOURS=24

# CORS Origins
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8080"`
    });

    // Makefile for common tasks
    files.push({
      name: 'Makefile',
      language: 'makefile',
      content: `.PHONY: build run test clean deps tidy fmt vet

# Build the application
build:
	go build -o bin/server cmd/server/main.go

# Run the application
run:
	go run cmd/server/main.go

# Run the application with live reload (requires air)
dev:
	air

# Run tests
test:
	go test -v ./...

# Run tests with coverage
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f coverage.out

# Download dependencies
deps:
	go mod download

# Tidy up dependencies
tidy:
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Vet code
vet:
	go vet ./...

# Run linter (requires golangci-lint)
lint:
	golangci-lint run

# Install development tools
install-tools:
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Build for production
build-prod:
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/server cmd/server/main.go`
    });

    return files;
  }

  getCommands() {
    return {
      dev: 'go run cmd/server/main.go',
      start: './bin/server',
      build: 'go build -o bin/server cmd/server/main.go',
      test: 'go test -v ./...',
      lint: 'go fmt ./... && go vet ./...',
      tidy: 'go mod tidy',
      clean: 'rm -rf bin/',
      deps: 'go mod download'
    };
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '🍸 Gin Web API',
      content: `This is a production-ready Gin web API with:

- **High Performance**: Built with Go for exceptional speed and concurrency
- **Clean Architecture**: Organized with handlers, services, and repositories
- **Middleware**: Security, CORS, authentication, and logging middleware
- **JWT Authentication**: Secure token-based authentication
- **Configuration**: Environment-based configuration management
- **Database**: GORM integration for database operations

### API Endpoints:
- \`GET /health\` - Health check
- \`POST /api/v1/auth/login\` - User authentication
- \`POST /api/v1/auth/register\` - User registration
- \`GET /api/v1/users/\` - Get users (protected)
- \`GET /api/v1/users/me\` - Current user profile (protected)

### Development:
\`\`\`bash
go mod download  # Download dependencies
go run cmd/server/main.go  # Start development server
go test -v ./...  # Run tests
make build  # Build for production
make fmt && make vet  # Format and vet code
\`\`\``
    });

    if (this.config.database) {
      sections.push({
        title: '🗄️ Database Integration',
        content: `Database configuration for ${this.getDatabaseLabel()}:

- GORM ORM for database operations
- Connection pooling and migration support
- Repository pattern for data access
- Model definitions with validation tags
- Database transactions and error handling

### Setup:
1. Create your database
2. Update \`DATABASE_URL\` in \`.env\`
3. Run database migrations
4. Configure connection pool settings`
      });
    }

    return sections;
  }

  getDatabaseLabel() {
    const labels = {
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'sqlite': 'SQLite',
      'mongodb': 'MongoDB'
    };
    return labels[this.config.database] || this.config.database;
  }

  getSupportedFeatures() {
    return ['rest-api', 'high-performance', 'concurrency', 'middleware', 'authentication', 'database', 'jwt'];
  }

  getSecurityGuidelines() {
    return [
      'Always validate input using Gin binding tags',
      'Use parameterized queries with GORM to prevent SQL injection',
      'Implement rate limiting middleware',
      'Use HTTPS in production',
      'Store sensitive data in environment variables',
      'Implement proper error handling without exposing system details',
      'Use JWT tokens with appropriate expiration times',
      'Hash passwords using bcrypt',
      'Validate and sanitize all user inputs',
      'Use middleware for authentication and authorization',
      'Enable security headers in production',
      'Regularly update Go and dependencies'
    ];
  }

  getTestingStrategy() {
    return `- Unit tests for handlers, services, and repositories
- Integration tests for API endpoints
- Database tests with test database
- Mock external services using testify/mock
- Test HTTP endpoints using httptest package
- Test authentication and authorization flows
- Benchmark tests for performance-critical code
- Test database transactions and error scenarios`;
  }

  getLanguageExtension() {
    return 'go';
  }

  getTemplateVariables() {
    return {
      isGin: true,
      hasRESTAPI: true,
      isHighPerformance: true,
      hasConcurrency: true,
      hasMiddleware: true,
      hasAuthentication: this.config.authentication !== 'none',
      hasJWT: this.config.authentication === 'jwt'
    };
  }

  isCompatibleWith(otherPlugin) {
    // Gin is compatible with most plugins except other backend frameworks
    const incompatible = ['express', 'fastify', 'fastapi', 'django', 'rails'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}