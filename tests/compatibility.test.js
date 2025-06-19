import { describe, test, expect } from '@jest/globals';

describe('Plugin System Compatibility', () => {
  describe('Cross-Plugin Compatibility', () => {
    test('should handle multiple technology stacks', async () => {
      // Import plugin system
      await import('../src/plugins/index.js'); // Register plugins
      const { generator } = await import('../src/generator.js');

      // Test configs for different stacks
      const testConfigs = [
        {
          projectType: 'fullstack',
          stack: 'nextjs-app',
          language: 'TypeScript',
          styling: 'tailwind',
          testing: 'vitest',
          deployment: 'vercel'
        },
        {
          projectType: 'backend',
          stack: 'express',
          language: 'TypeScript',
          database: 'postgresql',
          deployment: 'railway'
        },
        {
          projectType: 'frontend',
          stack: 'react',
          language: 'TypeScript',
          styling: 'tailwind',
          testing: 'jest'
        }
      ];

      // Test each configuration
      for (const config of testConfigs) {
        const markdown = await generator.generateMarkdown(config);
        
        // Should generate valid markdown
        expect(typeof markdown).toBe('string');
        expect(markdown.length).toBeGreaterThan(0);

        // Should contain key sections
        const keyHeaders = [
          '# 🚀 Claude Code Project Setup',
          '## Project Overview',
          '## 📁 Project Structure',
          '## 📦 Dependencies to Install'
        ];

        keyHeaders.forEach(header => {
          expect(markdown).toContain(header);
        });

        // Should contain project type info
        if (config.projectType === 'fullstack') {
          expect(markdown).toContain('Full-Stack Web App');
        } else if (config.projectType === 'backend') {
          expect(markdown).toContain('Backend API');
        } else if (config.projectType === 'frontend') {
          expect(markdown).toContain('Frontend');
        }
      }
    });

    test('should generate appropriate dependencies', async () => {
      await import('../src/plugins/index.js');
      const { generator } = await import('../src/generator.js');
      
      const config = {
        projectType: 'frontend',
        stack: 'react',
        language: 'TypeScript',
        styling: 'tailwind',
        testing: 'vitest'
      };

      const markdown = await generator.generateMarkdown(config);

      // Should contain React dependencies
      expect(markdown).toContain('react');
      expect(markdown).toContain('react-dom');
      expect(markdown).toContain('typescript');
      expect(markdown).toContain('tailwindcss');
    });

    test('should handle plugin extensibility', async () => {
      await import('../src/plugins/index.js');
      const { registry } = await import('../src/plugins/index.js');
      const { generator } = await import('../src/generator.js');

      // Test that plugins are properly registered
      const allPlugins = registry.getAllPlugins();
      expect(allPlugins.length).toBeGreaterThan(10);

      // Test that we can generate content for different plugin types
      const testConfigs = [
        { projectType: 'fullstack', stack: 'mern' },
        { projectType: 'backend', stack: 'django' },
        { projectType: 'frontend', stack: 'vue' }
      ];

      for (const config of testConfigs) {
        const markdown = await generator.generateMarkdown(config);
        expect(markdown).toContain('Claude Code Project Setup');
        expect(markdown.length).toBeGreaterThan(1000);
      }
    });
  });

  describe('Plugin Question System', () => {
    test('should generate dynamic questions', async () => {
      await import('../src/plugins/index.js');
      const { questionGenerator } = await import('../src/questions.js');
      
      const questions = await questionGenerator.getQuestions();

      // Should be an array
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);

      // Should have essential questions
      const questionNames = questions.map(q => q.name);
      expect(questionNames).toContain('projectType');
    });

    test('should adapt questions based on plugins', async () => {
      await import('../src/plugins/index.js');
      const { registry } = await import('../src/plugins/index.js');
      const { questionGenerator } = await import('../src/questions.js');

      // Should have plugins available
      const allPlugins = registry.getAllPlugins();
      expect(allPlugins.length).toBeGreaterThan(0);

      // Should generate appropriate questions
      const questions = await questionGenerator.getQuestions();
      expect(questions.length).toBeGreaterThan(5);
    });
  });

  describe('Plugin System Features', () => {
    test('should provide advanced plugin capabilities', async () => {
      const { registry } = await import('../src/plugins/index.js');

      // Plugin system should have comprehensive capabilities
      expect(registry.getAllPlugins().length).toBeGreaterThan(10);
      expect(registry.getAllCategories().length).toBeGreaterThan(0);

      // Should be able to find plugins by criteria
      const jsPlugins = registry.findPluginsByLanguage('JavaScript');
      expect(Array.isArray(jsPlugins)).toBe(true);

      const frontendPlugins = registry.findPluginsByProjectType('frontend');
      expect(Array.isArray(frontendPlugins)).toBe(true);
    });

    test('should support plugin validation', async () => {
      const { pluginTestFramework } = await import('../src/test-utils/plugin-test-framework.js');
      const { NextJSPlugin } = await import('../src/plugins/nextjs-plugin.js');

      const results = await pluginTestFramework.testPluginCompliance(NextJSPlugin);
      expect(results.passed).toBe(true);
    });

    test('should support configuration validation', async () => {
      const { validator } = await import('../src/config/schema.js');

      const validConfig = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript'
      };

      const invalidConfig = {
        projectType: 'invalid-type'
      };

      const validResult = validator.validate(validConfig);
      const invalidResult = validator.validate(invalidConfig);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    test('should have good performance', async () => {
      await import('../src/plugins/index.js');
      const { generator } = await import('../src/generator.js');
      
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript'
      };

      const start = Date.now();
      const markdown = await generator.generateMarkdown(config);
      const time = Date.now() - start;

      // Should be reasonably fast (less than 1 second)
      expect(time).toBeLessThan(1000);
      expect(markdown.length).toBeGreaterThan(1000);
    });
  });
});