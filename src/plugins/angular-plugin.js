import { BasePlugin } from './base-plugin.js';

export class AngularPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'angular',
      displayName: 'Angular',
      category: 'stack',
      projectTypes: ['frontend', 'fullstack'],
      languages: ['TypeScript'],
      icon: '🅰️',
      description: 'The modern web developer\'s platform'
    };
  }

  getDependencies() {
    return {
      production: [
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
      ],
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = [
      '@angular-devkit/build-angular',
      '@angular/cli',
      '@angular/compiler-cli',
      '@types/jasmine',
      '@types/node',
      'jasmine-core',
      'karma',
      'karma-chrome-headless',
      'karma-coverage',
      'karma-jasmine',
      'karma-jasmine-html-reporter',
      'typescript'
    ];

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    if (this.config.testing === 'jest') {
      deps.push('jest', '@types/jest', 'jest-preset-angular');
    }

    return deps;
  }

  getFileStructure() {
    return `src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── http-error.interceptor.ts
│   │   ├── services/
│   │   │   └── api.service.ts
│   │   └── core.module.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   ├── button.component.html
│   │   │   │   └── button.component.scss
│   │   │   └── input/
│   │   │       ├── input.component.ts
│   │   │       ├── input.component.html
│   │   │       └── input.component.scss
│   │   ├── pipes/
│   │   │   └── truncate.pipe.ts
│   │   └── shared.module.ts
│   ├── features/
│   │   ├── home/
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   └── home.component.scss
│   │   └── about/
│   │       ├── about.component.ts
│   │       ├── about.component.html
│   │       └── about.component.scss
│   ├── layout/
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.scss
│   │   └── footer/
│   │       ├── footer.component.ts
│   │       ├── footer.component.html
│   │       └── footer.component.scss
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   └── app.module.ts
├── assets/
│   └── images/
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
├── styles.scss
├── main.ts
└── index.html
angular.json
tsconfig.json
tsconfig.app.json
tsconfig.spec.json
${this.config.styling === 'tailwind' ? 'tailwind.config.js' : ''}
package.json`;
  }

  getConfigFiles() {
    const files = [];

    // Angular.json
    files.push({
      name: 'angular.json',
      language: 'json',
      content: this.getAngularJson()
    });

    // Main module
    files.push({
      name: 'src/app/app.module.ts',
      language: 'typescript',
      content: this.getAppModule()
    });

    // App component
    files.push({
      name: 'src/app/app.component.ts',
      language: 'typescript',
      content: this.getAppComponent()
    });

    files.push({
      name: 'src/app/app.component.html',
      language: 'html',
      content: this.getAppComponentTemplate()
    });

    files.push({
      name: 'src/app/app.component.scss',
      language: 'scss',
      content: this.getAppComponentStyles()
    });

    // Routing module
    files.push({
      name: 'src/app/app-routing.module.ts',
      language: 'typescript',
      content: this.getRoutingModule()
    });

    // Home component
    files.push({
      name: 'src/app/features/home/home.component.ts',
      language: 'typescript',
      content: this.getHomeComponent()
    });

    files.push({
      name: 'src/app/features/home/home.component.html',
      language: 'html',
      content: this.getHomeComponentTemplate()
    });

    files.push({
      name: 'src/app/features/home/home.component.scss',
      language: 'scss',
      content: ''
    });

    // About component
    files.push({
      name: 'src/app/features/about/about.component.ts',
      language: 'typescript',
      content: this.getAboutComponent()
    });

    files.push({
      name: 'src/app/features/about/about.component.html',
      language: 'html',
      content: this.getAboutComponentTemplate()
    });

    files.push({
      name: 'src/app/features/about/about.component.scss',
      language: 'scss',
      content: ''
    });

    // Shared module
    files.push({
      name: 'src/app/shared/shared.module.ts',
      language: 'typescript',
      content: this.getSharedModule()
    });

    // Core module
    files.push({
      name: 'src/app/core/core.module.ts',
      language: 'typescript',
      content: this.getCoreModule()
    });

    // Main entry point
    files.push({
      name: 'src/main.ts',
      language: 'typescript',
      content: this.getMainFile()
    });

    // Index.html
    files.push({
      name: 'src/index.html',
      language: 'html',
      content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>`
    });

    // Environment files
    files.push({
      name: 'src/environments/environment.ts',
      language: 'typescript',
      content: `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};`
    });

    files.push({
      name: 'src/environments/environment.prod.ts',
      language: 'typescript',
      content: `export const environment = {
  production: true,
  apiUrl: '/api'
};`
    });

    // TypeScript configurations
    files.push({
      name: 'tsconfig.json',
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
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`
    });

    files.push({
      name: 'tsconfig.app.json',
      language: 'json',
      content: `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}`
    });

    files.push({
      name: 'tsconfig.spec.json',
      language: 'json',
      content: `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}`
    });

    // Global styles
    if (this.config.styling === 'tailwind') {
      files.push({
        name: 'src/styles.scss',
        language: 'scss',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }`
      });

      files.push({
        name: 'tailwind.config.js',
        language: 'javascript',
        content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`
      });
    } else {
      files.push({
        name: 'src/styles.scss',
        language: 'scss',
        content: `/* Global styles */
html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }`
      });
    }

    return files;
  }

  getAngularJson() {
    const styleExt = this.config.styling === 'tailwind' ? 'scss' : 'scss';
    return `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "angular-app": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "${styleExt}"
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/angular-app",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": [],
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.${styleExt}"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "angular-app:build:production"
            },
            "development": {
              "buildTarget": "angular-app:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "buildTarget": "angular-app:build"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": [],
            "tsConfig": "tsconfig.spec.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.${styleExt}"
            ],
            "scripts": []
          }
        }
      }
    }
  },
  "cli": {
    "analytics": false
  }
}`;
  }

  getAppModule() {
    return `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`;
  }

  getAppComponent() {
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular App';
}`;
  }

  getAppComponentTemplate() {
    return `<div class="app">
  <header class="app-header">
    <nav class="nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
      <a routerLink="/about" routerLinkActive="active">About</a>
    </nav>
  </header>
  
  <main class="main-content">
    <router-outlet></router-outlet>
  </main>
