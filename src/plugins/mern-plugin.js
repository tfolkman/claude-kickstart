import { BasePlugin } from './base-plugin.js';

export class MERNStackPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'mern',
      displayName: 'MERN Stack',
      category: 'stack',
      projectTypes: ['fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '🍃',
      description: 'MongoDB, Express.js, React, Node.js full-stack application'
    };
  }

  getDependencies() {
    const deps = [
      // Backend dependencies
      'express',
      'mongoose',
      'cors',
      'dotenv',
      'helmet',
      'bcryptjs',
      'jsonwebtoken',
      'express-validator',
      
      // Frontend dependencies (for client folder)
      'react',
      'react-dom',
      'react-router-dom',
      'axios'
    ];

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = [
      // Backend dev dependencies
      'nodemon',
      'concurrently',
      
      // Frontend dev dependencies
      '@vitejs/plugin-react',
      'vite',
      'eslint',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks'
    ];
    
    if (this.config.language === 'TypeScript') {
      deps.push(
        'typescript',
        '@types/node',
        '@types/express',
        '@types/cors',
        '@types/bcryptjs',
        '@types/jsonwebtoken',
        '@types/react',
        '@types/react-dom'
      );
    }

    if (this.config.testing === 'jest') {
      deps.push('jest', 'supertest', '@testing-library/react', '@testing-library/jest-dom');
    } else if (this.config.testing === 'vitest') {
      deps.push('vitest', '@testing-library/react', 'jsdom');
    }

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    return deps;
  }

  getFileStructure() {
    const ext = this.getLanguageExtension();
    return `client/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.${ext}
│   │   │   └── Register.${ext}
│   │   ├── Layout/
│   │   │   ├── Header.${ext}
│   │   │   └── Footer.${ext}
│   │   └── ui/
│   ├── pages/
│   │   ├── Home.${ext}
│   │   ├── Dashboard.${ext}
│   │   └── Profile.${ext}
│   ├── hooks/
│   │   └── useAuth.${ext}
│   ├── services/
│   │   └── api.${ext}
│   ├── utils/
│   │   └── helpers.${ext}
│   ├── styles/
│   │   └── index.css
│   ├── App.${ext}
│   └── main.${ext}
├── public/
│   └── index.html
├── vite.config.${this.config.language === 'TypeScript' ? 'ts' : 'js'}
${this.config.language === 'TypeScript' ? '├── tsconfig.json' : ''}
${this.config.styling === 'tailwind' ? '├── tailwind.config.js' : ''}
└── package.json
server/
├── config/
│   └── database.${this.getServerExtension()}
├── controllers/
│   ├── authController.${this.getServerExtension()}
│   └── userController.${this.getServerExtension()}
├── middleware/
│   ├── auth.${this.getServerExtension()}
│   └── validation.${this.getServerExtension()}
├── models/
│   └── User.${this.getServerExtension()}
├── routes/
│   ├── auth.${this.getServerExtension()}
│   └── users.${this.getServerExtension()}
├── utils/
│   └── helpers.${this.getServerExtension()}
├── app.${this.getServerExtension()}
└── server.${this.getServerExtension()}
.env
.env.example
package.json`;
  }

  getConfigFiles() {
    const files = [];
    const ext = this.getLanguageExtension();
    const serverExt = this.getServerExtension();

    // Root package.json with scripts
    files.push({
      name: 'package.json',
      language: 'json',
      content: JSON.stringify({
        name: 'mern-app',
        version: '1.0.0',
        description: 'MERN Stack Application',
        scripts: {
          dev: 'concurrently "npm run server" "npm run client"',
          server: 'cd server && npm run dev',
          client: 'cd client && npm run dev',
          build: 'cd client && npm run build',
          test: 'cd server && npm test',
          install: 'npm install && cd server && npm install && cd ../client && npm install'
        },
        devDependencies: {
          concurrently: '^8.2.2'
        }
      }, null, 2)
    });

    // Server package.json
    files.push({
      name: 'server/package.json',
      language: 'json',
      content: JSON.stringify({
        name: 'mern-server',
        version: '1.0.0',
        type: 'module',
        scripts: {
          start: 'node server.js',
          dev: 'nodemon server.js',
          test: 'jest'
        }
      }, null, 2)
    });

    // Client package.json
    files.push({
      name: 'client/package.json',
      language: 'json',
      content: JSON.stringify({
        name: 'mern-client',
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'eslint src --ext ts,tsx,js,jsx'
        }
      }, null, 2)
    });

    // Server app.js
    files.push({
      name: `server/app.${serverExt}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getServerAppFile()
    });

    // Server entry point
    files.push({
      name: `server/server.${serverExt}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getServerEntryFile()
    });

    // Database configuration
    files.push({
      name: `server/config/database.${serverExt}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getDatabaseConfig()
    });

    // User model
    files.push({
      name: `server/models/User.${serverExt}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getUserModel()
    });

    // Client Vite config
    files.push({
      name: `client/vite.config.${this.config.language === 'TypeScript' ? 'ts' : 'js'}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getViteConfig()
    });

    // Client App component
    files.push({
      name: `client/src/App.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getAppComponent()
    });

    // Client main entry
    files.push({
      name: `client/src/main.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getMainFile()
    });

    // TypeScript configs
    if (this.config.language === 'TypeScript') {
      files.push({
        name: 'server/tsconfig.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./",
    "types": ["node"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}`
      });

      files.push({
        name: 'client/tsconfig.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`
      });
    }

    // Tailwind config
    if (this.config.styling === 'tailwind') {
      files.push({
        name: 'client/tailwind.config.js',
        language: 'javascript',
        content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
      });
    }

    // Environment files
    files.push({
      name: '.env.example',
      language: 'bash',
      content: `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mern-app

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000`
    });

    return files;
  }

  getServerAppFile() {
    if (this.config.language === 'TypeScript') {
      return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// Connect to database
connectDB();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;`;
    } else {
      return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;`;
    }
  }

  getServerEntryFile() {
    return `import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📍 Environment: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`🔗 Health check: http://localhost:\${PORT}/api/health\`);
});`;
  }

  getDatabaseConfig() {
    if (this.config.language === 'TypeScript') {
      return `import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app');
    console.log(\`📊 MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};`;
    } else {
      return `import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app');
    console.log(\`📊 MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};`;
    }
  }

  getUserModel() {
    return `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);`;
  }

  getViteConfig() {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})`;
  }

  getAppComponent() {
    const imports = ['import { BrowserRouter as Router, Routes, Route } from "react-router-dom"'];
    
    if (this.config.styling === 'tailwind') {
      imports.push('import "./styles/index.css"');
    }

    return `${imports.join('\n')}
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Header from './components/Layout/Header'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main${this.config.styling === 'tailwind' ? ' className="container mx-auto px-4 py-8"' : ''}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App`;
  }

  getMainFile() {
    return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  }

  getCommands() {
    return {
      dev: 'npm run dev',
      server: 'npm run server', 
      client: 'npm run client',
      build: 'npm run build',
      test: 'npm test',
      install: 'npm run install'
    };
  }

  getMarkdownSections() {
    return [
      {
        title: '🍃 MERN Stack Application',
        content: `This is a full MERN Stack application with:

