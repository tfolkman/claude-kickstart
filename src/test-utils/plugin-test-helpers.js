import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { BasePlugin } from '../plugins/base-plugin.js';
import { pluginTestFramework } from './plugin-test-framework.js';

/**
 * Test helper for individual plugin testing
 */
export class PluginTestHelpers {
  /**
   * Create a comprehensive test suite for a plugin
   * @param {class} PluginClass - The plugin class to test
   * @param {object} options - Test configuration options
   */
  static createPluginTestSuite(PluginClass, options = {}) {
    const {
      name = PluginClass.metadata?.name || 'Unknown',
      displayName = PluginClass.metadata?.displayName || 'Unknown Plugin',
      requiredDependencies = [],
      requiredDevDependencies = [],
      requiredConfigFiles = [],
      customTests = [],
      skipIntegrationTests = false,
      skipPerformanceTests = false
    } = options;

    return () => {
      describe(`${displayName} Plugin`, () => {
        let plugin;

        beforeEach(() => {
          plugin = new PluginClass();
        });

        afterEach(() => {
          plugin = null;
        });

        // Basic metadata tests
        describe('Metadata', () => {
          test('should have valid metadata', () => {
            const metadata = PluginClass.metadata;
            
            expect(metadata).toBeDefined();
            expect(metadata.name).toBe(name);
            expect(metadata.displayName).toBe(displayName);
            expect(metadata.category).toBeDefined();
            expect(typeof metadata.description).toBe('string');
          });

          test('should extend BasePlugin', () => {
            expect(plugin).toBeInstanceOf(BasePlugin);
          });

          test('should have required metadata fields', () => {
            const metadata = PluginClass.metadata;
            
            expect(metadata.name).toBeTruthy();
            expect(metadata.displayName).toBeTruthy();
            expect(metadata.category).toBeTruthy();
            expect(Array.isArray(metadata.projectTypes)).toBe(true);
            expect(Array.isArray(metadata.languages)).toBe(true);
          });
        });

        // Dependencies tests
        describe('Dependencies', () => {
          test('should provide dependencies', () => {
            const deps = plugin.getDependencies();
            
            expect(deps).toBeDefined();
            expect(deps.production).toBeDefined();
            expect(deps.development).toBeDefined();
            expect(Array.isArray(deps.production)).toBe(true);
            expect(Array.isArray(deps.development)).toBe(true);
          });

          if (requiredDependencies.length > 0) {
            test('should include required dependencies', () => {
              const deps = plugin.getDependencies();
              
              requiredDependencies.forEach(dep => {
                expect(deps.production).toContain(dep);
              });
            });
          }

          if (requiredDevDependencies.length > 0) {
            test('should include required dev dependencies', () => {
              const deps = plugin.getDependencies();
              
              requiredDevDependencies.forEach(dep => {
                expect(deps.development).toContain(dep);
              });
            });
          }

          test('should not have duplicate dependencies', () => {
            const deps = plugin.getDependencies();
            const allDeps = [...deps.production, ...deps.development];
            const uniqueDeps = [...new Set(allDeps)];
            
            expect(allDeps.length).toBe(uniqueDeps.length);
          });
        });

        // File structure tests
        describe('File Structure', () => {
          test('should provide file structure', () => {
            const structure = plugin.getFileStructure();
            
            expect(typeof structure).toBe('string');
            expect(structure.length).toBeGreaterThan(0);
          });

          test('should have valid file structure format', () => {
            const structure = plugin.getFileStructure();
            
            // Should contain some common patterns
            const hasFiles = structure.includes('.') || structure.includes('/');
            expect(hasFiles).toBe(true);
          });
        });

        // Configuration files tests
        describe('Configuration Files', () => {
          test('should provide configuration files', () => {
            const configFiles = plugin.getConfigFiles();
            
            expect(Array.isArray(configFiles)).toBe(true);
          });

          test('configuration files should have required properties', () => {
            const configFiles = plugin.getConfigFiles();
            
            configFiles.forEach(file => {
              expect(file.name).toBeDefined();
              expect(file.language).toBeDefined();
              expect(file.content).toBeDefined();
              expect(typeof file.name).toBe('string');
              expect(typeof file.language).toBe('string');
              expect(typeof file.content).toBe('string');
            });
          });

          if (requiredConfigFiles.length > 0) {
            test('should include required config files', () => {
              const configFiles = plugin.getConfigFiles();
              const fileNames = configFiles.map(f => f.name);
              
              requiredConfigFiles.forEach(requiredFile => {
                expect(fileNames.some(name => name.includes(requiredFile))).toBe(true);
              });
            });
          }
        });

        // Method implementation tests
        describe('Method Implementations', () => {
          test('should implement all required methods', () => {
            expect(typeof plugin.getDependencies).toBe('function');
            expect(typeof plugin.getDevDependencies).toBe('function');
            expect(typeof plugin.getFileStructure).toBe('function');
            expect(typeof plugin.getConfigFiles).toBe('function');
            expect(typeof plugin.getMarkdownSections).toBe('function');
            expect(typeof plugin.getQuestions).toBe('function');
            expect(typeof plugin.getCommands).toBe('function');
            expect(typeof plugin.getSupportedFeatures).toBe('function');
            expect(typeof plugin.getSecurityGuidelines).toBe('function');
            expect(typeof plugin.isCompatibleWith).toBe('function');
          });

          test('should return correct types from methods', () => {
            expect(Array.isArray(plugin.getMarkdownSections())).toBe(true);
            expect(Array.isArray(plugin.getQuestions())).toBe(true);
            expect(typeof plugin.getCommands()).toBe('object');
            expect(Array.isArray(plugin.getSupportedFeatures())).toBe(true);
            expect(Array.isArray(plugin.getSecurityGuidelines())).toBe(true);
          });
        });

        // Configuration adaptation tests
        describe('Configuration Adaptation', () => {
          test('should handle empty configuration', () => {
            expect(() => new PluginClass({})).not.toThrow();
          });

          test('should handle TypeScript configuration', () => {
            const tsPlugin = new PluginClass({ language: 'TypeScript' });
            const deps = tsPlugin.getDependencies();
            
            // Most plugins should add TypeScript-related dependencies
            if (PluginClass.metadata.languages?.includes('TypeScript')) {
              const hasTypescriptDeps = deps.development.some(dep => 
                dep.includes('typescript') || dep.includes('@types/')
              );
              expect(hasTypescriptDeps).toBe(true);
            }
          });

          test('should handle different project types', () => {
            const projectTypes = PluginClass.metadata.projectTypes || [];
            
            projectTypes.forEach(projectType => {
              expect(() => new PluginClass({ projectType })).not.toThrow();
            });
          });
        });

        // Framework compliance tests
        if (!skipIntegrationTests) {
          describe('Framework Compliance', () => {
            test('should pass plugin compliance tests', async () => {
              const results = await pluginTestFramework.testPluginCompliance(PluginClass);
              
              if (!results.passed) {
                const failedTests = results.results.filter(r => !r.passed);
                console.error('Failed compliance tests:', failedTests);
              }
              
              expect(results.passed).toBe(true);
            });

            test('should pass integration tests', async () => {
              const results = await pluginTestFramework.testPluginIntegration(PluginClass);
              
              expect(results.integrationPassed).toBe(true);
            });
          });
        }

        // Performance tests
        if (!skipPerformanceTests) {
          describe('Performance', () => {
            test('should pass performance tests', async () => {
              const results = await pluginTestFramework.testPluginPerformance(PluginClass);
              
              expect(results).toBeDefined();
              expect(results.name).toBe('Plugin Performance');
              expect(results.iterations).toBe(100);
            });

            test('should instantiate quickly', () => {
              const startTime = Date.now();
              
              for (let i = 0; i < 10; i++) {
                new PluginClass();
              }
              
              const endTime = Date.now();
              const avgTime = (endTime - startTime) / 10;
              
              expect(avgTime).toBeLessThan(5); // Should be under 5ms per instantiation
            });
          });
        }

        // Custom tests
        if (customTests.length > 0) {
          describe('Custom Tests', () => {
            customTests.forEach(({ name: testName, test: testFn }) => {
              test(testName, () => testFn(plugin, PluginClass));
            });
          });
        }

        // Compatibility tests
        describe('Compatibility', () => {
          test('should handle compatibility checks', () => {
            const mockPlugin = {
              constructor: {
                metadata: {
                  name: 'mock',
                  category: 'test'
                }
              }
            };
            
            expect(() => plugin.isCompatibleWith(mockPlugin)).not.toThrow();
            expect(typeof plugin.isCompatibleWith(mockPlugin)).toBe('boolean');
          });
        });
      });
    };
  }