</div>`;
  }

  getAppComponentStyles() {
    if (this.config.styling === 'tailwind') {
      return `.app {
  @apply min-h-screen flex flex-col;
}

.app-header {
  @apply bg-blue-600 text-white shadow-lg;
}

.nav {
  @apply container mx-auto px-4 py-4 flex space-x-6;
}

.nav a {
  @apply text-white hover:text-blue-200 transition-colors;
}

.nav a.active {
  @apply text-blue-200 font-semibold;
}

.main-content {
  @apply flex-1 container mx-auto px-4 py-8;
}`;
    } else {
      return `.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #1976d2;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  gap: 1.5rem;
}

.nav a {
  color: white;
  text-decoration: none;
  transition: color 0.2s;
}

.nav a:hover {
  color: #bbdefb;
}

.nav a.active {
  color: #bbdefb;
  font-weight: 600;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}`;
    }
  }

  getRoutingModule() {
    return `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }`;
  }

  getHomeComponent() {
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  counter = 0;

  increment(): void {
    this.counter++;
  }

  decrement(): void {
    this.counter--;
  }
}`;
  }

  getHomeComponentTemplate() {
    if (this.config.styling === 'tailwind') {
      return `<div class="text-center">
  <h1 class="text-4xl font-bold text-gray-900 mb-8">
    Welcome to <span class="text-blue-600">Angular</span>
  </h1>
  
  <p class="text-lg text-gray-600 mb-8">
    This is a modern Angular application with TypeScript and best practices.
  </p>

  <div class="bg-white rounded-lg shadow-md p-6 inline-block">
    <h2 class="text-2xl font-semibold mb-4">Counter: {{ counter }}</h2>
    <div class="space-x-4">
      <button 
        (click)="decrement()" 
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Decrement
      </button>
      <button 
        (click)="increment()" 
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Increment
      </button>
    </div>
  </div>
</div>`;
    } else {
      return `<div class="home-container">
  <h1>Welcome to <span class="highlight">Angular</span></h1>
  
  <p class="subtitle">
    This is a modern Angular application with TypeScript and best practices.
  </p>

  <div class="counter-card">
    <h2>Counter: {{ counter }}</h2>
    <div class="button-group">
      <button (click)="decrement()" class="btn btn-danger">Decrement</button>
      <button (click)="increment()" class="btn btn-primary">Increment</button>
    </div>
  </div>
</div>`;
    }
  }

  getAboutComponent() {
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  features = [
    'TypeScript support',
    'Component-based architecture',
    'Dependency injection',
    'RxJS for reactive programming',
    'Angular CLI for development',
    'Built-in testing framework'
  ];
}`;
  }

  getAboutComponentTemplate() {
    if (this.config.styling === 'tailwind') {
      return `<div class="max-w-4xl mx-auto">
  <h1 class="text-4xl font-bold text-gray-900 mb-8">About This App</h1>
  
  <div class="prose prose-lg">
    <p class="text-gray-600 mb-6">
      This Angular application demonstrates modern web development practices with TypeScript,
      component-based architecture, and enterprise-ready patterns.
    </p>

    <h2 class="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <li 
        *ngFor="let feature of features" 
        class="flex items-center p-3 bg-blue-50 rounded-lg"
      >
        <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
        {{ feature }}
      </li>
    </ul>
  </div>