- **MongoDB** - NoSQL database for flexible data storage
- **Express.js** - Fast, minimalist web framework for Node.js
- **React** - Component-based frontend library
- **Node.js** - JavaScript runtime for server-side development

### Project Structure:
- \`server/\` - Backend API with Express.js
- \`client/\` - Frontend React application
- \`server/models/\` - MongoDB models with Mongoose
- \`server/routes/\` - API endpoints
- \`client/src/components/\` - React components
- \`client/src/pages/\` - Page components

### Development:
\`\`\`bash
npm run install  # Install all dependencies
npm run dev      # Start both server and client
npm run server   # Start only the backend server
npm run client   # Start only the frontend client
\`\`\`

### Database Setup:
1. Install MongoDB locally or use MongoDB Atlas
2. Update \`MONGODB_URI\` in your \`.env\` file
3. The server will automatically connect on startup

### Authentication:
- JWT-based authentication
- Protected routes on both client and server
- Password hashing with bcrypt
- User registration and login flows`
      }
    ];
  }

  getSupportedFeatures() {
    return ['mongodb', 'express', 'react', 'jwt-auth', 'rest-api', 'spa'];
  }

  getSecurityGuidelines() {
    return [
      'Always validate and sanitize user inputs',
      'Use environment variables for sensitive data',
      'Implement rate limiting on API endpoints',
      'Use HTTPS in production',
      'Enable CORS only for trusted origins',
      'Hash passwords with bcrypt',
      'Use secure JWT secrets',
      'Implement proper error handling',
      'Validate data on both client and server',
      'Use MongoDB connection security features'
    ];
  }

  getTestingStrategy() {
    return `- Backend API testing with Jest and Supertest
- Frontend component testing with React Testing Library
- Integration tests for API endpoints
- Database testing with MongoDB Memory Server
- Authentication flow testing
- Mock external dependencies`;
  }

  getUIGuidelines() {
    let guidelines = `### MERN Stack Best Practices:
- Separate concerns between client and server
- Use React hooks for state management
- Implement proper error boundaries
- Use React Router for client-side routing
- Create reusable UI components
- Implement loading and error states`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with React:
- Use utility classes for responsive design
- Create component variants with conditional classes
- Implement a consistent design system
- Use Tailwind's color palette and spacing`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'tsx' : 'jsx';
  }

  getServerExtension() {
    return this.config.language === 'TypeScript' ? 'ts' : 'js';
  }

  getTemplateVariables() {
    return {
      isMERNStack: true,
      hasMongoDB: true,
      hasExpress: true,
      hasReact: true,
      hasJWTAuth: true,
      hasFullStack: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // MERN is a complete full-stack solution
    const incompatible = ['nextjs-app', 'nextjs-pages', 'remix', 't3', 'mean', 'express', 'fastify'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}