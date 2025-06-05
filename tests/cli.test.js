import { jest } from '@jest/globals';

describe('CLI Integration', () => {
  describe('CLI Structure', () => {
    it('should be able to import CLI modules without errors', async () => {
      // Test that our CLI modules can be imported
      const { getQuestions } = await import('../src/questions.js');
      const { generateMarkdown } = await import('../src/generator.js');
      
      expect(typeof getQuestions).toBe('function');
      expect(typeof generateMarkdown).toBe('function');
    });

    it('should have proper package.json configuration', async () => {
      const fs = await import('fs/promises');
      const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
      
      expect(pkg.bin).toBeDefined();
      expect(pkg.bin['claude-kickstart']).toBe('./bin/cli.js');
      expect(pkg.bin['ck']).toBe('./bin/cli.js');
    });

    it('should have executable CLI file', async () => {
      const fs = await import('fs/promises');
      const stats = await fs.stat('bin/cli.js');
      
      expect(stats.isFile()).toBe(true);
    });
  });
});