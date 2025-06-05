export async function getQuestions() {
  return [
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project is this?',
      choices: [
        { name: '🌐 Full-Stack Web App', value: 'fullstack' },
        { name: '🔧 Backend API Only', value: 'backend' },
        { name: '🎨 Frontend Only', value: 'frontend' },
        { name: '💻 CLI Tool', value: 'cli' },
        { name: '📱 Mobile App', value: 'mobile' },
        { name: '🤖 Data Science/ML', value: 'datascience' },
        { name: '📦 Library/Package', value: 'library' }
      ]
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Choose your stack:',
      when: (answers) => answers.projectType === 'fullstack',
      choices: [
        { name: 'Next.js 14 (App Router)', value: 'nextjs-app' },
        { name: 'Next.js 14 (Pages Router)', value: 'nextjs-pages' },
        { name: 'Remix', value: 'remix' },
        { name: 'T3 Stack', value: 't3' },
        { name: 'MERN Stack', value: 'mern' },
        { name: 'MEAN Stack', value: 'mean' },
        { name: 'Custom', value: 'custom' }
      ]
    },
    {
      type: 'input',
      name: 'customStack',
      message: 'Describe your custom stack:',
      when: (answers) => answers.stack === 'custom'
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Choose your backend:',
      when: (answers) => answers.projectType === 'backend',
      choices: [
        { name: 'Node.js + Express', value: 'express' },
        { name: 'Node.js + Fastify', value: 'fastify' },
        { name: 'Python + FastAPI', value: 'fastapi' },
        { name: 'Python + Django', value: 'django' },
        { name: 'Go + Gin', value: 'gin' },
        { name: 'Ruby on Rails', value: 'rails' },
        { name: 'Custom', value: 'custom' }
      ]
    },
    {
      type: 'input',
      name: 'customStack',
      message: 'Describe your custom backend:',
      when: (answers) => answers.projectType === 'backend' && answers.stack === 'custom'
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Choose your frontend framework:',
      when: (answers) => answers.projectType === 'frontend',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Next.js', value: 'nextjs' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Svelte', value: 'svelte' },
        { name: 'Angular', value: 'angular' },
        { name: 'Vanilla JS', value: 'vanilla' },
        { name: 'Custom', value: 'custom' }
      ]
    },
    {
      type: 'input',
      name: 'customStack',
      message: 'Describe your custom frontend:',
      when: (answers) => answers.projectType === 'frontend' && answers.stack === 'custom'
    },
    {
      type: 'input',
      name: 'customStack',
      message: 'Describe your tech stack:',
      when: (answers) => ['cli', 'mobile', 'datascience', 'library'].includes(answers.projectType)
    },
    {
      type: 'list',
      name: 'language',
      message: 'Primary language:',
      choices: (answers) => {
        const pythonStacks = ['fastapi', 'django', 'datascience'];
        const goStacks = ['gin'];
        const rubyStacks = ['rails'];
        
        if (pythonStacks.includes(answers.stack) || answers.projectType === 'datascience') {
          return ['Python'];
        } else if (goStacks.includes(answers.stack)) {
          return ['Go'];
        } else if (rubyStacks.includes(answers.stack)) {
          return ['Ruby'];
        } else {
          return [
            'TypeScript',
            'JavaScript',
            'Python',
            'Go',
            'Java',
            'Other'
          ];
        }
      }
    },
    {
      type: 'input',
      name: 'customLanguage',
      message: 'Specify your language:',
      when: (answers) => answers.language === 'Other'
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      when: (answers) => ['TypeScript', 'JavaScript'].includes(answers.language),
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'bun', value: 'bun' }
      ]
    },
    {
      type: 'list',
      name: 'database',
      message: 'Database choice:',
      when: (answers) => ['fullstack', 'backend'].includes(answers.projectType),
      choices: [
        { name: 'PostgreSQL', value: 'postgresql' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'MongoDB', value: 'mongodb' },
        { name: 'SQLite', value: 'sqlite' },
        { name: 'Supabase', value: 'supabase' },
        { name: 'Firebase', value: 'firebase' },
        { name: 'Other', value: 'other' },
        { name: 'None yet', value: 'none' }
      ]
    },
    {
      type: 'input',
      name: 'customDatabase',
      message: 'Specify your database:',
      when: (answers) => answers.database === 'other'
    },
    {
      type: 'list',
      name: 'authentication',
      message: 'Authentication strategy:',
      when: (answers) => ['fullstack', 'backend'].includes(answers.projectType),
      choices: (answers) => {
        const choices = [];
        
        if (answers.stack?.includes('nextjs')) {
          choices.push({ name: 'NextAuth.js', value: 'nextauth' });
        }
        
        choices.push(
          { name: 'Clerk', value: 'clerk' },
          { name: 'Auth0', value: 'auth0' },
          { name: 'Supabase Auth', value: 'supabase-auth' },
          { name: 'Custom JWT', value: 'jwt' },
          { name: 'Other', value: 'other' },
          { name: 'None yet', value: 'none' }
        );
        
        return choices;
      }
    },
    {
      type: 'input',
      name: 'customAuthentication',
      message: 'Specify your authentication strategy:',
      when: (answers) => answers.authentication === 'other'
    },
    {
      type: 'list',
      name: 'styling',
      message: 'Styling approach:',
      when: (answers) => ['fullstack', 'frontend'].includes(answers.projectType),
      choices: [
        { name: 'Tailwind CSS', value: 'tailwind' },
        { name: 'CSS Modules', value: 'css-modules' },
        { name: 'Styled Components', value: 'styled-components' },
        { name: 'Vanilla CSS', value: 'vanilla-css' },
        { name: 'Sass/SCSS', value: 'scss' },
        { name: 'Emotion', value: 'emotion' }
      ]
    },
    {
      type: 'list',
      name: 'componentLibrary',
      message: 'Component library:',
      when: (answers) => ['fullstack', 'frontend'].includes(answers.projectType),
      choices: [
        { name: 'shadcn/ui (recommended)', value: 'shadcn' },
        { name: 'Mantine', value: 'mantine' },
        { name: 'Material UI', value: 'mui' },
        { name: 'Ant Design', value: 'antd' },
        { name: 'Chakra UI', value: 'chakra' },
        { name: 'None - build from scratch', value: 'none' }
      ]
    },
    {
      type: 'list',
      name: 'testing',
      message: 'Testing framework:',
      choices: (answers) => {
        const choices = [];
        
        if (['TypeScript', 'JavaScript'].includes(answers.language)) {
          choices.push(
            { name: 'Jest', value: 'jest' },
            { name: 'Vitest', value: 'vitest' },
            { name: 'Playwright (E2E)', value: 'playwright' },
            { name: 'Cypress (E2E)', value: 'cypress' }
          );
        } else if (answers.language === 'Python') {
          choices.push(
            { name: 'Pytest', value: 'pytest' },
            { name: 'Unittest', value: 'unittest' }
          );
        } else if (answers.language === 'Go') {
          choices.push({ name: 'Go testing', value: 'go-test' });
        }
        
        choices.push({ name: 'None yet', value: 'none' });
        
        return choices;
      }
    },
    {
      type: 'list',
      name: 'deployment',
      message: 'Where will this deploy?',
      choices: [
        { name: 'Vercel', value: 'vercel' },
        { name: 'Netlify', value: 'netlify' },
        { name: 'AWS', value: 'aws' },
        { name: 'Google Cloud', value: 'gcp' },
        { name: 'Fly.io', value: 'fly' },
        { name: 'Railway', value: 'railway' },
        { name: 'Docker/Self-hosted', value: 'docker' },
        { name: 'Not sure yet', value: 'unsure' }
      ]
    },
    {
      type: 'checkbox',
      name: 'codeStyle',
      message: 'Select your coding style: (space to select)',
      choices: [
        { name: 'TypeScript strict mode', value: 'ts-strict', checked: true },
        { name: 'Functional over OOP', value: 'functional', checked: true },
        { name: 'Self-documenting code', value: 'self-documenting', checked: true },
        { name: 'Detailed comments', value: 'comments' },
        { name: 'Early returns', value: 'early-returns', checked: true },
        { name: 'Comprehensive error handling', value: 'error-handling', checked: true }
      ]
    },
    {
      type: 'checkbox',
      name: 'claudeBehavior',
      message: 'How should Claude work with you?',
      choices: [
        { name: 'Explain complex decisions', value: 'explain', checked: true },
        { name: 'Ask before major changes', value: 'ask-first', checked: true },
        { name: 'Write tests first (TDD)', value: 'tdd', checked: true },
        { name: 'Move fast, break things', value: 'fast' },
        { name: 'Follow existing patterns', value: 'patterns', checked: true }
      ]
    },
    {
      type: 'list',
      name: 'gitCommitStyle',
      message: 'Git commit style:',
      choices: [
        { name: 'Conventional commits (feat:, fix:)', value: 'conventional' },
        { name: 'Simple commits', value: 'simple' },
        { name: 'Detailed commits with body', value: 'detailed' }
      ]
    },
    {
      type: 'list',
      name: 'branchStrategy',
      message: 'Branch naming strategy:',
      choices: [
        { name: 'feature/branch-name', value: 'feature-slash' },
        { name: 'feature-branch-name', value: 'feature-dash' },
        { name: 'username/feature', value: 'username' }
      ]
    },
    {
      type: 'confirm',
      name: 'wantAdvancedOptions',
      message: 'Configure advanced Claude Code options? (MCP servers, workflows, team settings)',
      default: false
    },
    {
      type: 'checkbox',
      name: 'mcpServers',
      message: 'Which MCP servers do you want to use?',
      when: (answers) => answers.wantAdvancedOptions,
      choices: [
        { name: 'Puppeteer (browser automation)', value: 'puppeteer' },
        { name: 'Sentry (error tracking)', value: 'sentry' },
        { name: 'Database tools', value: 'database' },
        { name: 'File system tools', value: 'filesystem' },
        { name: 'Git tools', value: 'git' },
        { name: 'None needed', value: 'none' }
      ]
    },
    {
      type: 'list',
      name: 'preferredWorkflow',
      message: 'Preferred development workflow with Claude:',
      when: (answers) => answers.wantAdvancedOptions,
      choices: [
        { name: 'Explore → Plan → Code → Commit (recommended)', value: 'explore-plan-code' },
        { name: 'Test-Driven Development (write tests first)', value: 'tdd' },
        { name: 'Screenshot-driven UI development', value: 'screenshot-ui' },
        { name: 'Safe YOLO (let Claude work autonomously)', value: 'safe-yolo' },
        { name: 'Multiple Claude instances (parallel work)', value: 'multi-claude' },
        { name: 'Standard (no specific workflow)', value: 'standard' }
      ],
      default: 'explore-plan-code'
    },
    {
      type: 'checkbox',
      name: 'teamFeatures',
      message: 'Team collaboration features to enable:',
      when: (answers) => answers.wantAdvancedOptions,
      choices: [
        { name: 'Shared .mcp.json (team MCP servers)', value: 'shared-mcp' },
        { name: 'Team slash commands', value: 'team-commands' },
        { name: 'Standardized tool allowlist', value: 'team-allowlist' },
        { name: 'Code review automation', value: 'review-automation' },
        { name: 'Issue triage setup', value: 'issue-triage' },
        { name: 'None needed', value: 'none' }
      ]
    },
    {
      type: 'confirm',
      name: 'saveProfile',
      message: 'Save these settings for next time?',
      default: true
    },
    {
      type: 'input',
      name: 'profileName',
      message: 'Profile name:',
      when: (answers) => answers.saveProfile,
      default: (answers) => {
        const stack = answers.stack || answers.projectType;
        return `${stack}-${answers.language}`.toLowerCase().replace(/\s+/g, '-');
      }
    }
  ];
}