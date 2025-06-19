import { BasePlugin } from './base-plugin.js';

export class SveltePlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'svelte',
      displayName: 'Svelte',
      category: 'stack',
      projectTypes: ['frontend', 'fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '🧡',
      description: 'Cybernetically enhanced web apps'
    };
  }

  getDependencies() {
    return {
      production: ['@sveltejs/kit', 'svelte'],
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = [
      '@sveltejs/adapter-auto',
      '@sveltejs/kit',
      '@sveltejs/vite-plugin-svelte',
      'svelte',
      'vite',
      'eslint',
      'eslint-plugin-svelte',
      '@sveltejs/eslint-config'
    ];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', 'tslib', '@types/node', 'svelte-check');
    }

    if (this.config.styling === 'tailwind') {
      deps.push('tailwindcss', 'postcss', 'autoprefixer');
    }

    if (this.config.testing === 'vitest') {
      deps.push('vitest', '@testing-library/svelte', 'jsdom');
    } else if (this.config.testing === 'playwright') {
      deps.push('@playwright/test');
    }

    return deps;
  }

  getFileStructure() {
    const scriptExt = this.config.language === 'TypeScript' ? 'ts' : 'js';
    return `src/
├── lib/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.svelte
│   │   │   └── Input.svelte
│   │   ├── Layout.svelte
│   │   └── Header.svelte
│   ├── stores/
│   │   └── counter.${scriptExt}
│   ├── utils/
│   │   └── helpers.${scriptExt}
│   └── index.${scriptExt}
├── routes/
│   ├── about/
│   │   └── +page.svelte
│   ├── +layout.svelte
│   ├── +page.svelte
│   └── +error.svelte
├── app.d.ts
├── app.html
└── hooks.server.${scriptExt}
static/
├── favicon.png
└── robots.txt
${this.config.language === 'TypeScript' ? 'tsconfig.json' : ''}
svelte.config.js
vite.config.${scriptExt}
${this.config.styling === 'tailwind' ? 'tailwind.config.js' : ''}
package.json`;
  }

  getConfigFiles() {
    const files = [];
    const scriptExt = this.config.language === 'TypeScript' ? 'ts' : 'js';
    const isTypeScript = this.config.language === 'TypeScript';

    // SvelteKit config
    files.push({
      name: 'svelte.config.js',
      language: 'javascript',
      content: this.getSvelteConfig()
    });

    // Vite config
    files.push({
      name: `vite.config.${scriptExt}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getViteConfig()
    });

    // Main layout
    files.push({
      name: 'src/routes/+layout.svelte',
      language: 'svelte',
      content: this.getLayoutComponent()
    });

    // Home page
    files.push({
      name: 'src/routes/+page.svelte',
      language: 'svelte',
      content: this.getHomeComponent()
    });

    // About page
    files.push({
      name: 'src/routes/about/+page.svelte',
      language: 'svelte',
      content: this.getAboutComponent()
    });

    // Error page
    files.push({
      name: 'src/routes/+error.svelte',
      language: 'svelte',
      content: this.getErrorComponent()
    });

    // Store
    files.push({
      name: `src/lib/stores/counter.${scriptExt}`,
      language: isTypeScript ? 'typescript' : 'javascript',
      content: this.getStoreConfig()
    });

    // App HTML template
    files.push({
      name: 'src/app.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>`
    });

    // App types
    files.push({
      name: 'src/app.d.ts',
      language: 'typescript',
      content: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};`
    });

    // TypeScript configuration
    if (isTypeScript) {
      files.push({
        name: 'tsconfig.json',
        language: 'json',
        content: `{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
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
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: []
};`
      });

      files.push({
        name: 'postcss.config.js',
        language: 'javascript',
        content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};`
      });

      files.push({
        name: 'src/app.css',
        language: 'css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
      });
    }

    return files;
  }

  getSvelteConfig() {
    const tailwindImport = this.config.styling === 'tailwind' ? 
      `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';` : '';

    const preprocessConfig = this.config.styling === 'tailwind' ? 
      `\n\tpreprocess: vitePreprocess(),` : '';

    return `import adapter from '@sveltejs/adapter-auto';
${tailwindImport}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors${preprocessConfig}

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;`;
  }

  getViteConfig() {
    const isTypeScript = this.config.language === 'TypeScript';
    return `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000,
		open: true
	}
});`;
  }

  getLayoutComponent() {
    const styleImport = this.config.styling === 'tailwind' ? 
      `\n\timport '../app.css';` : '';

    return `<script${this.config.language === 'TypeScript' ? ' lang="ts"' : ''}>
	import Header from '$lib/components/Header.svelte';${styleImport}
</script>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>`;
  }

  getHomeComponent() {
    const counterImport = this.config.language === 'TypeScript' ? 
      `\timport { counter } from '$lib/stores/counter';` : 
      `\timport { counter } from '$lib/stores/counter.js';`;

    return `<script${this.config.language === 'TypeScript' ? ' lang="ts"' : ''}>
${counterImport}
	import Button from '$lib/components/ui/Button.svelte';

	function increment() {
		counter.update(n => n + 1);
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		Welcome to <span class="welcome">Svelte</span>
	</h1>

	<p>
		Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
	</p>

	<div class="counter">
		<Button on:click={increment}>
			Count is {$counter}
		</Button>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
		text-align: center;
		font-size: 2rem;
		margin-bottom: 2rem;
	}

	.welcome {
		background: linear-gradient(45deg, #ff3e00, #ffa500);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.counter {
		margin-top: 2rem;
	}
</style>`;
  }

  getAboutComponent() {
    return `<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>About this app</h1>

	<p>
		This is a <a href="https://kit.svelte.dev">SvelteKit</a> app. You can make your own by typing the
		following into your command line and following the prompts:
	</p>

	<pre>npm create svelte@latest</pre>

	<p>
		The page you're looking at is purely static HTML, with no client-side interactivity needed.
		Because of that, we don't need to load any JavaScript. Try viewing the page's source, or opening
		the devtools network panel and reloading.
	</p>

	<p>
		The <a href="/todos">TODOs</a> page illustrates SvelteKit's data loading and form handling. Try
		using it with JavaScript disabled!
	</p>
</div>

<style>
	.text-column {
		display: flex;
		max-width: 48rem;
		flex: 0.6;
		flex-direction: column;
		justify-content: center;
		margin: 0 auto;
	}
</style>`;
  }

  getErrorComponent() {
    return `<script${this.config.language === 'TypeScript' ? ' lang="ts"' : ''}>
	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error?.message}</h1>`;
  }

  getStoreConfig() {
    const isTypeScript = this.config.language === 'TypeScript';
    return `import { writable } from 'svelte/store';

export const counter = writable(0);`;
  }

  getCommands() {
    const commands = {
      dev: 'vite dev',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest',
      lint: 'eslint .',
      format: 'prettier --write .'
    };

    if (this.config.language === 'TypeScript') {
      commands.check = 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json';
      commands['check:watch'] = 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch';
    }

    return commands;
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '🧡 Svelte Application',
      content: `This is a modern Svelte application built with:

- **SvelteKit**: Full-stack web framework for Svelte
- **Vite**: Lightning-fast development server and build tool
- **File-based routing**: Automatic routing based on file structure
- **Server-side rendering**: Built-in SSR and static generation
- **Progressive enhancement**: Works without JavaScript

### Project Structure:
- \`src/routes/\` - File-based routing with pages and layouts
- \`src/lib/\` - Reusable components and utilities
- \`src/lib/components/\` - Svelte components
- \`src/lib/stores/\` - Svelte stores for state management
- \`static/\` - Static assets served directly

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
        content: `This SvelteKit project is fully configured with TypeScript:

- Type-safe components with TypeScript
- Automatic type checking with svelte-check
- IntelliSense support in VS Code
- Type-safe stores and utilities

### Usage Example:
\`\`\`svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }

  let user: User | null = null;
  let loading = false;

  async function fetchUser(id: number): Promise<void> {
    loading = true;
    try {
      const response = await fetch(\`/api/users/\${id}\`);
      user = await response.json();
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if user}
  <h1>{user.name}</h1>
  <p>{user.email}</p>
{/if}
\`\`\``
      });
    }

    if (this.config.styling === 'tailwind') {
      sections.push({
        title: '🎨 Tailwind CSS Integration',
        content: `Tailwind CSS is fully configured for this SvelteKit project:

- Utility-first CSS framework
- Optimized for Vite build process
- Svelte component integration
- Responsive design utilities

### Usage Example:
\`\`\`svelte
<script>
  export let variant = 'primary';
  export let size = 'md';
  
  $: buttonClasses = [
    'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2',
    variant === 'primary' 
      ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    size === 'sm' ? 'px-3 py-1.5 text-sm' : 
    size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-base'
  ].join(' ');
</script>

<button class={buttonClasses} on:click>
  <slot />
</button>
\`\`\``
      });
    }

    return sections;
  }

  getSupportedFeatures() {
    return ['spa', 'ssr', 'ssg', 'components', 'routing', 'state-management', 'reactive'];
  }

  getSecurityGuidelines() {
    return [
      'Sanitize user inputs to prevent XSS attacks',
      'Use {@html} carefully and sanitize content',
      'Implement Content Security Policy (CSP)',
      'Validate data on both client and server side',
      'Use environment variables for sensitive data',
      'Implement proper error handling',
      'Keep dependencies updated',
      'Use SvelteKit\'s built-in CSRF protection',
      'Validate form data server-side'
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === 'vitest') {
      return `- Unit tests for components with Testing Library
- Integration tests for user flows
- Mock API calls with MSW (Mock Service Worker)
- Test SvelteKit routes and data loading
- Test Svelte stores and reactivity
- Snapshot tests for stable components`;
    } else if (this.config.testing === 'playwright') {
      return `- End-to-end tests with Playwright
- Cross-browser testing
- Test user interactions and accessibility
- Test SSR and client-side hydration
- Visual regression testing
- Performance testing`;
    }

    return `- Consider adding Vitest for unit testing
- Use Testing Library for component tests
- Test user interactions and accessibility
- Mock external dependencies
- Test reactive statements and stores
- Test SSR and client-side behavior`;
  }

  getUIGuidelines() {
    let guidelines = `### Svelte Best Practices:
- Use reactive statements for derived state
- Implement proper component props and events
- Create reusable component library
- Use stores for shared state
- Implement proper loading and error states
- Follow accessibility guidelines (WCAG)
- Use SvelteKit's progressive enhancement
- Optimize for both SSR and client-side rendering`;

    if (this.config.styling === 'tailwind') {
      guidelines += `

### Tailwind with Svelte:
- Use class directives for dynamic classes
- Create component variants with reactive statements
- Build a design system with Svelte + Tailwind
- Implement responsive design patterns
- Use Svelte's reactivity with Tailwind classes`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'ts' : 'js';
  }

  getTemplateVariables() {
    return {
      isSvelte: true,
      hasRouting: true,
      hasComponents: true,
      hasSSR: true,
      hasStateManagement: true,
      usesFileBasedRouting: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Svelte can work with various backends but not with other frontend frameworks
    const incompatible = ['react', 'vue', 'angular'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}