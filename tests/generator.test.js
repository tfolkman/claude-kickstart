import { jest } from '@jest/globals';

// Mock child_process before importing generator
jest.unstable_mockModule('child_process', () => ({
  execSync: jest.fn()
}));

const { generateMarkdown } = await import('../src/generator.js');
const { execSync } = await import('child_process');

describe('Markdown Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMarkdown', () => {
    it('should generate basic markdown with minimal config', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        packageManager: 'npm'
      };

      const result = await generateMarkdown(config);

      expect(result).toContain('# 🚀 Claude Code Project Setup');
      expect(result).toContain('Next.js 14 (App Router)');
      expect(result).toContain('TypeScript');
      expect(result).toContain('npm run dev');
    });

    it('should handle custom stack correctly', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'custom',
        customStack: 'Rust + Actix Web',
        language: 'Other',
        customLanguage: 'Rust'
      };

      const result = await generateMarkdown(config);

      expect(result).toContain('Rust + Actix Web');
      expect(result).toContain('Rust');
      expect(result).toContain('Custom project structure for: Rust + Actix Web');
    });

    it('should include GitHub CLI section when not detected', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const config = { projectType: 'fullstack' };
      const result = await generateMarkdown(config);

      expect(result).toContain('## 🚨 GitHub CLI Recommended');
      expect(result).toContain('brew install gh');
    });

    it('should include GitHub CLI section when detected', async () => {
      execSync.mockReturnValue('');

      const config = { projectType: 'fullstack' };
      const result = await generateMarkdown(config);

      expect(result).toContain('## ✅ GitHub CLI Detected');
      expect(result).toContain('No additional setup needed!');
    });

    it('should include MCP configuration when servers selected', async () => {
      const config = {
        projectType: 'fullstack',
        mcpServers: ['puppeteer', 'sentry']
      };

      const result = await generateMarkdown(config);

      expect(result).toContain('## 🔧 MCP Server Configuration');
      expect(result).toContain('.mcp.json');
      expect(result).toContain('puppeteer');
      expect(result).toContain('sentry');
    });

    it('should not include MCP section when none selected', async () => {
      const config = {
        projectType: 'fullstack',
        mcpServers: ['none']
      };

      const result = await generateMarkdown(config);

      expect(result).not.toContain('## 🔧 MCP Server Configuration');
    });

    it('should include workflow section for TDD preference', async () => {
      const config = {
        projectType: 'fullstack',
        preferredWorkflow: 'tdd'
      };

      const result = await generateMarkdown(config);

      expect(result).toContain('## 🧪 Test-Driven Development Workflow');
      expect(result).toContain('Write Tests First');
    });

    it('should include team collaboration features', async () => {
      const config = {
        projectType: 'fullstack',
        teamFeatures: ['shared-mcp', 'team-allowlist']
      };

      const result = await generateMarkdown(config);

      expect(result).toContain('## 👥 Team Collaboration Setup');
      expect(result).toContain('Shared MCP Configuration');
      expect(result).toContain('Standardized Tool Allowlist');
    });

    it('should generate stack-specific tool allowlist', async () => {
      const config = {
        projectType: 'fullstack',
        language: 'TypeScript',
        testing: 'jest',
        mcpServers: ['puppeteer']
      };

      const result = await generateMarkdown(config);

      expect(result).toContain('## 🛠️ Recommended Tool Allowlist');
      expect(result).toContain('Bash(npm:*)');
      expect(result).toContain('Bash(jest:*)');
      expect(result).toContain('mcp__puppeteer__*');
    });

    it('should handle database configuration', async () => {
      const config = {
        projectType: 'fullstack',
        database: 'other',
        customDatabase: 'Redis'
      };

      const result = await generateMarkdown(config);

      expect(result).toContain('Redis');
    });

    it('should handle authentication configuration', async () => {
      const config = {
        projectType: 'fullstack',
        authentication: 'clerk'
      };

      const result = await generateMarkdown(config);

      // The config doesn't directly show authentication in the overview
      // but it should be processed without errors
      expect(result).toContain('Full-Stack Web App');
    });
  });

  describe('Helper Functions', () => {
    it('should detect stack labels correctly', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app'
      };

      const result = await generateMarkdown(config);
      expect(result).toContain('Next.js 14 (App Router)');
    });

    it('should handle Python stack correctly', async () => {
      const config = {
        projectType: 'backend',
        stack: 'fastapi',
        language: 'Python'
      };

      const result = await generateMarkdown(config);
      expect(result).toContain('Python + FastAPI');
      expect(result).toContain('Python');
    });
  });
});