import { BasePlugin } from './base-plugin.js';

export class VuePlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'vue',
      displayName: 'Vue.js',
      category: 'stack',
      projectTypes: ['frontend', 'fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '💚',
      description: 'The Progressive JavaScript Framework'
    };
  }

  getDependencies() {
    return {
      production: ['vue', 'vue-router', 'pinia'],
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = ['@vitejs/plugin-vue', 'vite', 'eslint', 'eslint-plugin-vue'];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', 'vue-tsc', '@types/node');
    }

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    if (this.config.testing === 'vitest') {
      deps.push('vitest', '@vue/test-utils', 'jsdom');
    } else if (this.config.testing === 'jest') {
      deps.push('jest', '@vue/test-utils', '@vue/vue3-jest', 'babel-jest');
    }

    return deps;
  }

  getFileStructure() {
    const ext = this.getLanguageExtension();
    const scriptExt = this.config.language === 'TypeScript' ? 'ts' : 'js';
    return `src/
├── components/
│   ├── ui/
│   │   ├── BaseButton.vue
│   │   └── BaseInput.vue
│   ├── AppLayout.vue
│   └── AppHeader.vue
├── composables/
│   └── useLocalStorage.${scriptExt}
├── views/
│   ├── HomeView.vue
│   ├── AboutView.vue
│   └── NotFoundView.vue
├── router/
│   └── index.${scriptExt}
├── stores/
│   └── counter.${scriptExt}
├── utils/
│   └── helpers.${scriptExt}
├── styles/
│   └── main.css
├── App.vue
└── main.${scriptExt}
public/
├── index.html
└── favicon.ico
vite.config.${scriptExt}
${this.config.language === 'TypeScript' ? 'tsconfig.json' : ''}
${this.config.language === 'TypeScript' ? 'tsconfig.app.json' : ''}
${this.config.language === 'TypeScript' ? 'tsconfig.node.json' : ''}
${this.config.styling === 'tailwind' ? 'tailwind.config.js' : ''}
package.json`;
  }

  getConfigFiles() {
    const files = [];
    const scriptExt = this.config.language === 'TypeScript' ? 'ts' : 'js';
    const isTypeScript = this.config.language === 'TypeScript';

    // Vite config
    files.push({
      name: `vite.config.${scriptExt}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getViteConfig()
    });

    // Main App component
    files.push({
      name: 'App.vue',
      language: 'vue',
      content: this.getAppComponent()
    });

    // Main entry point
    files.push({
      name: `main.${scriptExt}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getMainFile()
    });

    // Router configuration
    files.push({
      name: `router/index.${scriptExt}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getRouterConfig()
    });

    // Pinia store
    files.push({
      name: `stores/counter.${scriptExt}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getStoreConfig()
    });

    // HTML template
    files.push({
      name: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${scriptExt}"></script>
  </body>
</html>`
    });

    // TypeScript configurations
    if (isTypeScript) {
      files.push({
        name: 'tsconfig.json',
        language: 'json',
        content: `{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.node.json"
    },
    {
      "path": "./tsconfig.app.json"
    }
  ]
}`
      });

      files.push({
        name: 'tsconfig.app.json',
        language: 'json',
        content: `{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`
      });

      files.push({
        name: 'tsconfig.node.json',
        language: 'json',
        content: `{
  "extends": "@vue/tsconfig/tsconfig.node.json",
  "include": ["vite.config.*", "vitest.config.*", "cypress.config.*", "nightwatch.conf.*", "playwright.config.*"],
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "types": ["node"]
  }
}`
      });

      files.push({
        name: 'env.d.ts',
        language: 'typescript',
        content: `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}`
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
    "./src/**/*.{vue,js,ts,jsx,tsx}",
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
    const importStatement = isTypeScript ? 
      `import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\nimport { fileURLToPath, URL } from 'node:url'` :
      `import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'`;

    const config = isTypeScript ? `export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true
  }
})` : `export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  }
})`;

    return `${importStatement}

// https://vitejs.dev/config/
${config}`;
  }

  getAppComponent() {
    const styleImport = this.config.styling === 'tailwind' ? 
      `import './styles/main.css'` : 
      `import './styles/main.css'`;

    return `<template>
  <div id="app">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script${this.config.language === 'TypeScript' ? ' lang="ts"' : ''} setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import '${styleImport}'
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>`;
  }

  getMainFile() {
    const isTypeScript = this.config.language === 'TypeScript';
    return `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
${this.config.styling === 'tailwind' ? "import './styles/main.css'" : ''}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')`;
  }

  getRouterConfig() {
    const isTypeScript = this.config.language === 'TypeScript';
    const typeImport = isTypeScript ? 
      `import type { RouteRecordRaw } from 'vue-router'` : '';

    const routesType = isTypeScript ? ': RouteRecordRaw[]' : '';

    return `${typeImport}
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes${routesType} = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router`;
  }

  getStoreConfig() {
    const isTypeScript = this.config.language === 'TypeScript';
    return `import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})`;
  }

  getCommands() {
    return {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest',
      lint: 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore',
      'type-check': this.config.language === 'TypeScript' ? 'vue-tsc --noEmit' : undefined
    };
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '💚 Vue.js Application',
      content: `This is a modern Vue.js application built with:

- **Vue 3**: Latest version with Composition API
- **Vite**: Lightning-fast development server and build tool
- **Vue Router**: Official routing library for Vue.js
- **Pinia**: Intuitive, type-safe state management
- **ESLint**: Code linting with Vue-specific rules

### Project Structure:
- \`src/components/\` - Reusable Vue components
- \`src/views/\` - Page components for routing
- \`src/composables/\` - Composition API utilities
- \`src/stores/\` - Pinia state management stores
- \`src/router/\` - Vue Router configuration
- \`src/utils/\` - Utility functions

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
        content: `This Vue project is fully configured with TypeScript:

- Vue 3 Composition API with TypeScript support
- Type-safe routing with Vue Router
- Pinia stores with TypeScript inference
- Proper TypeScript configuration for Vue SFCs

### Usage Example:
\`\`\`vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

const user = ref<User | null>(null)
const loading = ref<boolean>(false)

const fetchUser = async (id: number): Promise<void> => {
  loading.value = true
  try {
    // API call logic
  } finally {
    loading.value = false
  }
}
</script>
\`\`\``
      });
    }

    if (this.config.styling === 'tailwind') {
      sections.push({
        title: '🎨 Tailwind CSS Integration',
        content: `Tailwind CSS is fully configured for this Vue project:

- Utility-first CSS framework
- Optimized for Vite build process
- Vue Single File Component support
- Responsive design utilities

### Usage Example:
\`\`\`vue
<template>
  <button 
    :class="buttonClasses"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const buttonClasses = computed(() => {
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
  
  return \`\${base} \${variants[props.variant]} \${sizes[props.size]}\`
})
</script>
\`\`\``
      });
    }

    return sections;
  }

  getSupportedFeatures() {
    return ['spa', 'components', 'composition-api', 'routing', 'state-management', 'reactive'];
  }

  getSecurityGuidelines() {
    return [
      'Sanitize user inputs to prevent XSS attacks',
      'Use v-html carefully and sanitize content',
      'Implement Content Security Policy (CSP)',
      'Validate data on both client and server side',
      'Use environment variables for API endpoints',
      'Implement proper error handling',
      'Keep dependencies updated',
      'Use Vue\'s built-in XSS protection features'
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === 'vitest') {
      return `- Unit tests for components with Vue Test Utils
- Composition API functions testing
- Integration tests for user flows
- Mock API calls with MSW (Mock Service Worker)
- Test Vue Router navigation
- Test Pinia store actions and getters`;
    }

    return `- Consider adding Vitest for fast unit testing
- Use Vue Test Utils for component testing
- Test user interactions and accessibility
- Mock external dependencies
- Test composables separately
- Test reactive data changes`;
  }

  getUIGuidelines() {
    let guidelines = `### Vue 3 Best Practices:
- Use Composition API for better TypeScript support
- Implement proper prop validation
- Create reusable composables
- Use computed properties for derived state
- Implement proper loading and error states
- Follow Vue 3 reactivity rules
- Use Single File Components (SFCs)`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with Vue:
- Use :class bindings for dynamic classes
- Create component variants with computed properties
- Build a design system with Vue + Tailwind
- Implement responsive design patterns
- Use Vue's reactivity with Tailwind classes`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'ts' : 'js';
  }

  getTemplateVariables() {
    return {
      isVue: true,
      hasRouting: true,
      hasComponents: true,
      hasCompositionAPI: true,
      hasStateManagement: true,
      usesSFC: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Vue can work with various backends but not with other frontend frameworks
    const incompatible = ['react', 'angular', 'svelte'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}