import { BasePlugin } from "./base-plugin.js";

export class NextJSPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: "nextjs-app",
      displayName: "Next.js 14 (App Router)",
      category: "stack",
      projectTypes: ["fullstack", "frontend"],
      languages: ["TypeScript", "JavaScript"],
      icon: "⚡",
      description: "Modern React framework with App Router",
    };
  }

  getDependencies() {
    return {
      production: ["next", "react", "react-dom"],
      development: this.getDevDependencies(),
    };
  }

  getDevDependencies() {
    const deps = ["eslint", "eslint-config-next"];

    if (this.config.language === "TypeScript") {
      deps.push(
        "typescript",
        "@types/node",
        "@types/react",
        "@types/react-dom"
      );
    }

    if (this.config.styling === "tailwind") {
      deps.push("tailwindcss", "postcss", "autoprefixer");
    }

    return deps;
  }

  getFileStructure() {
    return `src/
├── app/
│   ├── page.${this.getLanguageExtension()}
│   ├── layout.${this.getLanguageExtension()}
│   ├── globals.css
│   └── api/
│       └── hello/
│           └── route.${this.getLanguageExtension()}
├── components/
│   └── ui/
├── lib/
│   └── utils.${this.getLanguageExtension()}
├── public/
├── .env.local
├── next.config.js
${this.config.language === "TypeScript" ? "├── tsconfig.json" : ""}
${this.config.styling === "tailwind" ? "├── tailwind.config.ts" : ""}
└── package.json`;
  }

  getConfigFiles() {
    const files = [];

    // Next.js config
    files.push({
      name: "next.config.js",
      language: "javascript",
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;`,
    });

    // TypeScript config
    if (this.config.language === "TypeScript") {
      files.push({
        name: "tsconfig.json",
        language: "json",
        content: `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
      });
    }

    // Tailwind config
    if (this.config.styling === "tailwind") {
      files.push({
        name: "tailwind.config.ts",
        language: "typescript",
        content: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config`,
      });

      files.push({
        name: "postcss.config.js",
        language: "javascript",
        content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      });
    }

    // Environment file
    files.push({
      name: ".env.example",
      language: "bash",
      content: `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# API Keys
# Add your API keys here`,
    });

    return files;
  }

  getCommands() {
    return {
      dev: "npm run dev",
      build: "npm run build",
      start: "npm run start",
      test: "npm test",
      lint: "npm run lint",
    };
  }

  getMarkdownSections() {
    const sections = [];

    // Next.js specific section
    sections.push({
      title: "🔧 Next.js Configuration",
      content: `This project uses Next.js 14 with the App Router:

- **App Router**: Modern routing with layouts and nested routes
- **Server Components**: React Server Components by default
- **API Routes**: Built-in API endpoints in \`app/api/\`
- **Optimizations**: Built-in image, font, and script optimizations

### Key Directories:
- \`app/\` - App Router pages and layouts
- \`components/\` - Reusable React components
- \`lib/\` - Utility functions and configurations
- \`public/\` - Static assets`,
    });

    if (this.config.styling === "tailwind") {
      sections.push({
        title: "🎨 Tailwind CSS Setup",
        content: `Tailwind CSS is configured for this Next.js project:

- Utility-first CSS framework
- Configured for App Router file structure
- PostCSS integration included
- Responsive design utilities available

### Usage:
\`\`\`jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello Tailwind!
</div>
\`\`\``,
      });
    }

    return sections;
  }

  getQuestions() {
    return [
      {
        type: "list",
        name: "nextjsFeatures",
        message: "Which Next.js features do you want to include?",
        choices: [
          {
            name: "App Router (recommended)",
            value: "app-router",
            checked: true,
          },
          { name: "TypeScript", value: "typescript" },
          { name: "Tailwind CSS", value: "tailwind" },
          { name: "ESLint", value: "eslint", checked: true },
        ],
      },
    ];
  }

  getSupportedFeatures() {
    return ["ssr", "ssg", "api-routes", "image-optimization", "routing"];
  }

  getSecurityGuidelines() {
    return [
      "Use environment variables for API keys",
      "Enable CSRF protection for API routes",
      "Validate all API route inputs",
      "Use Next.js built-in security headers",
      "Implement proper authentication for protected routes",
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === "jest") {
      return `- Unit tests for components with React Testing Library
- Integration tests for API routes
- Mock Next.js router for component tests
- Test custom hooks separately
- Snapshot tests for stable components`;
    }

    return `- Consider adding Jest for component testing
- Test API routes with supertest
- Use Playwright for E2E testing
- Mock external API calls in tests`;
  }

  getUIGuidelines() {
    let guidelines = `### Next.js UI Best Practices:
- Use Server Components by default
- Client Components only when needed (interactivity, browser APIs)
- Leverage Next.js Image component for optimized images
- Use Next.js fonts for performance
- Implement proper loading and error states`;

    if (this.config.styling === "tailwind") {
      guidelines += `

### Tailwind with Next.js:
- Use Tailwind utility classes
- Create component variants with clsx/cn utility
- Mobile-first responsive design
- Use CSS variables for theming`;
    }

    return guidelines;
  }

  getLanguageExtension() {
    return this.config.language === "TypeScript" ? "tsx" : "jsx";
  }

  getTemplateVariables() {
    return {
      isNextJS: true,
      hasAppRouter: true,
      supportsSSR: true,
      hasImageOptimization: true,
    };
  }

  isCompatibleWith(otherPlugin) {
    const incompatible = ["vue", "angular", "svelte", "react"];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}

export class NextJSPagesPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: "nextjs-pages",
      displayName: "Next.js 14 (Pages Router)",
      category: "stack",
      projectTypes: ["fullstack", "frontend"],
      languages: ["TypeScript", "JavaScript"],
      icon: "⚡",
      description: "Next.js with traditional Pages Router",
    };
  }

  getDependencies() {
    return {
      production: ["next", "react", "react-dom"],
      development: this.getDevDependencies(),
    };
  }

  getFileStructure() {
    return `src/
├── pages/
│   ├── _app.${this.getLanguageExtension()}
│   ├── _document.${this.getLanguageExtension()}
│   ├── index.${this.getLanguageExtension()}
│   └── api/
│       └── hello.${this.getLanguageExtension()}
├── components/
├── styles/
│   └── globals.css
├── public/
├── .env.local
├── next.config.js
${this.config.language === "TypeScript" ? "├── tsconfig.json" : ""}
└── package.json`;
  }

  getLanguageExtension() {
    return this.config.language === "TypeScript" ? "tsx" : "jsx";
  }

  isCompatibleWith(otherPlugin) {
    const incompatible = ["vue", "angular", "svelte", "react"];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}
