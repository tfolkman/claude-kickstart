import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { BasePlugin } from '../src/plugins/base-plugin.js';
import { PluginRegistry } from '../src/plugins/registry.js';
import { pluginTestFramework } from '../src/test-utils/plugin-test-framework.js';

describe('Plugin System', () => {
  let registry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  afterEach(() => {
    registry = null;
  });

  describe('BasePlugin', () => {
    test('should be abstract and require implementation', () => {
      expect(() => {
        BasePlugin.metadata;
      }).toThrow('Plugin must implement static metadata getter');
    });

    test('should provide default implementations', () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack'
          };
        }
      };

      const plugin = new TestPlugin();
      
      expect(plugin.getDependencies()).toEqual({ production: [], development: [] });
      expect(plugin.getDevDependencies()).toEqual([]);
      expect(plugin.getFileStructure()).toBe('');
      expect(plugin.getConfigFiles()).toEqual([]);
      expect(plugin.getMarkdownSections()).toEqual([]);
      expect(plugin.getQuestions()).toEqual([]);
      expect(plugin.getSupportedFeatures()).toEqual([]);
      expect(plugin.isCompatibleWith(plugin)).toBe(true);
    });

    test('should validate configuration', () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack'
          };
        }
      };

      expect(() => new TestPlugin()).not.toThrow();
      expect(() => new TestPlugin({})).not.toThrow();
      expect(() => new TestPlugin({ test: 'value' })).not.toThrow();
    });
  });

  describe('PluginRegistry', () => {
    test('should register and retrieve plugins', () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack'
          };
        }
      };

      registry.register(TestPlugin);
      
      expect(registry.get('test')).toBe(TestPlugin);
      expect(registry.getAllPlugins()).toHaveLength(1);
    });

    test('should prevent duplicate registration', () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack'
          };
        }
      };

      registry.register(TestPlugin);
      
      expect(() => {
        registry.register(TestPlugin);
      }).toThrow('Plugin test is already registered');
    });

    test('should validate plugin classes', () => {
      expect(() => {
        registry.register(null);
      }).toThrow('Invalid plugin class');

      expect(() => {
        registry.register({});
      }).toThrow('Invalid plugin class');

      const InvalidPlugin = class {
        static get metadata() {
          return { name: 'invalid' };
        }
      };

      expect(() => {
        registry.register(InvalidPlugin);
      }).toThrow('Invalid plugin class');
    });

    test('should organize plugins by category', () => {
      const StackPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'stack-test',
            displayName: 'Stack Test',
            category: 'stack'
          };
        }
      };

      const DatabasePlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'db-test',
            displayName: 'Database Test',
            category: 'database'
          };
        }
      };

      registry.register(StackPlugin);
      registry.register(DatabasePlugin);

      const stackPlugins = registry.getByCategory('stack');
      const dbPlugins = registry.getByCategory('database');

      expect(stackPlugins).toHaveLength(1);
      expect(dbPlugins).toHaveLength(1);
      expect(stackPlugins[0].id).toBe('stack-test');
      expect(dbPlugins[0].id).toBe('db-test');
    });

    test('should create plugin instances', () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack'
          };
        }
      };

      registry.register(TestPlugin);
      
      const instance = registry.createInstance('test', { test: 'config' });
      
      expect(instance).toBeInstanceOf(TestPlugin);
      expect(instance.config).toEqual({ test: 'config' });
    });

    test('should find plugins by criteria', () => {
      const JSPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'js-plugin',
            displayName: 'JS Plugin',
            category: 'stack',
            languages: ['JavaScript'],
            projectTypes: ['frontend']
          };
        }
      };

      const TSPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'ts-plugin',
            displayName: 'TS Plugin',
            category: 'stack',
            languages: ['TypeScript'],
            projectTypes: ['fullstack']
          };
        }
      };

      registry.register(JSPlugin);
      registry.register(TSPlugin);

      const jsPlugins = registry.findPluginsByLanguage('JavaScript');
      const frontendPlugins = registry.findPluginsByProjectType('frontend');

      expect(jsPlugins).toHaveLength(1);
      expect(frontendPlugins).toHaveLength(1);
      expect(jsPlugins[0].id).toBe('js-plugin');
      expect(frontendPlugins[0].id).toBe('js-plugin');
    });
  });

  describe('Plugin Test Framework', () => {
    test('should validate plugin compliance', async () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack',
            languages: ['JavaScript'],
            projectTypes: ['frontend']
          };
        }
      };

      const results = await pluginTestFramework.testPluginCompliance(TestPlugin);
      
      expect(results.passed).toBe(true);
      expect(results.pluginName).toBe('test');
      expect(results.results.every(r => r.passed)).toBe(true);
    });

    test('should test plugin integration', async () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack',
            languages: ['JavaScript'],
            projectTypes: ['frontend']
          };
        }
      };

      const results = await pluginTestFramework.testPluginIntegration(TestPlugin);
      
      expect(results.integrationPassed).toBe(true);
      expect(results.pluginName).toBe('test');
    });

    test('should run all tests for a plugin', async () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack',
            languages: ['JavaScript'],
            projectTypes: ['frontend']
          };
        }
      };

      const results = await pluginTestFramework.runAllTests(TestPlugin);
      
      expect(results.allPassed).toBe(true);
      expect(results.pluginName).toBe('test');
      expect(results.results.compliance).toBeDefined();
      expect(results.results.integration).toBeDefined();
      expect(results.results.performance).toBeDefined();
    });

    test('should generate test reports', async () => {
      const TestPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test',
            displayName: 'Test Plugin',
            category: 'stack',
            languages: ['JavaScript'],
            projectTypes: ['frontend']
          };
        }
      };

      const results = await pluginTestFramework.runAllTests(TestPlugin);
      const report = pluginTestFramework.generateTestReport(results);
      
      expect(report).toContain('# Plugin Test Report');
      expect(report).toContain('test');
      expect(report).toContain('✅ PASSED');
    });

    test('should detect invalid plugins', async () => {
      const InvalidPlugin = class {
        static get metadata() {
          return { name: 'invalid' };
        }
      };

      const results = await pluginTestFramework.testPluginCompliance(InvalidPlugin);
      
      expect(results.passed).toBe(false);
      expect(results.results.some(r => !r.passed)).toBe(true);
    });
  });

  describe('Plugin Compatibility', () => {
    test('should detect compatible plugins', () => {
      const TestPlugin1 = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test1',
            displayName: 'Test Plugin 1',
            category: 'stack'
          };
        }
      };

      const TestPlugin2 = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test2',
            displayName: 'Test Plugin 2',
            category: 'database'
          };
        }
      };

      const plugin1 = new TestPlugin1();
      const plugin2 = new TestPlugin2();
      
      expect(plugin1.isCompatibleWith(plugin2)).toBe(true);
    });

    test('should detect incompatible plugins', () => {
      const TestPlugin1 = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test1',
            displayName: 'Test Plugin 1',
            category: 'stack'
          };
        }

        isCompatibleWith(otherPlugin) {
          return otherPlugin.constructor.metadata.name !== 'test2';
        }
      };

      const TestPlugin2 = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test2',
            displayName: 'Test Plugin 2',
            category: 'stack'
          };
        }
      };

      const plugin1 = new TestPlugin1();
      const plugin2 = new TestPlugin2();
      
      expect(plugin1.isCompatibleWith(plugin2)).toBe(false);
    });

    test('should validate plugin combinations', () => {
      const TestPlugin1 = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test1',
            displayName: 'Test Plugin 1',
            category: 'stack'
          };
        }

        isCompatibleWith(otherPlugin) {
          return otherPlugin.constructor.metadata.name !== 'test2';
        }
      };

      const TestPlugin2 = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'test2',
            displayName: 'Test Plugin 2',
            category: 'stack'
          };
        }
      };

      registry.register(TestPlugin1);
      registry.register(TestPlugin2);
      
      const conflicts = registry.validatePluginCompatibility(['test1', 'test2']);
      
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing plugins gracefully', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
      
      expect(() => {
        registry.createInstance('nonexistent');
      }).toThrow('Plugin nonexistent not found');
    });

    test('should handle plugin instantiation errors', () => {
      const BrokenPlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'broken',
            displayName: 'Broken Plugin',
            category: 'stack'
          };
        }
        
        constructor(config) {
          super(config);
          throw new Error('Intentional error');
        }
      };

      registry.register(BrokenPlugin);
      
      expect(() => {
        registry.createInstance('broken');
      }).toThrow('Intentional error');
    });

    test('should handle invalid plugin registration', () => {
      const IncompletePlugin = class extends BasePlugin {
        static get metadata() {
          return {
            name: 'incomplete'
            // Missing required fields
          };
        }
      };

      expect(() => {
        registry.register(IncompletePlugin);
      }).toThrow('Invalid plugin class');
    });
  });
});