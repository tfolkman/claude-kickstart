import { BasePlugin } from './base-plugin.js';

export class ExpressPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'express',
      displayName: 'Node.js + Express',
      category: 'stack',
      projectTypes: ['backend', 'fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '🚀',
      description: 'Fast, unopinionated web framework for Node.js'
    };
  }

  getDependencies() {
    const deps = ['express', 'cors', 'helmet', 'dotenv'];
    
    if (this.config.database === 'postgresql') {
      deps.push('pg');
    } else if (this.config.database === 'mongodb') {
      deps.push('mongoose');
    } else if (this.config.database === 'mysql') {
      deps.push('mysql2');
    }

    if (this.config.authentication === 'jwt') {
      deps.push('jsonwebtoken', 'bcryptjs');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = ['nodemon'];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', '@types/node', '@types/express', '@types/cors');
      
      if (this.config.authentication === 'jwt') {
        deps.push('@types/jsonwebtoken', '@types/bcryptjs');
      }
    }

    return deps;
  }

  getFileStructure() {
    const ext = this.getLanguageExtension();
    return `src/
├── controllers/
│   └── userController.${ext}
├── middleware/
│   ├── auth.${ext}
│   └── validation.${ext}
├── models/
│   └── User.${ext}
├── routes/
│   ├── auth.${ext}
│   └── users.${ext}
├── utils/
│   └── database.${ext}
├── app.${ext}
└── server.${ext}
.env
.env.example
${this.config.language === 'TypeScript' ? 'tsconfig.json' : ''}
package.json`;
  }

  getConfigFiles() {
    const files = [];
    const ext = this.getLanguageExtension();

    // Main app file
    files.push({
      name: `app.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.config.language === 'TypeScript' ? 
        this.getTypeScriptAppFile() : this.getJavaScriptAppFile()
    });

    // Server file
    files.push({
      name: `server.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.config.language === 'TypeScript' ? 
        this.getTypeScriptServerFile() : this.getJavaScriptServerFile()
    });

    // TypeScript config
    if (this.config.language === 'TypeScript') {
      files.push({
        name: 'tsconfig.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
      });
    }

    // Environment files
    files.push({
      name: '.env.example',
      language: 'bash',
      content: `# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"

# API Keys
# Add your API keys here`
    });

    return files;
  }

  getTypeScriptAppFile() {
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;`;
  }

  getJavaScriptAppFile() {
    return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;`;
  }

  getTypeScriptServerFile() {
    return `import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📍 Environment: \${process.env.NODE_ENV || 'development'}\`);
});`;
  }

  getJavaScriptServerFile() {
    return `const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📍 Environment: \${process.env.NODE_ENV || 'development'}\`);
});`;
  }

  getCommands() {
    const commands = {
      dev: 'nodemon src/server.js',
      start: 'node src/server.js',
      test: 'npm test',
      lint: 'eslint src/'
    };

    if (this.config.language === 'TypeScript') {
      commands.dev = 'nodemon --exec ts-node src/server.ts';
      commands.start = 'node dist/server.js';
      commands.build = 'tsc';
    }

    return commands;
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '🚀 Express.js API Server',
      content: `This is a production-ready Express.js API server with:

- **Security**: Helmet for security headers, CORS configuration
- **Structure**: Clean separation of concerns with controllers, middleware, and routes
- **Environment**: Proper environment variable management
- **Health Check**: Built-in health check endpoint at \`/health\`

### API Endpoints:
- \`GET /health\` - Health check
- \`POST /api/auth/login\` - User authentication
- \`GET /api/users\` - Get users (protected)

### Development:
\`\`\`bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
npm test       # Run tests
\`\`\``
    });

    if (this.config.database) {
      sections.push({
        title: '🗄️ Database Integration',
        content: `Database configuration for ${this.getDatabaseLabel()}:

- Connection string managed through environment variables
- Proper connection pooling and error handling
- Database models in \`src/models/\`
- Migration scripts (if applicable)

### Setup:
1. Create your database
2. Update \`DATABASE_URL\` in \`.env\`
3. Run migrations if using SQL database`
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
    return ['rest-api', 'middleware', 'routing', 'authentication', 'database'];
  }

  getSecurityGuidelines() {
    return [
      'Always validate and sanitize input data',
      'Use parameterized queries to prevent SQL injection',
      'Implement rate limiting for API endpoints',
      'Use HTTPS in production',
      'Store sensitive data in environment variables',
      'Implement proper error handling without exposing system details',
      'Use JWT tokens with appropriate expiration times',
      'Hash passwords using bcrypt with proper salt rounds'
    ];
  }

  getTestingStrategy() {
    return `- Unit tests for controllers and middleware
- Integration tests for API endpoints
- Database tests with test database
- Mock external services in tests
- Use supertest for HTTP assertions
- Test authentication flows thoroughly`;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'ts' : 'js';
  }

  getTemplateVariables() {
    return {
      isExpress: true,
      hasRESTAPI: true,
      hasMiddleware: true,
      hasAuthentication: this.config.authentication !== 'none'
    };
  }

  isCompatibleWith(otherPlugin) {
    // Express is compatible with most plugins except other backend frameworks
    const incompatible = ['fastify', 'django', 'rails', 'gin'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}