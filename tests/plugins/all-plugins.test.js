import { describe, test, expect } from '@jest/globals';
import { PluginTestHelpers } from '../../src/test-utils/plugin-test-helpers.js';
import { NextJSPlugin } from '../../src/plugins/nextjs-plugin.js';
import { ExpressPlugin } from '../../src/plugins/express-plugin.js';
import { ReactPlugin } from '../../src/plugins/react-plugin.js';
import { RemixPlugin } from '../../src/plugins/remix-plugin.js';
import { T3StackPlugin } from '../../src/plugins/t3-plugin.js';
import { MERNStackPlugin } from '../../src/plugins/mern-plugin.js';
import { MEANStackPlugin } from '../../src/plugins/mean-plugin.js';
import { FastifyPlugin } from '../../src/plugins/fastify-plugin.js';
import { FastAPIPlugin } from '../../src/plugins/fastapi-plugin.js';
import { DjangoPlugin } from '../../src/plugins/django-plugin.js';
import { GinPlugin } from '../../src/plugins/gin-plugin.js';
import { RailsPlugin } from '../../src/plugins/rails-plugin.js';
import { VuePlugin } from '../../src/plugins/vue-plugin.js';
import { SveltePlugin } from '../../src/plugins/svelte-plugin.js';
import { AngularPlugin } from '../../src/plugins/angular-plugin.js';
import { VanillaPlugin } from '../../src/plugins/vanilla-plugin.js';

// All available plugins
const allPlugins = [
  NextJSPlugin,
  ExpressPlugin,
  ReactPlugin,
  RemixPlugin,
  T3StackPlugin,
  MERNStackPlugin,
  MEANStackPlugin,
  FastifyPlugin,
  FastAPIPlugin,
  DjangoPlugin,
  GinPlugin,
  RailsPlugin,
  VuePlugin,
  SveltePlugin,
  AngularPlugin,
  VanillaPlugin
];

// Group plugins by category
const pluginsByCategory = {
  frontend: [ReactPlugin, VuePlugin, AngularPlugin, VanillaPlugin],
  backend: [ExpressPlugin, FastifyPlugin, FastAPIPlugin, DjangoPlugin, GinPlugin, RailsPlugin],
  fullstack: [NextJSPlugin, RemixPlugin, T3StackPlugin, MERNStackPlugin, MEANStackPlugin, SveltePlugin]
};

// Bulk validation tests for all plugins
describe('All Plugins Validation', PluginTestHelpers.bulkTestPlugins(allPlugins));

// Quick validation tests for each plugin
describe('Plugin Quick Validation', () => {
  allPlugins.forEach(PluginClass => {
    describe(`${PluginClass.metadata?.displayName} Quick Validation`, 
      PluginTestHelpers.createQuickValidationTest(PluginClass)
    );
  });
});

// Category-specific tests
describe('Plugin Category Tests', () => {
  Object.entries(pluginsByCategory).forEach(([category, plugins]) => {
    describe(`${category.charAt(0).toUpperCase() + category.slice(1)} Plugins`, () => {
      test('should all have correct category metadata', () => {
        plugins.forEach(PluginClass => {
          const metadata = PluginClass.metadata;
          expect(metadata.projectTypes).toContain(category);
        });
      });

      test('should all provide required methods', () => {
        plugins.forEach(PluginClass => {
          const plugin = new PluginClass();
          
          expect(typeof plugin.getDependencies).toBe('function');
          expect(typeof plugin.getFileStructure).toBe('function');
          expect(typeof plugin.getConfigFiles).toBe('function');
          expect(typeof plugin.getCommands).toBe('function');
        });
      });

      if (category === 'frontend' || category === 'fullstack') {
        test('should support styling frameworks', () => {
          const stylingOptions = ['tailwind', 'css-modules', 'styled-components'];
          
          plugins.forEach(PluginClass => {
            stylingOptions.forEach(styling => {
              expect(() => new PluginClass({ styling })).not.toThrow();
            });
          });
        });
      }

      if (category === 'backend' || category === 'fullstack') {
        test('should support database integration', () => {
          const databaseOptions = ['postgresql', 'mysql', 'mongodb', 'sqlite'];
          
          plugins.forEach(PluginClass => {
            databaseOptions.forEach(database => {
              expect(() => new PluginClass({ database })).not.toThrow();
            });
          });
        });
      }
    });
  });
});

// Language support tests
describe('Language Support Tests', () => {
  const languageGroups = {
    'JavaScript/TypeScript': [NextJSPlugin, ReactPlugin, ExpressPlugin, FastifyPlugin, RemixPlugin, T3StackPlugin, MERNStackPlugin, MEANStackPlugin, VuePlugin, SveltePlugin, AngularPlugin, VanillaPlugin],
    'Python': [FastAPIPlugin, DjangoPlugin],
    'Go': [GinPlugin],
    'Ruby': [RailsPlugin]
  };

  Object.entries(languageGroups).forEach(([language, plugins]) => {
    describe(`${language} Plugins`, () => {
      test('should support their primary language', () => {
        plugins.forEach(PluginClass => {
          const metadata = PluginClass.metadata;
          const languages = language.split('/'); // Handle "JavaScript/TypeScript"
          
          // Plugin should support at least one of the expected languages
          const supportsLanguage = languages.some(lang => 
            metadata.languages.includes(lang)
          );
          expect(supportsLanguage).toBe(true);
        });
      });

      if (language === 'JavaScript/TypeScript') {
        test('should adapt to TypeScript configuration', () => {
          plugins.forEach(PluginClass => {
            const plugin = new PluginClass({ language: 'TypeScript' });
            const deps = plugin.getDependencies();
            
            const hasTypescriptDeps = deps.development.some(dep => 
              dep.includes('typescript') || dep.includes('@types/')
            );
            expect(hasTypescriptDeps).toBe(true);
          });
        });
      }
    });
  });
});

