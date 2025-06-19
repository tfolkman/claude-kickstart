import { BasePlugin } from './base-plugin.js';

export class T3StackPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 't3',
      displayName: 'T3 Stack',
      category: 'stack',
      projectTypes: ['fullstack'],
      languages: ['TypeScript'],
      icon: '🔺',
      description: 'Type-safe full-stack framework with Next.js, tRPC, Prisma, and Tailwind'
    };
  }

  getDependencies() {
    const deps = [
      'next',
      'react',
      'react-dom',
      '@trpc/client',
      '@trpc/next',
      '@trpc/react-query',
      '@trpc/server',
      '@tanstack/react-query',
      'superjson',
      'zod'
    ];

    // Database dependencies
    if (this.config.database === 'postgresql' || !this.config.database) {
      deps.push('@prisma/client');
    } else if (this.config.database === 'mysql') {
      deps.push('@prisma/client');
    } else if (this.config.database === 'mongodb') {
      deps.push('@prisma/client');
    }

    // Authentication
    if (this.config.authentication === 'nextauth' || !this.config.authentication) {
      deps.push('next-auth');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = [
      'typescript',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      'eslint',
      'eslint-config-next',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser'
    ];

    // Prisma for database
    if (['postgresql', 'mysql', 'mongodb', undefined].includes(this.config.database)) {
      deps.push('prisma');
    }

    // Tailwind CSS (default for T3)
    deps.push('tailwindcss', 'postcss', 'autoprefixer');

    // Testing
    if (this.config.testing === 'vitest') {
      deps.push('vitest', '@testing-library/react', 'jsdom');
    } else if (this.config.testing === 'jest') {
      deps.push('jest', '@testing-library/react', '@testing-library/jest-dom');
    }

    return deps;
  }

  getFileStructure() {
    return `src/
├── env.mjs
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── api/
│       ├── trpc/
│       │   └── [trpc].ts
│       └── auth/
│           └── [...nextauth].ts
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   └── example.ts
│   │   ├── root.ts
│   │   └── trpc.ts
│   ├── auth.ts
│   └── db.ts
├── utils/
│   └── api.ts
├── styles/
│   └── globals.css
├── components/
│   └── ui/
├── types/
│   └── next-auth.d.ts
└── prisma/
    └── schema.prisma
.env
.env.example
next.config.mjs
tailwind.config.ts
tsconfig.json
postcss.config.cjs
package.json`;
  }

  getConfigFiles() {
    const files = [];

    // Next.js config
    files.push({
      name: 'next.config.mjs',
      language: 'javascript',
      content: `/**
 * Run \`build\` or \`dev\` with \`SKIP_ENV_VALIDATION\` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using \`appDir\` then you must comment the below \`i18n\` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default config;`
    });

    // TypeScript config
    files.push({
      name: 'tsconfig.json',
      language: 'json',
      content: `{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "checkJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": [
    ".eslintrc.cjs",
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.cjs",
    "**/*.mjs"
  ],
  "exclude": ["node_modules"]
}`
    });

    // Tailwind config
    files.push({
      name: 'tailwind.config.ts',
      language: 'typescript',
      content: `import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;`
    });

    // PostCSS config
    files.push({
      name: 'postcss.config.cjs',
      language: 'javascript',
      content: `const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

module.exports = config;`
    });

    // Environment validation
    files.push({
      name: 'src/env.mjs',
      language: 'javascript',
      content: `import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL"
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include \`https\` so it can't be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    ),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * \`NEXT_PUBLIC_\`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct \`process.env\` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  /**
   * Run \`build\` or \`dev\` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * \`SOME_VAR: z.string()\` and \`SOME_VAR=""\` will throw an error.
   */
  emptyStringAsUndefined: true,
});`
    });

    // Prisma schema
    files.push({
      name: 'prisma/schema.prisma',
      language: 'prisma',
      content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql" // NOTE: sqlite, mysql, postgresql, mongodb are supported
    url      = env("DATABASE_URL")
}

model Example {
    id        String   @id @default(cuid())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

// Necessary for Next auth
model Account {
    id                String  @id @default(cuid())
    userId            String
    type              String
    provider          String
    providerAccountId String
    refresh_token     String? // @db.Text
    access_token      String? // @db.Text
    expires_at        Int?
    token_type        String?
    scope             String?
    id_token          String? // @db.Text
    session_state     String?
    user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([provider, providerAccountId])
}

model Session {
    id           String   @id @default(cuid())
    sessionToken String   @unique
    userId       String
    expires      DateTime
    user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
    id            String    @id @default(cuid())
    name          String?
    email         String?   @unique
    emailVerified DateTime?
    image         String?
    accounts      Account[]
    sessions      Session[]
}

model VerificationToken {
    identifier String
    token      String   @unique
    expires    DateTime

    @@unique([identifier, token])
}`
    });

    // tRPC API setup
    files.push({
      name: 'src/server/api/trpc.ts',
      language: 'typescript',
      content: `/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = {
  session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's \`createSSGHelpers\`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the \`session\` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees \`ctx.session.user\` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);`
    });

    // Environment example
    files.push({
      name: '.env.example',
      language: 'bash',
      content: `# Since the ".env" file is gitignored, you can use the ".env.example" file to
# build a new ".env" file when you clone the repo. Keep this file up-to-date
# when you add new variables to \`.env\`.

# This file will be committed to version control, so make sure not to have any
# secrets in it. If you are cloning this repo, create a copy of this file named
# ".env" and populate it with your secrets.

# When adding additional environment variables, the schema in "/src/env.mjs"
# should be updated accordingly.

# Prisma
# https://www.prisma.io/docs/reference/database-reference/connection-urls#env
DATABASE_URL="postgresql://postgres:password@localhost:5432/t3stack"

# Next Auth
# You can generate a new secret on the command line with:
# openssl rand -base64 32
# https://next-auth.js.org/configuration/options#secret
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Next Auth Discord Provider
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""`
    });

    return files;
  }

  getCommands() {
    return {
      dev: 'npm run dev',
      build: 'npm run build',
      start: 'npm start',
      test: 'npm test',
      lint: 'npm run lint',
      'db:push': 'npx prisma db push',
      'db:studio': 'npx prisma studio',
      'db:migrate': 'npx prisma migrate dev',
      'db:generate': 'npx prisma generate'
    };
  }

  getMarkdownSections() {
    return [
      {
        title: '🔺 T3 Stack - Type-Safe Full-Stack',
        content: `This is a T3 Stack application with the complete type-safe toolkit:

- **Next.js** - React framework with SSR/SSG
- **tRPC** - End-to-end type-safe APIs
- **Prisma** - Type-safe database ORM
- **NextAuth.js** - Authentication solution
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety throughout

### Key Features:
- 🔒 **Type Safety**: End-to-end type safety from database to frontend
- 🚀 **Performance**: Optimized with SSR, SSG, and smart bundling
- 🎨 **Modern UI**: Tailwind CSS with responsive design
- 🔐 **Authentication**: Secure auth with NextAuth.js
- 📊 **Database**: Prisma ORM with migrations

### Development Workflow:
\`\`\`bash
npm run dev         # Start development server
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Prisma Studio
npm run build       # Build for production
\`\`\`

### Environment Setup:
1. Copy \`.env.example\` to \`.env\`
2. Configure your database connection
3. Set up NextAuth secret and providers
4. Run \`npm run db:push\` to sync database`
      }
    ];
  }

  getSupportedFeatures() {
    return ['trpc', 'prisma', 'nextauth', 'type-safety', 'ssr', 'tailwind'];
  }

  getSecurityGuidelines() {
    return [
      'Always validate environment variables with Zod',
      'Use NextAuth.js for secure authentication',
      'Leverage tRPC for type-safe API calls',
      'Validate all inputs with Zod schemas',
      'Use Prisma for SQL injection protection',
      'Set secure NextAuth configuration',
      'Enable database connection security',
      'Use HTTPS in production'
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === 'vitest') {
      return `- Unit tests for tRPC procedures
- Component tests with React Testing Library
- Integration tests for API routes
- Database tests with test database
- Mock Prisma for unit tests
- Test authentication flows`;
    }

    return `- Consider adding Vitest for testing
- Test tRPC procedures and resolvers
- Component testing with React Testing Library
- Database integration tests
- Authentication flow testing`;
  }

  getUIGuidelines() {
    return `### T3 Stack Best Practices:
- Use tRPC for all client-server communication
- Leverage Prisma for type-safe database operations
- Implement proper error boundaries
- Use NextAuth.js for authentication state
- Follow Tailwind utility-first patterns
- Implement loading and error states
- Use TypeScript strict mode
- Validate all data with Zod schemas`;
  }

  getLanguageExtension() {
    return 'tsx'; // T3 Stack is TypeScript only
  }

  getTemplateVariables() {
    return {
      isT3Stack: true,
      hasTypeScript: true,
      hasTRPC: true,
      hasPrisma: true,
      hasNextAuth: true,
      hasTailwind: true,
      hasZodValidation: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // T3 Stack is a complete full-stack solution
    const incompatible = ['nextjs-app', 'nextjs-pages', 'remix', 'mern', 'mean', 'express', 'fastify'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}