</div>`;
    } else {
      return `<div class="about-container">
  <h1>About This App</h1>
  
  <p class="description">
    This Angular application demonstrates modern web development practices with TypeScript,
    component-based architecture, and enterprise-ready patterns.
  </p>

  <h2>Features</h2>
  <ul class="features-list">
    <li *ngFor="let feature of features" class="feature-item">
      <span class="bullet"></span>
      {{ feature }}
    </li>
  </ul>
</div>`;
    }
  }

  getSharedModule() {
    return `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }`;
  }

  getCoreModule() {
    return `import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Add core services and interceptors here
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}`;
  }

  getMainFile() {
    return `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));`;
  }

  getCommands() {
    return {
      dev: 'ng serve',
      build: 'ng build',
      test: 'ng test',
      'test:headless': 'ng test --watch=false --browsers=ChromeHeadless',
      lint: 'ng lint',
      'e2e': 'ng e2e'
    };
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '🅰️ Angular Application',
      content: `This is a modern Angular application built with:

- **Angular CLI**: Official command-line interface for Angular
- **TypeScript**: Strongly typed JavaScript superset
- **RxJS**: Reactive programming with observables
- **Angular Router**: Client-side routing for single-page application
- **Dependency Injection**: Built-in dependency injection system
- **Zone.js**: Change detection and async operations

### Project Structure:
- \`src/app/core/\` - Core services, guards, and interceptors
- \`src/app/shared/\` - Shared components, pipes, and modules
- \`src/app/features/\` - Feature-specific components and modules
- \`src/app/layout/\` - Layout components (header, footer, etc.)
- \`src/environments/\` - Environment-specific configurations

### Development:
\`\`\`bash
ng serve        # Start development server
ng build        # Build for production
ng test         # Run unit tests
ng lint         # Run linting
\`\`\``
    });

    sections.push({
      title: '🔷 TypeScript Integration',
      content: `This Angular project is built with TypeScript from the ground up:

- Strong typing for components, services, and models
- Advanced TypeScript features like decorators
- Strict mode enabled for better code quality
- IntelliSense support in modern IDEs

### Usage Example:
\`\`\`typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-card',
  template: \`
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <button (click)="onEdit()">Edit</button>
    </div>
  \`
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() edit = new EventEmitter<User>();

  onEdit(): void {
    this.edit.emit(this.user);
  }
}
\`\`\``
    });

    if (this.config.styling === 'tailwind') {
      sections.push({
        title: '🎨 Tailwind CSS Integration',
        content: `Tailwind CSS is fully configured for this Angular project:

- Utility-first CSS framework
- Optimized for Angular build process
- Component styling with utility classes
- Responsive design utilities

### Usage Example:
\`\`\`typescript
@Component({
  selector: 'app-button',
  template: \`
    <button 
      [class]="buttonClasses"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </button>
  \`
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get buttonClasses(): string {
    const base = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
    const variants = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500'
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    return \`\${base} \${variants[this.variant]} \${sizes[this.size]}\`;
  }
}
\`\`\``
      });
    }

    return sections;
  }

  getSupportedFeatures() {
    return ['spa', 'components', 'services', 'routing', 'dependency-injection', 'reactive'];
  }

  getSecurityGuidelines() {
    return [
      'Sanitize user inputs to prevent XSS attacks',
      'Use Angular\'s built-in sanitization features',
      'Implement Content Security Policy (CSP)',
      'Validate data on both client and server side',
      'Use environment variables for configuration',
      'Implement proper authentication guards',
      'Keep dependencies updated',
      'Use HTTPS in production',
      'Implement proper error handling',
      'Use Angular\'s HttpInterceptor for security headers'
    ];
  }

  getTestingStrategy() {
    return `- Unit tests with Jasmine and Karma
- Component testing with TestBed
- Service testing with dependency injection mocking
- Integration tests for user flows
- E2E tests with Protractor or Cypress
- Test Angular pipes and directives
- Mock HTTP calls with HttpClientTestingModule
- Test routing and navigation`;
  }

  getUIGuidelines() {
    let guidelines = `### Angular Best Practices:
- Use OnPush change detection strategy for performance
- Implement proper component lifecycle hooks
- Create reusable component library
- Use reactive forms for complex forms
- Implement proper error handling
- Follow Angular style guide conventions
- Use lazy loading for feature modules
- Implement proper state management (NgRx for complex apps)`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with Angular:
- Use [class] binding for dynamic classes
- Create component variants with getters
- Build a design system with Angular + Tailwind
- Implement responsive design patterns
- Use Angular's property binding with Tailwind classes`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return 'ts'; // Angular only supports TypeScript
  }

  getTemplateVariables() {
    return {
      isAngular: true,
      hasRouting: true,
      hasComponents: true,
      hasDependencyInjection: true,
      hasServices: true,
      usesTypeScript: true,
      hasModules: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Angular can work with various backends but not with other frontend frameworks
    const incompatible = ['react', 'vue', 'svelte'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}