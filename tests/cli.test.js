import { jest } from '@jest/globals';

describe('CLI Integration', () => {
  describe('CLI Structure', () => {
    it('should be able to import plugin-based CLI modules without errors', async () => {
      // Test that our plugin-based CLI modules can be imported
      const { questionGenerator } = await import('../src/questions.js');
      const { generator } = await import('../src/generator.js');
      const { runWizard } = await import('../src/index.js');
      
      expect(typeof questionGenerator).toBe('object');
      expect(typeof generator).toBe('object');
      expect(typeof runWizard).toBe('function');
    });

    it('should be able to import plugin system without errors', async () => {
      // Test that our plugin system can be imported
      const { registry, BasePlugin } = await import('../src/plugins/index.js');
      
      expect(registry).toBeDefined();
      expect(BasePlugin).toBeDefined();
      expect(typeof BasePlugin).toBe('function');
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