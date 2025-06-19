import { BasePlugin } from './base-plugin.js';

export class MEANStackPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'mean',
      displayName: 'MEAN Stack',
      category: 'stack',
      projectTypes: ['fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '🅰️',
      description: 'MongoDB, Express.js, Angular, Node.js full-stack application'
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
      '@angular/animations',
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/router',
      'rxjs',
      'tslib',
      'zone.js'
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
      '@angular-devkit/build-angular',
      '@angular/cli',
      '@angular/compiler-cli',
      'typescript',
      '@types/node'
    ];
    
    if (this.config.language === 'TypeScript') {
      deps.push(
        '@types/express',
        '@types/cors',
        '@types/bcryptjs',
        '@types/jsonwebtoken'
      );
    }

    if (this.config.testing === 'jasmine') {
      deps.push('jasmine-core', 'karma', 'karma-chrome-launcher', 'karma-coverage', 'karma-jasmine', 'karma-jasmine-html-reporter');
    }

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    return deps;
  }

  getFileStructure() {
    return `client/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   └── footer/
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── api.service.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── models/
│   │   │   └── user.model.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.module.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.scss
│   ├── main.ts
│   └── index.html
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
${this.config.styling === 'tailwind' ? '├── tailwind.config.js' : ''}
└── package.json
server/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   └── User.js
├── routes/
│   ├── auth.js
│   └── users.js
├── utils/
│   └── helpers.js
├── app.js
└── server.js
.env
.env.example
package.json`;
  }

  getConfigFiles() {
    const files = [];

    // Root package.json with scripts
    files.push({
      name: 'package.json',
      language: 'json',
      content: JSON.stringify({
        name: 'mean-app',
        version: '1.0.0',
        description: 'MEAN Stack Application',
        scripts: {
          dev: 'concurrently "npm run server" "npm run client"',
          server: 'cd server && npm run dev',
          client: 'cd client && ng serve',
          build: 'cd client && ng build',
          test: 'cd server && npm test',
          install: 'npm install && cd server && npm install && cd ../client && npm install'
        },
        devDependencies: {
          concurrently: '^8.2.2'
        }
      }, null, 2)
    });

    // Angular.json
    files.push({
      name: 'client/angular.json',
      language: 'json',
      content: `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "mean-client": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/mean-client",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/assets"],
            "styles": ["src/styles.scss"],
            "scripts": []
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "assets": ["src/assets"],
            "styles": ["src/styles.scss"],
            "scripts": []
          }
        }
      }
    }
  }
}`
    });

    // Angular proxy config for development
    files.push({
      name: 'client/proxy.conf.json',
      language: 'json',
      content: `{
  "/api/*": {
    "target": "http://localhost:5000",
    "secure": false,
    "logLevel": "debug"
  }
}`
    });

    // App module
    files.push({
      name: 'client/src/app/app.module.ts',
      language: 'typescript',
      content: `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`
    });

    // App routing
    files.push({
      name: 'client/src/app/app-routing.module.ts',
      language: 'typescript',
      content: `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }`
    });

    // TypeScript configs
    files.push({
      name: 'client/tsconfig.json',
      language: 'json',
      content: `{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`
    });

    // Server files (same as MERN but with JavaScript)
    files.push({
      name: 'server/app.js',
      language: 'javascript',
      content: `import express from 'express';
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
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
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

export default app;`
    });

    // Environment files
    files.push({
      name: '.env.example',
      language: 'bash',
      content: `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mean-app

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:4200`
    });

    return files;
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
        title: '🅰️ MEAN Stack Application',
        content: `This is a full MEAN Stack application with:

- **MongoDB** - NoSQL database for flexible data storage
- **Express.js** - Fast, minimalist web framework for Node.js
- **Angular** - Component-based frontend framework with TypeScript
- **Node.js** - JavaScript runtime for server-side development

### Project Structure:
- \`server/\` - Backend API with Express.js
- \`client/\` - Frontend Angular application
- \`server/models/\` - MongoDB models with Mongoose
- \`server/routes/\` - API endpoints
- \`client/src/app/\` - Angular components and services
- \`client/src/app/pages/\` - Page components

### Development:
\`\`\`bash
npm run install  # Install all dependencies
npm run dev      # Start both server and client
npm run server   # Start only the backend server (port 5000)
npm run client   # Start only the frontend client (port 4200)
\`\`\`

### Database Setup:
1. Install MongoDB locally or use MongoDB Atlas
2. Update \`MONGODB_URI\` in your \`.env\` file
3. The server will automatically connect on startup

### Authentication:
- JWT-based authentication with Angular guards
- Protected routes on both client and server
- Angular services for API communication
- Reactive forms for user input`
      }
    ];
  }

  getSupportedFeatures() {
    return ['mongodb', 'express', 'angular', 'jwt-auth', 'rest-api', 'spa', 'typescript'];
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
      'Implement Angular route guards',
      'Validate data on both client and server',
      'Use Angular\'s built-in XSS protection'
    ];
  }

  getTestingStrategy() {
    return `- Backend API testing with Jest and Supertest
- Frontend component testing with Jasmine and Karma
- Integration tests for API endpoints
- Angular service testing with TestBed
- Authentication flow testing
- E2E testing with Protractor or Cypress`;
  }

  getUIGuidelines() {
    let guidelines = `### MEAN Stack Best Practices:
- Use Angular services for API communication
- Implement reactive forms for user input
- Use Angular guards for route protection
- Follow Angular style guide conventions
- Implement proper error handling with observables
- Use dependency injection for service management`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with Angular:
- Use utility classes in Angular templates
- Create Angular directives for complex styling
- Implement responsive design patterns
- Use Angular's ViewEncapsulation appropriately`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return 'ts'; // MEAN Stack primarily uses TypeScript for Angular
  }

  getTemplateVariables() {
    return {
      isMEANStack: true,
      hasMongoDB: true,
      hasExpress: true,
      hasAngular: true,
      hasTypeScript: true,
      hasJWTAuth: true,
      hasFullStack: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // MEAN is a complete full-stack solution
    const incompatible = ['nextjs-app', 'nextjs-pages', 'remix', 't3', 'mern', 'express', 'fastify'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}