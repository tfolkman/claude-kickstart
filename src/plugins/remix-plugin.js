import { BasePlugin } from './base-plugin.js';

export class RemixPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'remix',
      displayName: 'Remix',
      category: 'stack',
      projectTypes: ['fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '💿',
      description: 'Full-stack web framework focused on web standards'
    };
  }

  getDependencies() {
    const deps = ['@remix-run/node', '@remix-run/react', '@remix-run/serve', 'isbot', 'react', 'react-dom'];
    
    if (this.config.database === 'postgresql') {
      deps.push('pg');
    } else if (this.config.database === 'mongodb') {
      deps.push('mongoose');
    } else if (this.config.database === 'mysql') {
      deps.push('mysql2');
    }

    if (this.config.authentication === 'remix-auth') {
      deps.push('remix-auth');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = ['@remix-run/dev', 'vite'];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', '@types/react', '@types/react-dom');
      
      if (this.config.database === 'postgresql') {
        deps.push('@types/pg');
      }
    }

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    if (this.config.testing === 'vitest') {
      deps.push('vitest', '@testing-library/react', 'jsdom');
    }

    return deps;
  }

  getFileStructure() {
    const ext = this.getLanguageExtension();
    return `app/
├── entry.client.${ext}
├── entry.server.${ext}
├── root.${ext}
├── routes/
│   ├── _index.${ext}
│   └── login.${ext}
├── components/
│   └── ui/
├── utils/
│   └── db.server.${ext}
├── styles/
│   └── app.css
└── models/
    └── user.server.${ext}
public/
├── favicon.ico
└── manifest.json
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

    // Root component
    files.push({
      name: `app/root.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getRootComponent()
    });

    // Index route
    files.push({
      name: `app/routes/_index.${ext}`,
      language: this.config.language === 'TypeScript' ? 'typescript' : 'javascript',
      content: this.getIndexRoute()
    });

    // TypeScript config
    if (this.config.language === 'TypeScript') {
      files.push({
        name: 'tsconfig.json',
        language: 'json',
        content: `{
  "include": ["remix.env.d.ts", "**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "isolatedModules": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "target": "ES2022",
    "strict": true,
    "allowJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },
    "noEmit": true
  }
}`
      });

      files.push({
        name: 'remix.env.d.ts',
        language: 'typescript',
        content: `/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />`
      });
    }

    // Tailwind config
    if (this.config.styling === 'tailwind') {
      files.push({
        name: 'tailwind.config.js',
        language: 'javascript',
        content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`
      });

      files.push({
        name: 'postcss.config.js',
        language: 'javascript',
        content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
      });
    }

    // Package.json scripts
    files.push({
      name: 'package.json',
      language: 'json',
      content: JSON.stringify({
        name: 'remix-app',
        private: true,
        sideEffects: false,
        type: 'module',
        scripts: {
          build: 'remix vite:build',
          dev: 'remix vite:dev',
          lint: 'eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .',
          start: 'remix-serve ./build/server/index.js',
          typecheck: 'tsc'
        }
      }, null, 2)
    });

    return files;
  }

  getViteConfig() {
    if (this.config.language === 'TypeScript') {
      return `import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
});`;
    } else {
      return `import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
});`;
    }
  }

  getRootComponent() {
    const imports = ['import { cssBundleHref } from "@remix-run/css-bundle"'];
    imports.push('import type { LinksFunction } from "@remix-run/node"');
    imports.push('import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"');

    if (this.config.styling === 'tailwind') {
      imports.push('import stylesheet from "~/styles/app.css"');
    }

    const links = [];
    if (this.config.styling === 'tailwind') {
      links.push('{ rel: "stylesheet", href: stylesheet }');
    }
    links.push('...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : [])');

    return `${imports.join('\n')}

export const links: LinksFunction = () => [
  ${links.join(',\n  ')}
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}`;
  }

  getIndexRoute() {
    const typeAnnotation = this.config.language === 'TypeScript' ? ': V2_MetaFunction' : '';
    
    return `import type { V2_MetaFunction } from "@remix-run/node";

export const meta${typeAnnotation} = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div${this.config.styling === 'tailwind' ? ' className="flex h-screen items-center justify-center"' : ' style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}'}>
      <div${this.config.styling === 'tailwind' ? ' className="flex flex-col items-center gap-16"' : ''}>
        <header${this.config.styling === 'tailwind' ? ' className="flex flex-col items-center gap-9"' : ''}>
          <h1${this.config.styling === 'tailwind' ? ' className="leading text-2xl font-bold text-gray-800 dark:text-gray-100"' : ''}>
            Welcome to <span${this.config.styling === 'tailwind' ? ' className="sr-only"' : ''}>Remix</span>
          </h1>
        </header>
        <nav${this.config.styling === 'tailwind' ? ' className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700"' : ''}>
          <p${this.config.styling === 'tailwind' ? ' className="leading-6 text-gray-700 dark:text-gray-200"' : ''}>What's next?</p>
        </nav>
      </div>
    </div>
  );
}`;
  }

  getCommands() {
    return {
      dev: 'npm run dev',
      build: 'npm run build',
      start: 'npm start',
      test: 'npm test',
      lint: 'npm run lint',
      typecheck: 'npm run typecheck'
    };
  }

  getMarkdownSections() {
    return [
      {
        title: '💿 Remix Full-Stack Framework',
        content: `This is a Remix application with:

- **Web Standards**: Built on web standards (Request/Response, FormData, etc.)
- **Server-Side Rendering**: Fast initial page loads with SSR
- **Nested Routing**: Powerful nested routing system
- **Data Loading**: Efficient data loading with loaders
- **Form Handling**: Progressive enhancement for forms
- **File-based Routing**: Routes based on file system

### Key Features:
- \`app/routes/\` - File-based routing
- \`app/components/\` - Reusable components
- \`app/utils/\` - Utility functions
- \`app/models/\` - Data models

### Development:
\`\`\`bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run typecheck # TypeScript checking
\`\`\``
      }
    ];
  }

  getSupportedFeatures() {
    return ['ssr', 'file-routing', 'data-loading', 'forms', 'nested-routing'];
  }

  getSecurityGuidelines() {
    return [
      'Use environment variables for secrets',
      'Validate all form inputs on the server',
      'Implement CSRF protection for forms',
      'Use secure session management',
      'Sanitize user-generated content',
      'Enable Content Security Policy',
      'Use HTTPS in production'
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === 'vitest') {
      return `- Unit tests for utility functions and models
- Component tests with React Testing Library
- Integration tests for routes and loaders
- Test form submissions and data mutations
- Mock external APIs and database calls`;
    }

    return `- Consider adding Vitest for testing
- Test routes, loaders, and actions
- Component testing with React Testing Library
- Integration tests for user flows`;
  }

  getUIGuidelines() {
    let guidelines = `### Remix Best Practices:
- Use loaders for data fetching
- Implement progressive enhancement
- Leverage nested routing for layouts
- Use actions for form submissions
- Optimize with prefetching`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with Remix:
- Use utility classes for styling
- Implement responsive design patterns
- Create reusable component variants
- Use dark mode utilities`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'tsx' : 'jsx';
  }

  getTemplateVariables() {
    return {
      isRemix: true,
      hasSSR: true,
      hasFileRouting: true,
      hasDataLoading: true,
      hasFormHandling: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Remix is a full-stack framework, incompatible with other full-stack frameworks
    const incompatible = ['nextjs-app', 'nextjs-pages', 't3', 'mern', 'mean'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}