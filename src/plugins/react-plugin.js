import { BasePlugin } from './base-plugin.js';

export class ReactPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'react',
      displayName: 'React',
      category: 'stack',
      projectTypes: ['frontend', 'fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '⚛️',
      description: 'A JavaScript library for building user interfaces'
    };
  }

  getDependencies() {
    return {
      production: ['react', 'react-dom', 'react-router-dom'],
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = ['@vitejs/plugin-react', 'vite', 'eslint', 'eslint-plugin-react', 'eslint-plugin-react-hooks'];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', '@types/node', '@types/react', '@types/react-dom');
    }

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    if (this.config.testing === 'jest') {
      deps.push('jest', '@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event');
    } else if (this.config.testing === 'vitest') {
      deps.push('vitest', '@testing-library/react', 'jsdom');
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
├── hooks/
│   └── useLocalStorage.${ext}
├── pages/
│   ├── Home.${ext}
│   ├── About.${ext}
│   └── NotFound.${ext}
├── utils/
│   └── helpers.${ext}
├── styles/
│   └── index.css
├── App.${ext}
├── main.${ext}
└── vite-env.d.ts
public/
├── index.html
└── favicon.ico
vite.config.${this.config.language === 'TypeScript' ? 'ts' : 'js'}
${this.config.language === 'TypeScript' ? 'tsconfig.json' : ''}
${this.config.styling === 'tailwind' ? 'tailwind.config.js' : ''}
package.json`;
  }

  getConfigFiles() {
    const files = [];
    const ext = this.getLanguageExtension();

    // Vite config
    files.push({
      name: `vite.config.${this.config.language === 'TypeScript' ? 'ts' : 'js'}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getViteConfig()
    });

    // Main App component
    files.push({
      name: `App.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getAppComponent()
    });

    // Main entry point
    files.push({
      name: `main.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getMainFile()
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
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>`
    });

    // TypeScript config
    if (this.config.language === 'TypeScript') {
      files.push({
        name: 'tsconfig.json',
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

      files.push({
        name: 'tsconfig.node.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`
      });
    }

    // Tailwind config
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
    if (this.config.language === 'TypeScript') {
      return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})`;
    } else {
      return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})`;
    }
  }

  getAppComponent() {
    const ext = this.getLanguageExtension();
    const imports = [`import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'`];
    
    if (this.config.styling === 'tailwind') {
      imports.push(`import './styles/index.css'`);
    }

    const typeAnnotation = this.config.language === 'TypeScript' ? ': React.FC' : '';

    return `${imports.join('\n')}
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

function App()${typeAnnotation} {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App`;
  }

  getMainFile() {
    const ext = this.getLanguageExtension();
    const imports = [`import React from 'react'`, `import ReactDOM from 'react-dom/client'`, `import App from './App.${ext}'`];
    
    if (this.config.styling === 'tailwind') {
      imports.push(`import './styles/index.css'`);
    } else {
      imports.push(`import './styles/index.css'`);
    }

    const typeAnnotation = this.config.language === 'TypeScript' ? ' as HTMLElement' : '';

    return `${imports.join('\n')}

ReactDOM.createRoot(document.getElementById('root')${typeAnnotation}).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  }

  getCommands() {
    return {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest',
      lint: 'eslint src/ --ext ts,tsx,js,jsx'
    };
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '⚛️ React Application',
      content: `This is a modern React application built with:

- **Vite**: Lightning-fast development server and build tool
- **React Router**: Client-side routing for single-page application
- **Modern React**: Functional components with hooks
- **ESLint**: Code linting for consistent code quality

### Project Structure:
- \`src/components/\` - Reusable UI components
- \`src/pages/\` - Page components for routing
- \`src/hooks/\` - Custom React hooks
- \`src/utils/\` - Utility functions
- \`src/styles/\` - CSS stylesheets

### Development:
\`\`\`bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
\`\`\``
    });

    if (this.config.styling === 'tailwind') {
      sections.push({
        title: '🎨 Tailwind CSS Integration',
        content: `Tailwind CSS is fully configured for this React project:

- Utility-first CSS framework
- Optimized for Vite build process
- Responsive design utilities
- Dark mode support ready

### Usage Example:
\`\`\`jsx
function Button({ children, variant = 'primary' }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900'
  };
  
  return (
    <button className={\`\${baseClasses} \${variants[variant]}\`}>
      {children}
    </button>
  );
}`
      });
    }

    return sections;
  }

  getSupportedFeatures() {
    return ['spa', 'components', 'hooks', 'routing', 'state-management'];
  }

  getSecurityGuidelines() {
    return [
      'Sanitize user inputs to prevent XSS attacks',
      'Use HTTPS in production',
      'Implement Content Security Policy (CSP)',
      'Validate data on both client and server side',
      'Use environment variables for API endpoints',
      'Implement proper error boundaries',
      'Keep dependencies updated'
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === 'vitest') {
      return `- Unit tests for components with React Testing Library
- Custom hooks testing with renderHook
- Integration tests for user flows
- Mock API calls with MSW (Mock Service Worker)
- Snapshot tests for stable components
- Test accessibility with jest-axe`;
    }

    return `- Consider adding Vitest for fast unit testing
- Use React Testing Library for component tests
- Test user interactions and accessibility
- Mock external dependencies
- Test custom hooks separately`;
  }

  getUIGuidelines() {
    let guidelines = `### React Best Practices:
- Use functional components with hooks
- Implement proper prop types or TypeScript interfaces
- Create reusable component library
- Use React.memo for performance optimization
- Implement proper loading and error states
- Follow accessibility guidelines (WCAG)`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with React:
- Create component variants with conditional classes
- Use clsx or cn utility for dynamic classes
- Build a design system with Tailwind
- Implement responsive design patterns`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'tsx' : 'jsx';
  }

  getTemplateVariables() {
    return {
      isReact: true,
      hasRouting: true,
      hasComponents: true,
      hasHooks: true,
      usesFunctionalComponents: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // React can work with various backends and is generally compatible
    const incompatible = ['vue', 'angular', 'svelte'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}