// Performance tests for all plugins
describe('All Plugins Performance', () => {
  test('should instantiate all plugins quickly', () => {
    const startTime = Date.now();
    
    allPlugins.forEach(PluginClass => {
      new PluginClass();
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(100); // All plugins in under 100ms
  });

  test('should handle method calls efficiently', () => {
    const startTime = Date.now();
    
    allPlugins.forEach(PluginClass => {
      const plugin = new PluginClass();
      plugin.getDependencies();
      plugin.getFileStructure();
      plugin.getConfigFiles();
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(200); // All method calls in under 200ms
  });
});

// Compatibility matrix tests
describe('Plugin Compatibility Matrix', () => {
  test('frontend frameworks compatibility', () => {
    const frontendFrameworks = [NextJSPlugin, ReactPlugin, VuePlugin, AngularPlugin];
    
    frontendFrameworks.forEach(Framework1 => {
      frontendFrameworks.forEach(Framework2 => {
        if (Framework1 !== Framework2) {
          const plugin1 = new Framework1();
          const plugin2 = new Framework2();
          
          // Most frameworks should be compatible unless there's explicit conflict logic
          // This is more about whether they can work together in a project
          const isCompatible = plugin1.isCompatibleWith(plugin2);
          expect(typeof isCompatible).toBe('boolean');
        }
      });
    });
  });

  test('backend frameworks should be compatible with frontend frameworks', () => {
    const backendFrameworks = [ExpressPlugin, FastifyPlugin, FastAPIPlugin];
    const frontendFrameworks = [ReactPlugin, VuePlugin];
    
    backendFrameworks.forEach(Backend => {
      frontendFrameworks.forEach(Frontend => {
        const backend = new Backend();
        const frontend = new Frontend();
        
        expect(backend.isCompatibleWith(frontend)).toBe(true);
      });
    });
  });

  test('fullstack frameworks compatibility with frontend frameworks', () => {
    const fullstackFrameworks = [NextJSPlugin, RemixPlugin, MERNStackPlugin, MEANStackPlugin];
    const frontendFrameworks = [ReactPlugin, VuePlugin, AngularPlugin];
    
    fullstackFrameworks.forEach(Fullstack => {
      frontendFrameworks.forEach(Frontend => {
        const fullstack = new Fullstack();
        const frontend = new Frontend();
        
        // Compatibility depends on the specific frameworks
        // For example, MERN includes React so should be compatible
        const isCompatible = fullstack.isCompatibleWith(frontend);
        expect(typeof isCompatible).toBe('boolean');
      });
    });
  });
});

// Configuration stress tests
describe('Configuration Stress Tests', () => {
  const complexConfigurations = [
    {
      projectType: 'fullstack',
      language: 'TypeScript',
      styling: 'tailwind',
      database: 'postgresql',
      testing: 'jest',
      deployment: 'vercel'
    },
    {
      projectType: 'backend',
      language: 'Python',
      database: 'mongodb',
      testing: 'pytest',
      deployment: 'docker'
    },
    {
      projectType: 'frontend',
      language: 'JavaScript',
      styling: 'css-modules',
      testing: 'vitest',
      deployment: 'netlify'
    }
  ];

  complexConfigurations.forEach((config, index) => {
    test(`should handle complex configuration ${index + 1}`, () => {
      allPlugins.forEach(PluginClass => {
        const metadata = PluginClass.metadata;
        
        // Only test plugins that support this project type
        if (metadata.projectTypes?.includes(config.projectType) &&
            metadata.languages?.includes(config.language)) {
          
          expect(() => new PluginClass(config)).not.toThrow();
          
          const plugin = new PluginClass(config);
          expect(() => plugin.getDependencies()).not.toThrow();
          expect(() => plugin.getConfigFiles()).not.toThrow();
        }
      });
    });
  });
});

// Framework integration tests
describe('Framework Integration Tests', () => {
  test('should generate valid package.json for JavaScript/TypeScript plugins', () => {
    const jsPlugins = allPlugins.filter(P => 
      P.metadata.languages?.includes('JavaScript') || 
      P.metadata.languages?.includes('TypeScript')
    );

    jsPlugins.forEach(PluginClass => {
      const plugin = new PluginClass({ language: 'TypeScript' });
      const configFiles = plugin.getConfigFiles();
      const packageJson = configFiles.find(f => f.name === 'package.json');
      
      if (packageJson) {
        expect(() => JSON.parse(packageJson.content)).not.toThrow();
        
        const parsed = JSON.parse(packageJson.content);
        expect(parsed.scripts).toBeDefined();
        expect(typeof parsed.scripts).toBe('object');
      }
    });
  });

  test('should generate valid requirements.txt for Python plugins', () => {
    const pythonPlugins = allPlugins.filter(P => 
      P.metadata.languages?.includes('Python')
    );

    pythonPlugins.forEach(PluginClass => {
      const plugin = new PluginClass();
      const configFiles = plugin.getConfigFiles();
      const requirements = configFiles.find(f => f.name === 'requirements.txt');
      
      if (requirements) {
        expect(requirements.content.length).toBeGreaterThan(0);
        expect(requirements.content).toContain('\n');
      }
    });
  });
});