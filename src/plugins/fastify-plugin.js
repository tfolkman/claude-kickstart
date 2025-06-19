import { BasePlugin } from './base-plugin.js';

export class FastifyPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'fastify',
      displayName: 'Node.js + Fastify',
      category: 'stack',
      projectTypes: ['backend', 'fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '⚡',
      description: 'Fast and low overhead web framework for Node.js'
    };
  }

  getDependencies() {
    const deps = ['fastify', '@fastify/cors', '@fastify/helmet', '@fastify/env', '@fastify/sensible'];
    
    if (this.config.database === 'postgresql') {
      deps.push('pg', '@fastify/postgres');
    } else if (this.config.database === 'mongodb') {
      deps.push('mongoose', '@fastify/mongodb');
    } else if (this.config.database === 'mysql') {
      deps.push('mysql2');
    }

    if (this.config.authentication === 'jwt') {
      deps.push('@fastify/jwt', 'bcryptjs');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = ['nodemon', 'tap'];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', '@types/node', 'ts-node');
      
      if (this.config.authentication === 'jwt') {
        deps.push('@types/bcryptjs');
      }
    }

    return deps;
  }

  getFileStructure() {
    const ext = this.getLanguageExtension();
    return `src/
├── controllers/
│   └── userController.${ext}
├── plugins/
│   ├── auth.${ext}
│   ├── database.${ext}
│   └── sensible.${ext}
├── routes/
│   ├── auth.${ext}
│   └── users.${ext}
├── schemas/
│   └── userSchema.${ext}
├── models/
│   └── User.${ext}
├── hooks/
│   └── authentication.${ext}
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
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
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
HOST=localhost
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"

# API Keys
# Add your API keys here`
    });

    return files;
  }

  getTypeScriptAppFile() {
    return `import Fastify, { FastifyInstance } from 'fastify';

export default async function buildApp(opts = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: 'info',
      serializers: {
        req: (request) => {
          return {
            method: request.method,
            url: request.url,
            headers: request.headers,
            hostname: request.hostname,
            remoteAddress: request.ip,
            remotePort: request.connection?.remotePort,
          };
        }
      }
    },
    ...opts
  });

  // Register plugins
  await app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: false
  });
  
  await app.register(import('@fastify/cors'), {
    origin: process.env.NODE_ENV === 'production' ? false : true
  });

  await app.register(import('@fastify/sensible'));

  // Environment variables
  await app.register(import('@fastify/env'), {
    schema: {
      type: 'object',
      required: ['PORT'],
      properties: {
        PORT: {
          type: 'string',
          default: '3000'
        },
        HOST: {
          type: 'string',
          default: 'localhost'
        },
        NODE_ENV: {
          type: 'string',
          default: 'development'
        }
      }
    }
  });

  // Authentication plugin
  if (process.env.JWT_SECRET) {
    await app.register(import('@fastify/jwt'), {
      secret: process.env.JWT_SECRET
    });
  }

  // Register routes
  await app.register(import('./routes/auth'), { prefix: '/api/auth' });
  await app.register(import('./routes/users'), { prefix: '/api/users' });

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  // Global error handler
  app.setErrorHandler(async (error, request, reply) => {
    app.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation
      });
    }

    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    
    return reply.status(statusCode).send({
      error: message,
      statusCode
    });
  });

  return app;
}`;
  }

  getJavaScriptAppFile() {
    return `const fastify = require('fastify');

async function buildApp(opts = {}) {
  const app = fastify({
    logger: {
      level: 'info',
      serializers: {
        req: (request) => {
          return {
            method: request.method,
            url: request.url,
            headers: request.headers,
            hostname: request.hostname,
            remoteAddress: request.ip,
            remotePort: request.connection?.remotePort,
          };
        }
      }
    },
    ...opts
  });

  // Register plugins
  await app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: false
  });
  
  await app.register(require('@fastify/cors'), {
    origin: process.env.NODE_ENV === 'production' ? false : true
  });

  await app.register(require('@fastify/sensible'));

  // Environment variables
  await app.register(require('@fastify/env'), {
    schema: {
      type: 'object',
      required: ['PORT'],
      properties: {
        PORT: {
          type: 'string',
          default: '3000'
        },
        HOST: {
          type: 'string',
          default: 'localhost'
        },
        NODE_ENV: {
          type: 'string',
          default: 'development'
        }
      }
    }
  });

  // Authentication plugin
  if (process.env.JWT_SECRET) {
    await app.register(require('@fastify/jwt'), {
      secret: process.env.JWT_SECRET
    });
  }

  // Register routes
  await app.register(require('./routes/auth'), { prefix: '/api/auth' });
  await app.register(require('./routes/users'), { prefix: '/api/users' });

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  // Global error handler
  app.setErrorHandler(async (error, request, reply) => {
    app.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation
      });
    }

    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    
    return reply.status(statusCode).send({
      error: message,
      statusCode
    });
  });

  return app;
}

module.exports = buildApp;`;
  }

  getTypeScriptServerFile() {
    return `import buildApp from './app';

const start = async () => {
  try {
    const app = await buildApp();
    
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || 'localhost';
    
    await app.listen({ port, host });
    app.log.info(\`⚡ Fastify server running on http://\${host}:\${port}\`);
    app.log.info(\`📍 Environment: \${process.env.NODE_ENV || 'development'}\`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();`;
  }

  getJavaScriptServerFile() {
    return `const buildApp = require('./app');

const start = async () => {
  try {
    const app = await buildApp();
    
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || 'localhost';
    
    await app.listen({ port, host });
    app.log.info(\`⚡ Fastify server running on http://\${host}:\${port}\`);
    app.log.info(\`📍 Environment: \${process.env.NODE_ENV || 'development'}\`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();`;
  }

  getCommands() {
    const commands = {
      dev: 'nodemon src/server.js',
      start: 'node src/server.js',
      test: 'tap test/**/*.test.js',
      lint: 'eslint src/'
    };

    if (this.config.language === 'TypeScript') {
      commands.dev = 'nodemon --exec ts-node src/server.ts';
      commands.start = 'node dist/server.js';
      commands.build = 'tsc';
      commands.test = 'tap test/**/*.test.ts';
    }

    return commands;
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '⚡ Fastify API Server',
      content: `This is a production-ready Fastify API server with:

- **Performance**: Built for speed with low overhead
- **Plugin System**: Modular architecture with Fastify plugins
- **Validation**: Built-in JSON schema validation
- **Security**: Helmet for security headers, CORS configuration
- **Logging**: Structured logging with request/response serialization
- **Environment**: Proper environment variable management with validation

### API Endpoints:
- \`GET /health\` - Health check
- \`POST /api/auth/login\` - User authentication
- \`GET /api/users\` - Get users (protected)

### Development:
\`\`\`bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
npm test       # Run tests with tap
npm run build  # Build TypeScript (if applicable)
\`\`\``
    });

    if (this.config.database) {
      sections.push({
        title: '🗄️ Database Integration',
        content: `Database configuration for ${this.getDatabaseLabel()}:

- Fastify-specific database plugins for optimal performance
- Connection pooling and proper error handling
- Database models in \`src/models/\`
- Schema validation for database operations

### Setup:
1. Create your database
2. Update \`DATABASE_URL\` in \`.env\`
3. Register database plugin in app configuration`
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
    return ['rest-api', 'plugins', 'validation', 'routing', 'authentication', 'database', 'high-performance'];
  }

  getSecurityGuidelines() {
    return [
      'Always validate input using Fastify JSON schemas',
      'Use parameterized queries to prevent SQL injection',
      'Implement rate limiting using @fastify/rate-limit',
      'Use HTTPS in production',
      'Store sensitive data in environment variables',
      'Implement proper error handling without exposing system details',
      'Use JWT tokens with appropriate expiration times',
      'Hash passwords using bcrypt with proper salt rounds',
      'Leverage Fastify hooks for authentication and authorization',
      'Use @fastify/helmet for security headers'
    ];
  }

  getTestingStrategy() {
    return `- Unit tests for route handlers and plugins
- Integration tests for API endpoints using Fastify.inject()
- Database tests with test database
- Mock external services in tests
- Use tap for testing (Fastify's recommended test runner)
- Test plugin registration and lifecycle
- Validate JSON schemas in tests`;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'ts' : 'js';
  }

  getTemplateVariables() {
    return {
      isFastify: true,
      hasRESTAPI: true,
      hasPluginSystem: true,
      hasValidation: true,
      hasAuthentication: this.config.authentication !== 'none',
      isHighPerformance: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Fastify is compatible with most plugins except other backend frameworks
    const incompatible = ['express', 'django', 'rails', 'gin'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}