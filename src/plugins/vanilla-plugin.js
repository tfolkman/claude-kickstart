import { BasePlugin } from './base-plugin.js';

export class VanillaPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'vanilla',
      displayName: 'Vanilla JS',
      category: 'stack',
      projectTypes: ['frontend'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '🍦',
      description: 'Pure JavaScript with modern tooling'
    };
  }

  getDependencies() {
    return {
      production: [],
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = ['vite', 'eslint'];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', '@types/node');
    }

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    if (this.config.testing === 'vitest') {
      deps.push('vitest', 'jsdom', '@testing-library/dom', '@testing-library/user-event');
    } else if (this.config.testing === 'jest') {
      deps.push('jest', 'jsdom', '@testing-library/dom', '@testing-library/user-event');
    }

    // Add additional common utilities
    if (this.config.utilities) {
      if (this.config.utilities.includes('lodash')) {
        deps.push('lodash');
        if (this.config.language === 'TypeScript') {
          deps.push('@types/lodash');
        }
      }
      if (this.config.utilities.includes('axios')) {
        deps.push('axios');
      }
    }

    return deps;
  }

  getFileStructure() {
    const ext = this.getLanguageExtension();
    return `src/
├── components/
│   ├── ui/
│   │   ├── Button.${ext}
│   │   └── Input.${ext}
│   ├── Layout.${ext}
│   └── Header.${ext}
├── pages/
│   ├── Home.${ext}
│   ├── About.${ext}
│   └── NotFound.${ext}
├── utils/
│   ├── dom.${ext}
│   ├── storage.${ext}
│   └── helpers.${ext}
├── services/
│   └── api.${ext}
├── styles/
│   ├── main.css
│   ├── components.css
│   └── utilities.css
├── assets/
│   ├── images/
│   └── icons/
├── router.${ext}
├── app.${ext}
└── main.${ext}
public/
├── index.html
└── favicon.ico
vite.config.${ext}
${this.config.language === 'TypeScript' ? 'tsconfig.json' : ''}
${this.config.styling === 'tailwind' ? 'tailwind.config.js' : ''}
package.json`;
  }

  getConfigFiles() {
    const files = [];
    const ext = this.getLanguageExtension();
    const isTypeScript = this.config.language === 'TypeScript';

    // Vite config
    files.push({
      name: `vite.config.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getViteConfig()
    });

    // Main entry point
    files.push({
      name: `src/main.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getMainFile()
    });

    // App module
    files.push({
      name: `src/app.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getAppModule()
    });

    // Router
    files.push({
      name: `src/router.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getRouter()
    });

    // Home page
    files.push({
      name: `src/pages/Home.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getHomePage()
    });

    // About page
    files.push({
      name: `src/pages/About.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getAboutPage()
    });

    // Button component
    files.push({
      name: `src/components/ui/Button.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getButtonComponent()
    });

    // Layout component
    files.push({
      name: `src/components/Layout.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getLayoutComponent()
    });

    // DOM utilities
    files.push({
      name: `src/utils/dom.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getDomUtils()
    });

    // Storage utilities
    files.push({
      name: `src/utils/storage.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getStorageUtils()
    });

    // API service
    files.push({
      name: `src/services/api.${ext}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getApiService()
    });

    // HTML template
    files.push({
      name: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanilla JS App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>`
    });

    // CSS files
    if (this.config.styling === 'tailwind') {
      files.push({
        name: 'src/styles/main.css',
        language: 'css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}`
      });
    } else {
      files.push({
        name: 'src/styles/main.css',
        language: 'css',
        content: `/* Reset and base styles */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Utility classes */
.hidden {
  display: none;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}

.align-center {
  align-items: center;
}

.space-between {
  justify-content: space-between;
}

.gap-1 {
  gap: 0.5rem;
}

.gap-2 {
  gap: 1rem;
}

.mt-1 {
  margin-top: 0.5rem;
}

.mt-2 {
  margin-top: 1rem;
}

.mb-1 {
  margin-bottom: 0.5rem;
}

.mb-2 {
  margin-bottom: 1rem;
}

.p-1 {
  padding: 0.5rem;
}

.p-2 {
  padding: 1rem;
}

.px-2 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}`
      });

      files.push({
        name: 'src/styles/components.css',
        language: 'css',
        content: `/* Component styles */
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  text-align: center;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.header {
  background-color: #1f2937;
  color: white;
  padding: 1rem 0;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav a.active {
  background-color: rgba(255, 255, 255, 0.2);
}`
      });
    }

    // TypeScript configuration
    if (isTypeScript) {
      files.push({
        name: 'tsconfig.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}`
      });

      files.push({
        name: 'src/vite-env.d.ts',
        language: 'typescript',
        content: `/// <reference types="vite/client" />`
      });
    }

    // Tailwind configuration
    if (this.config.styling === 'tailwind') {
      files.push({
        name: 'tailwind.config.js',
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

      files.push({
        name: 'postcss.config.js',
        language: 'javascript',
        content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
      });
    }

    return files;
  }

  getViteConfig() {
    const isTypeScript = this.config.language === 'TypeScript';
    return `import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets'
  }
})`;
  }

  getMainFile() {
    const isTypeScript = this.config.language === 'TypeScript';
    return `import './styles/main.css'${this.config.styling !== 'tailwind' ? "\nimport './styles/components.css'" : ''}
import { App } from './app${isTypeScript ? '' : '.js'}'

const app = new App()
app.mount('#app')`;
  }

  getAppModule() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotations = isTypeScript ? {
      appElement: ': HTMLElement | null',
      mount: '(selector: string): void',
      unmount: '(): void'
    } : {
      appElement: '',
      mount: '',
      unmount: ''
    };

    return `import { Router } from './router${isTypeScript ? '' : '.js'}'
import { Layout } from './components/Layout${isTypeScript ? '' : '.js'}'

export class App {
  private router${isTypeScript ? ': Router' : ''}
  private layout${isTypeScript ? ': Layout' : ''}
  private appElement${typeAnnotations.appElement} = null

  constructor() {
    this.router = new Router()
    this.layout = new Layout()
    this.init()
  }

  private init()${isTypeScript ? ': void' : ''} {
    // Initialize app-wide functionality
    this.setupEventListeners()
  }

  private setupEventListeners()${isTypeScript ? ': void' : ''} {
    // Handle navigation
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.matches('a[href^="/"]')) {
        e.preventDefault()
        const href = target.getAttribute('href')
        if (href) {
          this.router.navigate(href)
        }
      }
    })
  }

  mount${typeAnnotations.mount} {
    this.appElement = document.querySelector(selector)
    if (!this.appElement) {
      throw new Error(\`Element with selector '\${selector}' not found\`)
    }

    // Render the layout
    this.layout.render(this.appElement)
    
    // Initialize router
    this.router.init()
  }

  unmount${typeAnnotations.unmount} {
    if (this.appElement) {
      this.appElement.innerHTML = ''
      this.appElement = null
    }
  }
}`;
  }

  getRouter() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotations = isTypeScript ? {
      route: `
interface Route {
  path: string
  component: () => Promise<any>
}`,
      routes: ': Route[]',
      currentPath: ': string',
      methods: {
        init: '(): void',
        navigate: '(path: string): void',
        handleRoute: '(): Promise<void>',
        getCurrentPath: '(): string'
      }
    } : {
      route: '',
      routes: '',
      currentPath: '',
      methods: {
        init: '',
        navigate: '',
        handleRoute: '',
        getCurrentPath: ''
      }
    };

    return `${typeAnnotations.route}

export class Router {
  private routes${typeAnnotations.routes}
  private currentPath${typeAnnotations.currentPath} = '/'

  constructor() {
    this.routes = [
      {
        path: '/',
        component: () => import('./pages/Home${isTypeScript ? '' : '.js'}')
      },
      {
        path: '/about',
        component: () => import('./pages/About${isTypeScript ? '' : '.js'}')
      }
    ]
  }

  init${typeAnnotations.methods.init} {
    window.addEventListener('popstate', () => {
      this.handleRoute()
    })
    this.handleRoute()
  }

  navigate${typeAnnotations.methods.navigate} {
    if (path !== this.currentPath) {
      window.history.pushState({}, '', path)
      this.handleRoute()
    }
  }

  private async handleRoute${typeAnnotations.methods.handleRoute} {
    this.currentPath = this.getCurrentPath()
    const route = this.routes.find(r => r.path === this.currentPath)
    
    const contentElement = document.querySelector('#content')
    if (!contentElement) return

    if (route) {
      try {
        const module = await route.component()
        const Component = module.default || module[Object.keys(module)[0]]
        const component = new Component()
        component.render(contentElement)
        
        // Update active nav links
        this.updateActiveNavLinks()
      } catch (error) {
        console.error('Error loading component:', error)
        contentElement.innerHTML = '<h1>Error loading page</h1>'
      }
    } else {
      // 404 Not Found
      contentElement.innerHTML = \`
        <div class="text-center">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" class="btn btn-primary">Go Home</a>
        </div>
      \`
    }
  }

  private updateActiveNavLinks()${isTypeScript ? ': void' : ''} {
    const navLinks = document.querySelectorAll('.nav a')
    navLinks.forEach(link => {
      const href = link.getAttribute('href')
      if (href === this.currentPath) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })
  }

  private getCurrentPath${typeAnnotations.methods.getCurrentPath} {
    return window.location.pathname
  }
}`;
  }

  getHomePage() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotations = isTypeScript ? {
      counter: ': number',
      render: '(container: HTMLElement): void',
      increment: '(): void',
      decrement: '(): void',
      updateCounter: '(): void'
    } : {
      counter: '',
      render: '',
      increment: '',
      decrement: '',
      updateCounter: ''
    };

    const classes = this.config.styling === 'tailwind' ? {
      container: 'class="text-center p-8"',
      title: 'class="text-4xl font-bold text-gray-900 mb-8"',
      subtitle: 'class="text-lg text-gray-600 mb-8"',
      highlight: 'class="text-blue-600"',
      card: 'class="bg-white rounded-lg shadow-md p-6 inline-block"',
      counterTitle: 'class="text-2xl font-semibold mb-4"',
      buttonContainer: 'class="space-x-4"',
      btnDecrement: 'class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"',
      btnIncrement: 'class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"'
    } : {
      container: 'class="text-center p-2"',
      title: '',
      subtitle: '',
      highlight: 'class="text-primary"',
      card: 'class="card"',
      counterTitle: '',
      buttonContainer: 'class="flex gap-2 justify-center"',
      btnDecrement: 'class="btn btn-secondary"',
      btnIncrement: 'class="btn btn-primary"'
    };

    return `export default class Home {
  private counter${typeAnnotations.counter} = 0

  render${typeAnnotations.render} {
    container.innerHTML = \`
      <div ${classes.container}>
        <h1 ${classes.title}>
          Welcome to <span ${classes.highlight}>Vanilla JS</span>
        </h1>
        
        <p ${classes.subtitle}>
          A modern vanilla JavaScript application with TypeScript and Vite.
        </p>

        <div ${classes.card}>
          <h2 ${classes.counterTitle} id="counter-title">Counter: \${this.counter}</h2>
          <div ${classes.buttonContainer}>
            <button ${classes.btnDecrement} id="decrement-btn">Decrement</button>
            <button ${classes.btnIncrement} id="increment-btn">Increment</button>
          </div>
        </div>
      </div>
    \`

    // Add event listeners
    const incrementBtn = container.querySelector('#increment-btn')
    const decrementBtn = container.querySelector('#decrement-btn')

    incrementBtn?.addEventListener('click', () => this.increment())
    decrementBtn?.addEventListener('click', () => this.decrement())
  }

  private increment${typeAnnotations.increment} {
    this.counter++
    this.updateCounter()
  }

  private decrement${typeAnnotations.decrement} {
    this.counter--
    this.updateCounter()
  }

  private updateCounter${typeAnnotations.updateCounter} {
    const counterTitle = document.querySelector('#counter-title')
    if (counterTitle) {
      counterTitle.textContent = \`Counter: \${this.counter}\`
    }
  }
}`;
  }

  getAboutPage() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotation = isTypeScript ? '(container: HTMLElement): void' : '';
    
    const classes = this.config.styling === 'tailwind' ? {
      container: 'class="max-w-4xl mx-auto p-8"',
      title: 'class="text-4xl font-bold text-gray-900 mb-8"',
      prose: 'class="prose prose-lg"',
      description: 'class="text-gray-600 mb-6"',
      featuresTitle: 'class="text-2xl font-semibold text-gray-900 mb-4"',
      featuresList: 'class="grid grid-cols-1 md:grid-cols-2 gap-3"',
      featureItem: 'class="flex items-center p-3 bg-blue-50 rounded-lg"',
      featureBullet: 'class="w-2 h-2 bg-blue-500 rounded-full mr-3"'
    } : {
      container: 'class="container p-2"',
      title: '',
      prose: '',
      description: '',
      featuresTitle: '',
      featuresList: 'class="grid gap-1"',
      featureItem: 'class="flex align-center p-1"',
      featureBullet: 'class="bullet"'
    };

    return `export default class About {
  private features${isTypeScript ? ': string[]' : ''} = [
    'Modern ES6+ JavaScript',
    'TypeScript support',
    'Vite for fast development',
    'Component-based architecture',
    'Client-side routing',
    'Utility functions and helpers',
    'Modern CSS with optional Tailwind',
    'Testing setup ready'
  ]

  render${typeAnnotation} {
    container.innerHTML = \`
      <div ${classes.container}>
        <h1 ${classes.title}>About This App</h1>
        
        <div ${classes.prose}>
          <p ${classes.description}>
            This vanilla JavaScript application demonstrates modern web development
            practices without the complexity of large frameworks. It uses pure JavaScript
            with modern tooling for a fast, lightweight experience.
          </p>

          <h2 ${classes.featuresTitle}>Features</h2>
          <div ${classes.featuresList}>
            \${this.features.map(feature => \`
              <div ${classes.featureItem}>
                <span ${classes.featureBullet}></span>
                \${feature}
              </div>
            \`).join('')}
          </div>
        </div>
      </div>
    \`
  }
}`;
  }

  getButtonComponent() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotations = isTypeScript ? {
      interface: `
interface ButtonOptions {
  text: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}`,
      options: ': ButtonOptions',
      create: '(): HTMLButtonElement'
    } : {
      interface: '',
      options: '',
      create: ''
    };

    return `${typeAnnotations.interface}

export class Button {
  private options${typeAnnotations.options}

  constructor(options${typeAnnotations.options}) {
    this.options = {
      variant: 'primary',
      size: 'md',
      ...options
    }
  }

  create${typeAnnotations.create} {
    const button = document.createElement('button')
    button.textContent = this.options.text
    button.className = this.getClasses()
    
    if (this.options.onClick) {
      button.addEventListener('click', this.options.onClick)
    }

    return button
  }

  private getClasses()${isTypeScript ? ': string' : ''} {${this.config.styling === 'tailwind' ? `
    const base = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2'
    const variants = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500'
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }
    
    return \`\${base} \${variants[this.options.variant!]} \${sizes[this.options.size!]}\`` : `
    const base = 'btn'
    const variant = \`btn-\${this.options.variant}\`
    const size = this.options.size === 'sm' ? 'btn-sm' : 
                 this.options.size === 'lg' ? 'btn-lg' : ''
    
    return [base, variant, size].filter(Boolean).join(' ')`}
  }
}`;
  }

  getLayoutComponent() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotation = isTypeScript ? '(container: HTMLElement): void' : '';
    
    const classes = this.config.styling === 'tailwind' ? {
      app: 'class="min-h-screen flex flex-col"',
      header: 'class="bg-gray-800 text-white shadow-lg"',
      headerContainer: 'class="container mx-auto px-4 py-4"',
      nav: 'class="flex space-x-6"',
      navLink: 'class="text-white hover:text-gray-300 transition-colors"',
      main: 'class="flex-1"',
      content: 'id="content" class="container mx-auto px-4 py-8"'
    } : {
      app: 'class="app"',
      header: 'class="header"',
      headerContainer: 'class="container"',
      nav: 'class="nav"',
      navLink: '',
      main: 'class="flex-1"',
      content: 'id="content" class="container p-2"'
    };

    return `export class Layout {
  render${typeAnnotation} {
    container.innerHTML = \`
      <div ${classes.app}>
        <header ${classes.header}>
          <div ${classes.headerContainer}>
            <nav ${classes.nav}>
              <a href="/" ${classes.navLink}>Home</a>
              <a href="/about" ${classes.navLink}>About</a>
            </nav>
          </div>
        </header>
        
        <main ${classes.main}>
          <div ${classes.content}></div>
        </main>
      </div>
    \`
  }
}`;
  }

  getDomUtils() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotations = isTypeScript ? {
      element: '<T extends HTMLElement>',
      querySelector: '(selector: string): T | null',
      querySelectorAll: '<T extends HTMLElement>(selector: string): NodeListOf<T>',
      createElement: '<T extends keyof HTMLElementTagNameMap>(tagName: T, options?: { className?: string; textContent?: string; attributes?: Record<string, string> }): HTMLElementTagNameMap[T]',
      addClass: '(element: HTMLElement, className: string): void',
      removeClass: '(element: HTMLElement, className: string): void',
      toggleClass: '(element: HTMLElement, className: string): void',
      hasClass: '(element: HTMLElement, className: string): boolean'
    } : {
      element: '',
      querySelector: '',
      querySelectorAll: '',
      createElement: '',
      addClass: '',
      removeClass: '',
      toggleClass: '',
      hasClass: ''
    };

    return `// DOM utility functions
export const dom = {
  // Query selectors with type safety
  $${typeAnnotations.element}${typeAnnotations.querySelector} {
    return document.querySelector(selector) as T | null
  },

  $$${typeAnnotations.querySelectorAll} {
    return document.querySelectorAll(selector)
  },

  // Element creation helper
  createElement${typeAnnotations.createElement} {
    const element = document.createElement(tagName)
    
    if (options?.className) {
      element.className = options.className
    }
    
    if (options?.textContent) {
      element.textContent = options.textContent
    }
    
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }
    
    return element
  },

  // Class manipulation
  addClass${typeAnnotations.addClass} {
    element.classList.add(className)
  },

  removeClass${typeAnnotations.removeClass} {
    element.classList.remove(className)
  },

  toggleClass${typeAnnotations.toggleClass} {
    element.classList.toggle(className)
  },

  hasClass${typeAnnotations.hasClass} {
    return element.classList.contains(className)
  },

  // Event delegation helper
  on${isTypeScript ? '<T extends HTMLElement>(selector: string, event: string, handler: (e: Event, target: T) => void): void' : ''} {
    document.addEventListener(event, (e) => {
      const target = e.target as HTMLElement
      if (target.matches(selector)) {
        handler(e, target${isTypeScript ? ' as T' : ''})
      }
    })
  }
}`;
  }

  getStorageUtils() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotations = isTypeScript ? {
      get: '<T = any>(key: string, defaultValue?: T): T | null',
      set: '<T = any>(key: string, value: T): void',
      remove: '(key: string): void',
      clear: '(): void',
      has: '(key: string): boolean'
    } : {
      get: '',
      set: '',
      remove: '',
      clear: '',
      has: ''
    };

    return `// Storage utility functions with JSON serialization
export const storage = {
  // localStorage helpers
  local: {
    get${typeAnnotations.get} {
      try {
        const item = localStorage.getItem(key)
        if (item === null) {
          return defaultValue ${isTypeScript ? '?? null' : '|| null'}
        }
        return JSON.parse(item)
      } catch (error) {
        console.error('Error parsing localStorage item:', error)
        return defaultValue ${isTypeScript ? '?? null' : '|| null'}
      }
    },

    set${typeAnnotations.set} {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('Error setting localStorage item:', error)
      }
    },

    remove${typeAnnotations.remove} {
      localStorage.removeItem(key)
    },

    clear${typeAnnotations.clear} {
      localStorage.clear()
    },

    has${typeAnnotations.has} {
      return localStorage.getItem(key) !== null
    }
  },

  // sessionStorage helpers
  session: {
    get${typeAnnotations.get} {
      try {
        const item = sessionStorage.getItem(key)
        if (item === null) {
          return defaultValue ${isTypeScript ? '?? null' : '|| null'}
        }
        return JSON.parse(item)
      } catch (error) {
        console.error('Error parsing sessionStorage item:', error)
        return defaultValue ${isTypeScript ? '?? null' : '|| null'}
      }
    },

    set${typeAnnotations.set} {
      try {
        sessionStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('Error setting sessionStorage item:', error)
      }
    },

    remove${typeAnnotations.remove} {
      sessionStorage.removeItem(key)
    },

    clear${typeAnnotations.clear} {
      sessionStorage.clear()
    },

    has${typeAnnotations.has} {
      return sessionStorage.getItem(key) !== null
    }
  }
}`;
  }

  getApiService() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeAnnotations = isTypeScript ? {
      interface: `
interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
}

interface RequestOptions {
  headers?: Record<string, string>
  body?: any
  timeout?: number
}`,
      baseUrl: ': string',
      defaultHeaders: ': Record<string, string>',
      get: '<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>',
      post: '<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>',
      put: '<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>',
      delete: '<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>',
      request: '<T = any>(method: string, endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>'
    } : {
      interface: '',
      baseUrl: '',
      defaultHeaders: '',
      get: '',
      post: '',
      put: '',
      delete: '',
      request: ''
    };

    return `${typeAnnotations.interface}

export class ApiService {
  private baseUrl${typeAnnotations.baseUrl}
  private defaultHeaders${typeAnnotations.defaultHeaders}

  constructor(baseUrl${isTypeScript ? ': string' : ''} = '/api') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  async get${typeAnnotations.get} {
    return this.request('GET', endpoint, options)
  }

  async post${typeAnnotations.post} {
    return this.request('POST', endpoint, { ...options, body: data })
  }

  async put${typeAnnotations.put} {
    return this.request('PUT', endpoint, { ...options, body: data })
  }

  async delete${typeAnnotations.delete} {
    return this.request('DELETE', endpoint, options)
  }

  private async request${typeAnnotations.request} {
    const url = \`\${this.baseUrl}\${endpoint}\`
    const headers = { ...this.defaultHeaders, ...options?.headers }
    
    const config${isTypeScript ? ': RequestInit' : ''} = {
      method,
      headers
    }

    if (options?.body) {
      config.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body)
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 5000)
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      let data${isTypeScript ? ': any' : ''}
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      const result${isTypeScript ? ': ApiResponse<T>' : ''} = {
        data,
        status: response.status,
        statusText: response.statusText
      }

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
      }

      return result
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  setAuthToken(token${isTypeScript ? ': string' : ''})${isTypeScript ? ': void' : ''} {
    this.defaultHeaders['Authorization'] = \`Bearer \${token}\`
  }

  removeAuthToken()${isTypeScript ? ': void' : ''} {
    delete this.defaultHeaders['Authorization']
  }
}

// Default instance
export const api = new ApiService()`;
  }

  getCommands() {
    return {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest',
      lint: 'eslint src/ --ext js,ts',
      'type-check': this.config.language === 'TypeScript' ? 'tsc --noEmit' : undefined
    };
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '🍦 Vanilla JavaScript Application',
      content: `This is a modern vanilla JavaScript application built with:

- **Pure JavaScript**: No framework dependencies, just modern JavaScript
- **Vite**: Lightning-fast development server and build tool
- **Component Architecture**: Organized, reusable component pattern
- **Client-side Routing**: SPA-style navigation without page reloads
- **Modern Tooling**: ESLint for code quality, modern build process
- **Utility Libraries**: Helper functions for DOM manipulation and storage

### Project Structure:
- \`src/components/\` - Reusable UI components
- \`src/pages/\` - Page components for routing
- \`src/utils/\` - Utility functions (DOM, storage, helpers)
- \`src/services/\` - API and external service integrations
- \`src/styles/\` - CSS stylesheets and utilities

### Development:
\`\`\`bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
\`\`\``
    });

    if (this.config.language === 'TypeScript') {
      sections.push({
        title: '🔷 TypeScript Integration',
        content: `This vanilla JavaScript project includes full TypeScript support:

- Type-safe component development
- Modern TypeScript configuration
- IntelliSense support in VS Code
- Compile-time error checking

### Usage Example:
\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
}

export class UserCard {
  private user: User

  constructor(user: User) {
    this.user = user
  }

  render(container: HTMLElement): void {
    container.innerHTML = \`
      <div class="user-card">
        <h3>\${this.user.name}</h3>
        <p>\${this.user.email}</p>
      </div>
    \`
  }
}
\`\`\``
      });
    }

    if (this.config.styling === 'tailwind') {
      sections.push({
        title: '🎨 Tailwind CSS Integration',
        content: `Tailwind CSS is fully configured for this vanilla JavaScript project:

- Utility-first CSS framework
- Optimized for Vite build process
- Component-friendly utility classes
- Responsive design utilities

### Usage Example:
\`\`\`javascript
export class Button {
  constructor(options) {
    this.options = { variant: 'primary', ...options }
  }

  create() {
    const button = document.createElement('button')
    button.textContent = this.options.text
    
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors'
    const variantClasses = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900'
    }
    
    button.className = \`\${baseClasses} \${variantClasses[this.options.variant]}\`
    
    return button
  }
}
\`\`\``
      });
    }

    return sections;
  }

  getSupportedFeatures() {
    return ['spa', 'components', 'routing', 'utilities', 'dom-manipulation'];
  }

  getSecurityGuidelines() {
    return [
      'Sanitize user inputs to prevent XSS attacks',
      'Use textContent instead of innerHTML when possible',
      'Validate data before DOM manipulation',
      'Implement Content Security Policy (CSP)',
      'Use environment variables for API endpoints',
      'Implement proper error handling',
      'Keep dependencies updated',
      'Use HTTPS in production',
      'Validate API responses before processing'
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === 'vitest') {
      return `- Unit tests for components and utilities with Vitest
- DOM testing with Testing Library
- Integration tests for user flows
- Mock API calls with MSW (Mock Service Worker)
- Test routing and navigation
- Test utility functions separately`;
    } else if (this.config.testing === 'jest') {
      return `- Unit tests for components and utilities with Jest
- DOM testing with Testing Library
- Integration tests for user flows
- Mock API calls and browser APIs
- Test routing and navigation
- Snapshot tests for stable components`;
    }

    return `- Consider adding Vitest for fast unit testing
- Use Testing Library for DOM testing
- Test user interactions and accessibility
- Mock external dependencies and APIs
- Test component lifecycle and cleanup
- Test utility functions separately`;
  }

  getUIGuidelines() {
    let guidelines = `### Vanilla JavaScript Best Practices:
- Use modern ES6+ features (classes, modules, async/await)
- Implement proper component lifecycle management
- Create reusable utility functions
- Use event delegation for dynamic content
- Implement proper memory management and cleanup
- Follow accessibility guidelines (WCAG)
- Use semantic HTML elements
- Implement proper error boundaries`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with Vanilla JS:
- Use utility classes for consistent styling
- Create component classes with Tailwind utilities
- Build a design system with utility classes
- Implement responsive design patterns
- Use CSS custom properties for dynamic theming`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'ts' : 'js';
  }

  getTemplateVariables() {
    return {
      isVanilla: true,
      hasRouting: true,
      hasComponents: true,
      hasUtilities: true,
      usesPureJS: true,
      hasModernTooling: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Vanilla JS can work with various backends and is generally compatible
    // It's incompatible with other frontend frameworks
    const incompatible = ['react', 'vue', 'angular', 'svelte'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}