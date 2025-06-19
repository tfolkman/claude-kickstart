import { registry } from './plugins/index.js';

export class DynamicQuestionGenerator {
  constructor() {
    this.registry = registry;
  }

  async getQuestions() {
    const questions = [];

    // Base questions that determine the flow
    questions.push(...this.getBaseQuestions());

    return questions;
  }

  getBaseQuestions() {
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
        choices: (answers) => this.getStackChoices(answers.projectType)
      },
      {
        type: 'list',
        name: 'stack',
        message: 'Choose your backend:',
        when: (answers) => answers.projectType === 'backend',
        choices: (answers) => this.getStackChoices(answers.projectType)
      },
      {
        type: 'list',
        name: 'stack',
        message: 'Choose your frontend framework:',
        when: (answers) => answers.projectType === 'frontend',
        choices: (answers) => this.getStackChoices(answers.projectType)
      },
      {
        type: 'input',
        name: 'customStack',
        message: 'Describe your custom stack:',
        when: (answers) => answers.stack === 'custom'
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
        choices: (answers) => this.getLanguageChoices(answers),
        when: (answers) => !this.isLanguageImpliedByStack(answers.stack)
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
        when: (answers) => this.needsPackageManager(answers),
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
        when: (answers) => this.needsDatabase(answers),
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
        when: (answers) => this.needsAuthentication(answers),
        choices: (answers) => this.getAuthenticationChoices(answers)
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
        when: (answers) => this.needsStyling(answers),
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
        when: (answers) => this.needsComponentLibrary(answers),
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
        choices: (answers) => this.getTestingChoices(answers)
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
      ...this.getStylePreferenceQuestions(),
      ...this.getAdvancedQuestions(),
      ...this.getProfileQuestions()
    ];
  }

  getStackChoices(projectType) {
    const plugins = this.registry.findPluginsByProjectType(projectType);
    const choices = plugins.map(({ metadata }) => ({
      name: `${metadata.icon || '📦'} ${metadata.displayName}`,
      value: metadata.name
    }));

    // Add custom option
    choices.push({ name: 'Custom', value: 'custom' });

    return choices;
  }

  getLanguageChoices(answers) {
    // Get language suggestions from selected stack
    if (answers.stack && answers.stack !== 'custom') {
      const plugin = this.registry.get(answers.stack);
      if (plugin && plugin.metadata.languages) {
        return plugin.metadata.languages;
      }
    }

    // Default language choices
    return [
      'TypeScript',
      'JavaScript',
      'Python',
      'Go',
      'Java',
      'Other'
    ];
  }

  getAuthenticationChoices(answers) {
    const choices = [];
    
    // Stack-specific auth options
    if (answers.stack?.includes('nextjs')) {
      choices.push({ name: 'NextAuth.js', value: 'nextauth' });
    }
    
    // Universal auth options
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

  getTestingChoices(answers) {
    const choices = [];
    const language = answers.language || this.getImpliedLanguage(answers.stack);
    
    if (['TypeScript', 'JavaScript'].includes(language)) {
      choices.push(
        { name: 'Jest', value: 'jest' },
        { name: 'Vitest', value: 'vitest' },
        { name: 'Playwright (E2E)', value: 'playwright' },
        { name: 'Cypress (E2E)', value: 'cypress' }
      );
    } else if (language === 'Python') {
      choices.push(
        { name: 'Pytest', value: 'pytest' },
        { name: 'Unittest', value: 'unittest' }
      );
    } else if (language === 'Go') {
      choices.push({ name: 'Go testing', value: 'go-test' });
    }
    
    choices.push({ name: 'None yet', value: 'none' });
    
    return choices;
  }

  getStylePreferenceQuestions() {
    return [
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
      }
    ];
  }

  getAdvancedQuestions() {
    return [
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
      }
    ];
  }

  getProfileQuestions() {
    return [
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
          const language = answers.language || this.getImpliedLanguage(answers.stack);
          return `${stack}-${language}`.toLowerCase().replace(/\s+/g, '-');
        }
      }
    ];
  }

  // Add plugin-specific questions
  async getPluginQuestions(stackName, answers) {
    const plugin = this.registry.get(stackName);
    if (!plugin) return [];

    try {
      const instance = this.registry.createInstance(stackName, answers);
      return instance.getQuestions();
    } catch (error) {
      console.warn(`Failed to get questions from plugin ${stackName}:`, error.message);
      return [];
    }
  }

  // Utility methods for conditional questions
  isLanguageImpliedByStack(stack) {
    const stacksWithImpliedLanguages = {
      'fastapi': 'Python',
      'django': 'Python',
      'gin': 'Go',
      'rails': 'Ruby'
    };
    return !!stacksWithImpliedLanguages[stack];
  }

  getImpliedLanguage(stack) {
    const stacksWithImpliedLanguages = {
      'fastapi': 'Python',
      'django': 'Python',
      'gin': 'Go',
      'rails': 'Ruby'
    };
    return stacksWithImpliedLanguages[stack] || 'JavaScript';
  }

  needsPackageManager(answers) {
    const language = answers.language || this.getImpliedLanguage(answers.stack);
    return ['TypeScript', 'JavaScript'].includes(language);
  }

  needsDatabase(answers) {
    return ['fullstack', 'backend'].includes(answers.projectType);
  }

  needsAuthentication(answers) {
    return ['fullstack', 'backend'].includes(answers.projectType);
  }

  needsStyling(answers) {
    return ['fullstack', 'frontend'].includes(answers.projectType);
  }

  needsComponentLibrary(answers) {
    return ['fullstack', 'frontend'].includes(answers.projectType);
  }

  // Get all questions including plugin-specific ones
  async getAllQuestions() {
    const baseQuestions = await this.getQuestions();
    
    // This could be extended to dynamically add plugin questions
    // based on answers, but for now we'll use the base questions
    return baseQuestions;
  }

  // Validate answers against plugin requirements
  validateAnswers(answers) {
    const errors = [];
    const warnings = [];

    // Basic validation
    if (answers.stack === 'custom' && !answers.customStack) {
      errors.push('Custom stack description is required');
    }

    if (answers.language === 'Other' && !answers.customLanguage) {
      errors.push('Custom language is required');
    }

    // Plugin compatibility validation
    if (answers.stack && answers.stack !== 'custom') {
      const conflicts = this.registry.validatePluginCompatibility([answers.stack]);
      if (conflicts.length > 0) {
        warnings.push(...conflicts.map(c => c.reason));
      }
    }

    return { errors, warnings };
  }
}

export const questionGenerator = new DynamicQuestionGenerator();