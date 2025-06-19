import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { registry } from './plugins/registry.js';
import { templateEngine } from './templates/template-engine.js';
import { validator } from './config/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ModularGenerator {
  constructor() {
    this.templateEngine = templateEngine;
    this.registry = registry;
    this.validator = validator;
  }

  async generateMarkdown(config) {
    // Validate configuration
    const validation = this.validator.validate(config);
    if (!validation.isValid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    // Sanitize configuration
    const sanitizedConfig = this.validator.sanitize(config);

    // Determine which plugins to use
    const plugins = this.selectPlugins(sanitizedConfig);

    // Gather all data from plugins
    const templateData = await this.gatherTemplateData(sanitizedConfig, plugins);

    // Render the template
    const templatePath = path.join(__dirname, 'templates', 'base.md');
    const markdown = await this.templateEngine.renderFile(templatePath, templateData);

    return markdown;
  }

  selectPlugins(config) {
    const selectedPlugins = [];

    // Select primary stack plugin
    if (config.stack && config.stack !== 'custom') {
      const stackPlugin = this.registry.get(config.stack);
      if (stackPlugin) {
        selectedPlugins.push(this.registry.createInstance(config.stack, config));
      }
    }

    // Select database plugin
    if (config.database && config.database !== 'none') {
      const dbPlugin = this.registry.get(`${config.database}-plugin`);
      if (dbPlugin) {
        selectedPlugins.push(this.registry.createInstance(`${config.database}-plugin`, config));
      }
    }

    // Select testing plugin
    if (config.testing && config.testing !== 'none') {
      const testPlugin = this.registry.get(`${config.testing}-plugin`);
      if (testPlugin) {
        selectedPlugins.push(this.registry.createInstance(`${config.testing}-plugin`, config));
      }
    }

    // Select styling plugin
    if (config.styling) {
      const stylePlugin = this.registry.get(`${config.styling}-plugin`);
      if (stylePlugin) {
        selectedPlugins.push(this.registry.createInstance(`${config.styling}-plugin`, config));
      }
    }

    return selectedPlugins;
  }

  async gatherTemplateData(config, plugins) {
    const date = new Date().toISOString().split('T')[0];
    const profileName = config.profileName || 'custom';

    // Base template data
    const templateData = {
      // Metadata
      version: '2.0.0',
      profileName,
      date,

      // Project info
      projectTypeLabel: this.getProjectTypeLabel(config.projectType),
      stackLabel: this.getStackLabel(config.stack, config.customStack),
      languageLabel: this.getLanguageLabel(config.language, config.customLanguage),
      databaseLabel: this.getDatabaseLabel(config.database, config.customDatabase),
      deploymentLabel: this.getDeploymentLabel(config.deployment),

      // Package manager
      packageManager: config.packageManager || 'npm',

      // Style preferences
      codeStyleLabels: config.codeStyle?.map(style => this.getCodeStyleLabel(style)) || [],
      claudeBehaviorLabels: config.claudeBehavior?.map(behavior => this.getClaudeBehaviorLabel(behavior)) || [],
      gitCommitLabel: this.getGitCommitLabel(config.gitCommitStyle),
      branchStrategyLabel: this.getBranchStrategyLabel(config.branchStrategy),

      // Testing and UI
      testingLabel: this.getTestingLabel(config.testing),
      stylingLabel: this.getStylingLabel(config.styling),
      componentLibraryLabel: this.getComponentLibraryLabel(config.componentLibrary),

      // Collections that will be populated by plugins
      productionDependencies: [],
      developmentDependencies: [],
      configFiles: [],
      customSections: [],
      commands: {
        dev: `${config.packageManager || 'npm'} run dev`,
        build: `${config.packageManager || 'npm'} run build`,
        test: `${config.packageManager || 'npm'} test`,
        testWatch: `${config.packageManager || 'npm'} test:watch`,
        lint: `${config.packageManager || 'npm'} run lint`
      },
      securityGuidelines: [
        'Never commit .env files',
        'Validate all user inputs',
        'Use environment variables for secrets',
        'Implement proper authentication',
        'Enable CORS appropriately',
        'Use HTTPS in production',
        'Regular dependency updates',
        'SQL injection prevention (if using SQL)',
        'XSS protection'
      ]
    };

    // Gather data from plugins
    for (const plugin of plugins) {
      await this.gatherPluginData(plugin, templateData, config);
    }

    // Generate file structure
    templateData.fileStructure = this.generateFileStructure(config, plugins);

    // Generate testing strategy
    templateData.testingStrategy = this.generateTestingStrategy(config, plugins);

    // Generate UI guidelines
    templateData.uiGuidelines = this.generateUIGuidelines(config, plugins);

    // Generate special sections
    templateData.githubCLISection = this.generateGitHubCLISection();
    templateData.mcpSection = this.generateMCPSection(config);
    templateData.toolAllowlistSection = this.generateToolAllowlistSection(config);
    templateData.workflowSection = this.generateWorkflowSection(config);
    templateData.teamCollaborationSection = this.generateTeamCollaborationSection(config);

    return templateData;
  }

  async gatherPluginData(plugin, templateData, config) {
    // Dependencies
    const deps = plugin.getDependencies();
    templateData.productionDependencies.push(...deps.production);
    templateData.developmentDependencies.push(...deps.development);

    // Config files
    const configFiles = plugin.getConfigFiles();
    templateData.configFiles.push(...configFiles);

    // Custom sections
    const sections = plugin.getMarkdownSections();
    templateData.customSections.push(...sections);

    // Commands
    const commands = plugin.getCommands();
    Object.assign(templateData.commands, commands);

    // Security guidelines
    const security = plugin.getSecurityGuidelines();
    templateData.securityGuidelines.push(...security);

    // Template variables
    const variables = plugin.getTemplateVariables();
    Object.assign(templateData, variables);

    // Call lifecycle hooks
    await plugin.beforeGeneration(config);
  }

  generateFileStructure(config, plugins) {
    // Try to get file structure from primary plugin
    const primaryPlugin = plugins.find(p => p.constructor.metadata.category === 'stack');
    if (primaryPlugin) {
      return primaryPlugin.getFileStructure();
    }

    // Fallback to basic structure
    const ext = this.getFileExtension(config.language, config.customLanguage);
    return `src/
└── index.${ext}`;
  }

  generateTestingStrategy(config, plugins) {
    const testingPlugin = plugins.find(p => p.constructor.metadata.category === 'testing');
    if (testingPlugin) {
      return testingPlugin.getTestingStrategy();
    }

    const strategies = {
      'jest': `- Write unit tests for all utilities and hooks
- Component tests with React Testing Library
- Mock external dependencies
- Aim for 80% code coverage`,
      'vitest': `- Use Vitest for fast unit testing
- Component tests with React Testing Library
- Integration tests for API routes
- Run tests in watch mode during development`,
      'playwright': `- E2E tests for critical user flows
- Test across multiple browsers
- Visual regression testing
- API testing capabilities`,
      'none': `- No testing framework configured yet
- Consider adding tests as the project grows`
    };

    return strategies[config.testing] || strategies.none;
  }

  generateUIGuidelines(config, plugins) {
    const stylingPlugin = plugins.find(p => p.constructor.metadata.category === 'styling');
    if (stylingPlugin) {
      return stylingPlugin.getUIGuidelines();
    }

    if (!config.styling) return '';

    const guidelines = {
      'tailwind': `- Use Tailwind utility classes
- Create reusable component classes with @apply
- Mobile-first responsive design
- Use CSS variables for theming`,
      'styled-components': `- Create styled components for reusability
- Use theme provider for consistent styling
- Implement CSS-in-JS best practices`,
      'css-modules': `- One CSS module per component
- Use camelCase for class names
- Compose styles for variants`
    };

    return guidelines[config.styling] || '';
  }

  // Utility functions
  detectGitHubCLI() {
    try {
      execSync('which gh', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  generateGitHubCLISection() {
    const hasGH = this.detectGitHubCLI();
    
    if (hasGH) {
      return `## ✅ GitHub CLI Detected

Great! You have GitHub CLI installed. Claude can use it for:
- Creating and managing pull requests
- Reading and creating issues  
- Handling GitHub operations
- Code review automation

No additional setup needed!`;
    } else {
      return `## 🚨 GitHub CLI Recommended

Consider installing GitHub CLI for enhanced Claude Code experience:

\`\`\`bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Windows
winget install --id GitHub.cli
\`\`\`

After installation: \`gh auth login\`

Benefits: Claude can create PRs, manage issues, and automate GitHub workflows.`;
    }
  }

  generateMCPSection(config) {
    if (!config.mcpServers || config.mcpServers.includes('none')) {
      return '';
    }

    const serverConfigs = [];
    
    if (config.mcpServers.includes('puppeteer')) {
      serverConfigs.push(`  "puppeteer": {
    "command": "npx",
    "args": ["@mcp-server/puppeteer"]
  }`);
    }
    
    if (config.mcpServers.includes('sentry')) {
      serverConfigs.push(`  "sentry": {
    "command": "npx",
    "args": ["@mcp-server/sentry"],
    "env": {
      "SENTRY_AUTH_TOKEN": "your-sentry-token"
    }
  }`);
    }
    
    if (config.mcpServers.includes('database')) {
      serverConfigs.push(`  "database": {
    "command": "npx",
    "args": ["@mcp-server/database"],
    "env": {
      "DATABASE_URL": "your-database-url"
    }
  }`);
    }
    
    if (serverConfigs.length === 0) return '';

    return `## 🔧 MCP Server Configuration

Create \`.mcp.json\` in your project root:

\`\`\`json
{
  "mcpServers": {
${serverConfigs.join(',\n')}
  }
}
\`\`\`

These MCP servers will be available to Claude for enhanced functionality.`;
  }

  generateToolAllowlistSection(config) {
    const tools = ['Edit', 'Write'];
    
    if (['TypeScript', 'JavaScript'].includes(config.language)) {
      tools.push('Bash(npm:*)', 'Bash(yarn:*)', 'Bash(pnpm:*)');
    }
    
    if (config.language === 'Python') {
      tools.push('Bash(pip:*)', 'Bash(python:*)');
    }
    
    if (config.testing !== 'none') {
      tools.push('Bash(test:*)', 'Bash(jest:*)', 'Bash(pytest:*)');
    }
    
    tools.push('Bash(git:*)');
    
    if (config.mcpServers && !config.mcpServers.includes('none')) {
      if (config.mcpServers.includes('puppeteer')) {
        tools.push('mcp__puppeteer__*');
      }
      if (config.mcpServers.includes('sentry')) {
        tools.push('mcp__sentry__*');
      }
    }

    return `## 🛠️ Recommended Tool Allowlist

Consider allowing these tools in Claude Code for smoother workflow:

\`\`\`bash
# In Claude Code, use /permissions to add:
${tools.map(tool => `- ${tool}`).join('\n')}
\`\`\`

Or add to your \`.claude/settings.json\`:
\`\`\`json
{
  "allowedTools": [${tools.map(t => `"${t}"`).join(', ')}]
}
\`\`\``;
  }

  generateWorkflowSection(config) {
    if (!config.preferredWorkflow || config.preferredWorkflow === 'standard') {
      return '';
    }

    const workflows = {
      'explore-plan-code': `## 🔄 Recommended Workflow: Explore → Plan → Code

Your preferred workflow optimizes for thoughtful development:

1. **Explore Phase**
   - Ask Claude to read relevant files (don't code yet!)
   - Use subagents for complex investigations
   - Example: "Read the authentication system but don't write code yet"

2. **Plan Phase** 
   - Ask Claude to "think" and create a detailed plan
   - Use "think hard" for complex problems
   - Save plans as documents or GitHub issues for later reference

3. **Code Phase**
   - Implement the planned solution
   - Ask Claude to verify reasonableness as it codes
   - Iterate based on feedback

4. **Commit Phase**
   - Have Claude create descriptive commit messages
   - Create pull requests with context-rich descriptions`,

      'tdd': `## 🧪 Test-Driven Development Workflow

Your TDD approach ensures robust, well-tested code:

1. **Write Tests First**
   - Ask Claude to write tests based on expected behavior
   - Be explicit: "We're doing TDD - don't write implementation yet"
   - Ensure tests fail initially

2. **Commit Tests**
   - Commit failing tests before implementation
   - This creates a clear development checkpoint

3. **Implement & Iterate**
   - Write code to make tests pass
   - Don't modify tests during implementation
   - Iterate until all tests pass

4. **Verify & Commit**
   - Use subagents to verify implementation quality
   - Commit working code with descriptive messages`
    };

    return workflows[config.preferredWorkflow] || '';
  }

  generateTeamCollaborationSection(config) {
    if (!config.teamFeatures || config.teamFeatures.includes('none')) {
      return '';
    }

    let content = '## 👥 Team Collaboration Setup\n\n';
    
    if (config.teamFeatures.includes('shared-mcp')) {
      content += `### Shared MCP Configuration
- Check \`.mcp.json\` into git for team-wide MCP server access
- All team members get the same Claude Code capabilities
- No individual setup required for new team members

`;
    }
    
    if (config.teamFeatures.includes('team-commands')) {
      content += `### Team Slash Commands
Create shared commands in \`.claude/commands/\`:
- \`fix-github-issue.md\` - Automated issue resolution
- \`deploy-staging.md\` - Standardized deployment process
- \`run-security-scan.md\` - Security verification workflow

`;
    }

    return content.trim();
  }

  // Label helper functions
  getProjectTypeLabel(type) {
    const labels = {
      'fullstack': 'Full-Stack Web App',
      'backend': 'Backend API',
      'frontend': 'Frontend',
      'cli': 'CLI Tool',
      'mobile': 'Mobile App',
      'datascience': 'Data Science/ML',
      'library': 'Library/Package'
    };
    return labels[type] || type;
  }

  getStackLabel(stack, customStack) {
    const labels = {
      'nextjs-app': 'Next.js 14 (App Router)',
      'nextjs-pages': 'Next.js 14 (Pages Router)',
      'remix': 'Remix',
      't3': 'T3 Stack',
      'mern': 'MERN Stack',
      'mean': 'MEAN Stack',
      'express': 'Node.js + Express',
      'fastify': 'Node.js + Fastify',
      'fastapi': 'Python + FastAPI',
      'django': 'Python + Django',
      'gin': 'Go + Gin',
      'rails': 'Ruby on Rails',
      'react': 'React',
      'vue': 'Vue.js',
      'svelte': 'Svelte',
      'angular': 'Angular',
      'vanilla': 'Vanilla JS'
    };
    
    if (stack === 'custom' && customStack) {
      return customStack;
    }
    
    return labels[stack] || customStack || stack || 'Custom';
  }

  getLanguageLabel(language, customLanguage) {
    if (language === 'Other' && customLanguage) {
      return customLanguage;
    }
    return language || 'Not specified';
  }

  getDatabaseLabel(database, customDatabase) {
    const labels = {
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'sqlite': 'SQLite',
      'supabase': 'Supabase',
      'firebase': 'Firebase',
      'none': 'None'
    };
    
    if (database === 'other' && customDatabase) {
      return customDatabase;
    }
    
    return labels[database] || database;
  }

  getDeploymentLabel(deployment) {
    const labels = {
      'vercel': 'Vercel',
      'netlify': 'Netlify',
      'aws': 'AWS',
      'gcp': 'Google Cloud',
      'fly': 'Fly.io',
      'railway': 'Railway',
      'docker': 'Docker/Self-hosted',
      'unsure': 'Not decided yet'
    };
    return labels[deployment] || deployment;
  }

  getFileExtension(language, customLanguage) {
    const lang = language === 'Other' ? customLanguage : language;
    const extensions = {
      'TypeScript': 'ts',
      'JavaScript': 'js',
      'Python': 'py',
      'Go': 'go',
      'Java': 'java',
      'Ruby': 'rb',
      'Rust': 'rs',
      'C++': 'cpp',
      'C#': 'cs'
    };
    return extensions[lang] || 'js';
  }

  getCodeStyleLabel(style) {
    const labels = {
      'ts-strict': 'TypeScript strict mode enabled',
      'functional': 'Prefer functional programming patterns',
      'self-documenting': 'Write self-documenting code',
      'comments': 'Include detailed comments',
      'early-returns': 'Use early returns for clarity',
      'error-handling': 'Comprehensive error handling'
    };
    return labels[style] || style;
  }

  getClaudeBehaviorLabel(behavior) {
    const labels = {
      'explain': 'Explain complex architectural decisions',
      'ask-first': 'Ask before making major changes',
      'tdd': 'Write tests before implementation (TDD)',
      'fast': 'Move fast and iterate quickly',
      'patterns': 'Follow existing code patterns'
    };
    return labels[behavior] || behavior;
  }

  getGitCommitLabel(style) {
    const labels = {
      'conventional': 'Conventional commits (feat:, fix:, etc.)',
      'simple': 'Simple, concise commit messages',
      'detailed': 'Detailed commits with body'
    };
    return labels[style] || style;
  }

  getBranchStrategyLabel(strategy) {
    const labels = {
      'feature-slash': 'feature/branch-name',
      'feature-dash': 'feature-branch-name',
      'username': 'username/feature-name'
    };
    return labels[strategy] || strategy;
  }

  getTestingLabel(testing) {
    const labels = {
      'jest': 'Jest',
      'vitest': 'Vitest',
      'playwright': 'Playwright (E2E)',
      'cypress': 'Cypress (E2E)',
      'pytest': 'Pytest',
      'unittest': 'Python unittest',
      'go-test': 'Go testing',
      'none': 'None configured yet'
    };
    return labels[testing] || testing;
  }

  getStylingLabel(styling) {
    const labels = {
      'tailwind': 'Tailwind CSS',
      'css-modules': 'CSS Modules',
      'styled-components': 'Styled Components',
      'vanilla-css': 'Vanilla CSS',
      'scss': 'Sass/SCSS',
      'emotion': 'Emotion'
    };
    return labels[styling] || styling;
  }

  getComponentLibraryLabel(library) {
    const labels = {
      'shadcn': 'shadcn/ui',
      'mantine': 'Mantine',
      'mui': 'Material UI',
      'antd': 'Ant Design',
      'chakra': 'Chakra UI',
      'none': 'None - custom components'
    };
    return labels[library] || library;
  }
}

export const generator = new ModularGenerator();