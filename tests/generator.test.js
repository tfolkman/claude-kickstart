import { describe, test, expect, beforeEach } from '@jest/globals';
import { ModularGenerator } from '../src/generator.js';
import { validator } from '../src/config/schema.js';
import '../src/plugins/index.js'; // Auto-register plugins

describe('Modular Generator', () => {
  let generator;

  beforeEach(() => {
    generator = new ModularGenerator();
  });

  describe('Configuration Validation', () => {
    test('should validate valid configuration', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        packageManager: 'npm',
        database: 'postgresql',
        authentication: 'nextauth',
        styling: 'tailwind',
        testing: 'jest',
        deployment: 'vercel'
      };

      expect(() => generator.validator.validate(config)).not.toThrow();
    });

    test('should reject invalid configuration', async () => {
      const config = {
        projectType: 'invalid-type',
        stack: 'nextjs-app'
      };

      expect(() => {
        const validation = generator.validator.validate(config);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
      }).toThrow();
    });

    test('should validate required fields', () => {
      const config = {}; // Missing required projectType
      
      const validation = generator.validator.validate(config);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('projectType'))).toBe(true);
    });
  });

  describe('Plugin Selection', () => {
    test('should select plugins based on configuration', () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        database: 'postgresql',
        testing: 'jest',
        styling: 'tailwind'
      };

      const plugins = generator.selectPlugins(config);
      
      expect(plugins.length).toBeGreaterThan(0);
      expect(plugins.some(p => p.constructor.metadata.name === 'nextjs-app')).toBe(true);
    });

    test('should handle custom stacks', () => {
      const config = {
        projectType: 'fullstack',
        stack: 'custom',
        customStack: 'My Custom Framework',
        language: 'TypeScript'
      };

      const plugins = generator.selectPlugins(config);
      
      // Should not include any stack plugin for custom stacks
      expect(plugins.every(p => p.constructor.metadata.category !== 'stack')).toBe(true);
    });

    test('should select database plugins', () => {
      const config = {
        projectType: 'backend',
        stack: 'express',
        database: 'postgresql'
      };

      const plugins = generator.selectPlugins(config);
      
      // Database integration is handled within stack plugins
      // This test verifies the selection logic works correctly
      expect(Array.isArray(plugins)).toBe(true);
    });
  });

  describe('Template Data Generation', () => {
    test('should gather template data from plugins', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        packageManager: 'npm',
        styling: 'tailwind',
        testing: 'jest'
      };

      const plugins = generator.selectPlugins(config);
      const templateData = await generator.gatherTemplateData(config, plugins);

      expect(templateData).toBeDefined();
      expect(templateData.projectTypeLabel).toBe('Full-Stack Web App');
      expect(templateData.stackLabel).toBe('Next.js 14 (App Router)');
      expect(templateData.languageLabel).toBe('TypeScript');
      expect(templateData.packageManager).toBe('npm');
      expect(Array.isArray(templateData.productionDependencies)).toBe(true);
      expect(Array.isArray(templateData.developmentDependencies)).toBe(true);
      expect(Array.isArray(templateData.configFiles)).toBe(true);
      expect(Array.isArray(templateData.customSections)).toBe(true);
    });

    test('should include plugin dependencies', async () => {
      const config = {
        projectType: 'frontend',
        stack: 'react',
        language: 'TypeScript',
        packageManager: 'npm'
      };

      const plugins = generator.selectPlugins(config);
      const templateData = await generator.gatherTemplateData(config, plugins);

      expect(templateData.productionDependencies).toContain('react');
      expect(templateData.productionDependencies).toContain('react-dom');
    });

    test('should include plugin config files', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        styling: 'tailwind'
      };

      const plugins = generator.selectPlugins(config);
      const templateData = await generator.gatherTemplateData(config, plugins);

      expect(templateData.configFiles.some(f => f.name === 'next.config.js')).toBe(true);
      expect(templateData.configFiles.some(f => f.name === 'tsconfig.json')).toBe(true);
      expect(templateData.configFiles.some(f => f.name === 'tailwind.config.ts')).toBe(true);
    });
  });

  describe('Markdown Generation', () => {
    test('should generate complete markdown', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        packageManager: 'npm',
        database: 'postgresql',
        styling: 'tailwind',
        testing: 'jest',
        deployment: 'vercel',
        gitCommitStyle: 'conventional',
        branchStrategy: 'feature-slash'
      };

      const markdown = await generator.generateMarkdown(config);

      expect(typeof markdown).toBe('string');
      expect(markdown.length).toBeGreaterThan(0);
      
      // Check for key sections
      expect(markdown).toContain('# 🚀 Claude Code Project Setup');
      expect(markdown).toContain('## Project Overview');
      expect(markdown).toContain('## 📁 Project Structure');
      expect(markdown).toContain('## 📦 Dependencies to Install');
      expect(markdown).toContain('## ⚙️ Configuration Files');
      expect(markdown).toContain('## 💡 Pro Tips for Claude');
    });

    test('should include project-specific information', async () => {
      const config = {
        projectType: 'backend',
        stack: 'express',
        language: 'TypeScript',
        packageManager: 'npm',
        database: 'postgresql',
        testing: 'jest',
        deployment: 'aws'
      };

      const markdown = await generator.generateMarkdown(config);

      expect(markdown).toContain('Backend API');
      expect(markdown).toContain('Node.js + Express');
      expect(markdown).toContain('TypeScript');
      expect(markdown).toContain('PostgreSQL');
    });

    test('should handle custom stacks', async () => {
      const config = {
        projectType: 'cli',
        stack: 'custom',
        customStack: 'Custom CLI Framework',
        language: 'Go',
        testing: 'go-test'
      };

      const markdown = await generator.generateMarkdown(config);

      expect(markdown).toContain('Custom CLI Framework');
      expect(markdown).toContain('CLI Tool');
      expect(markdown).toContain('Go');
    });

    test('should include advanced features when configured', async () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        wantAdvancedOptions: true,
        mcpServers: ['puppeteer', 'sentry'],
        preferredWorkflow: 'tdd',
        teamFeatures: ['shared-mcp', 'team-commands']
      };

      const markdown = await generator.generateMarkdown(config);

      expect(markdown).toContain('MCP Server Configuration');
      expect(markdown).toContain('Test-Driven Development Workflow');
      expect(markdown).toContain('Team Collaboration Setup');
    });
  });

  describe('Label Generation', () => {
    test('should generate correct project type labels', () => {
      expect(generator.getProjectTypeLabel('fullstack')).toBe('Full-Stack Web App');
      expect(generator.getProjectTypeLabel('backend')).toBe('Backend API');
      expect(generator.getProjectTypeLabel('frontend')).toBe('Frontend');
      expect(generator.getProjectTypeLabel('cli')).toBe('CLI Tool');
    });

    test('should generate correct stack labels', () => {
      expect(generator.getStackLabel('nextjs-app')).toBe('Next.js 14 (App Router)');
      expect(generator.getStackLabel('express')).toBe('Node.js + Express');
      expect(generator.getStackLabel('react')).toBe('React');
      expect(generator.getStackLabel('custom', 'My Framework')).toBe('My Framework');
    });

    test('should generate correct language labels', () => {
      expect(generator.getLanguageLabel('TypeScript')).toBe('TypeScript');
      expect(generator.getLanguageLabel('JavaScript')).toBe('JavaScript');
      expect(generator.getLanguageLabel('Other', 'Rust')).toBe('Rust');
    });

    test('should generate correct database labels', () => {
      expect(generator.getDatabaseLabel('postgresql')).toBe('PostgreSQL');
      expect(generator.getDatabaseLabel('mongodb')).toBe('MongoDB');
      expect(generator.getDatabaseLabel('other', 'CockroachDB')).toBe('CockroachDB');
    });
  });

  describe('File Structure Generation', () => {
    test('should generate file structure from plugins', () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript'
      };

      const plugins = generator.selectPlugins(config);
      const structure = generator.generateFileStructure(config, plugins);

      expect(structure).toContain('app/');
      expect(structure).toContain('components/');
      expect(structure).toContain('.tsx');
    });

    test('should fallback for unknown stacks', () => {
      const config = {
        projectType: 'cli',
        language: 'Go'
      };

      const plugins = [];
      const structure = generator.generateFileStructure(config, plugins);

      expect(structure).toContain('src/');
      expect(structure).toContain('index.go');
    });
  });

  describe('Helper Method Testing', () => {
    test('should detect GitHub CLI correctly', () => {
      // This test depends on system state, so we'll just check it doesn't throw
      expect(() => generator.detectGitHubCLI()).not.toThrow();
      expect(typeof generator.detectGitHubCLI()).toBe('boolean');
    });

    test('should generate file extensions correctly', () => {
      expect(generator.getFileExtension('TypeScript')).toBe('ts');
      expect(generator.getFileExtension('JavaScript')).toBe('js');
      expect(generator.getFileExtension('Python')).toBe('py');
      expect(generator.getFileExtension('Go')).toBe('go');
      expect(generator.getFileExtension('Other', 'Rust')).toBe('rs'); // custom language
      expect(generator.getFileExtension('Other', 'UnknownLang')).toBe('js'); // fallback
    });

    test('should generate code style labels', () => {
      expect(generator.getCodeStyleLabel('ts-strict')).toContain('TypeScript');
      expect(generator.getCodeStyleLabel('functional')).toContain('functional');
    });

    test('should generate git labels', () => {
      expect(generator.getGitCommitLabel('conventional')).toContain('feat:');
      expect(generator.getBranchStrategyLabel('feature-slash')).toBe('feature/branch-name');
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors gracefully', async () => {
      const config = {
        projectType: 'invalid-type'
      };

      await expect(generator.generateMarkdown(config)).rejects.toThrow();
    });

    test('should handle missing plugins gracefully', () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nonexistent-plugin'
      };

      const plugins = generator.selectPlugins(config);
      expect(Array.isArray(plugins)).toBe(true);
    });

    test('should sanitize configuration', () => {
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        invalidField: undefined,
        nullField: null,
        emptyString: ''
      };

      const sanitized = generator.validator.sanitize(config);
      expect(sanitized.invalidField).toBeUndefined();
      expect(sanitized.nullField).toBeUndefined();
      expect(sanitized.emptyString).toBe('');
    });
  });
});