  /**
   * Create a minimal test for plugin validation
   * @param {class} PluginClass - The plugin class to test
   */
  static createQuickValidationTest(PluginClass) {
    return () => {
      test(`${PluginClass.metadata?.displayName || 'Plugin'} should be valid`, async () => {
        // Basic instantiation
        expect(() => new PluginClass()).not.toThrow();
        
        // Framework compliance
        const results = await pluginTestFramework.testPluginCompliance(PluginClass);
        expect(results.passed).toBe(true);
      });
    };
  }

  /**
   * Test plugin with multiple configurations
   * @param {class} PluginClass - The plugin class to test
   * @param {array} configurations - Array of config objects to test
   */
  static testWithConfigurations(PluginClass, configurations) {
    return () => {
      describe(`${PluginClass.metadata?.displayName || 'Plugin'} Configuration Tests`, () => {
        configurations.forEach((config, index) => {
          test(`should work with configuration ${index + 1}`, () => {
            expect(() => new PluginClass(config)).not.toThrow();
            
            const plugin = new PluginClass(config);
            
            // Basic method calls should work
            expect(() => plugin.getDependencies()).not.toThrow();
            expect(() => plugin.getFileStructure()).not.toThrow();
            expect(() => plugin.getConfigFiles()).not.toThrow();
          });
        });
      });
    };
  }

  /**
   * Bulk test multiple plugins with the same configuration
   * @param {array} pluginClasses - Array of plugin classes to test
   * @param {object} config - Configuration to test with
   */
  static bulkTestPlugins(pluginClasses, config = {}) {
    return () => {
      describe('Bulk Plugin Tests', () => {
        pluginClasses.forEach(PluginClass => {
          test(`${PluginClass.metadata?.displayName || 'Plugin'} should work with provided config`, () => {
            expect(() => new PluginClass(config)).not.toThrow();
            
            const plugin = new PluginClass(config);
            const deps = plugin.getDependencies();
            const structure = plugin.getFileStructure();
            const configFiles = plugin.getConfigFiles();
            
            expect(deps).toBeDefined();
            expect(structure).toBeDefined();
            expect(Array.isArray(configFiles)).toBe(true);
          });
        });
      });
    };
  }
}