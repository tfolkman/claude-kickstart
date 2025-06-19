import { describe, test, expect } from '@jest/globals';
import { NextJSPlugin } from '../../src/plugins/nextjs-plugin.js';
import { PluginTestHelpers } from '../../src/test-utils/plugin-test-helpers.js';

describe('NextJS Plugin Tests', PluginTestHelpers.createPluginTestSuite(NextJSPlugin, {
  name: 'nextjs-app',
  displayName: 'Next.js 14 (App Router)',
  requiredDependencies: ['next', 'react', 'react-dom'],
  requiredDevDependencies: ['eslint', 'eslint-config-next'],
  requiredConfigFiles: ['next.config.js'],
  customTests: [
    {
      name: 'should support App Router by default',
      test: (plugin) => {
        const structure = plugin.getFileStructure();
        expect(structure).toContain('app/');
        expect(structure).toContain('layout.');
        expect(structure).toContain('page.');
      }
    },
    {
      name: 'should configure TypeScript correctly',
      test: () => {
        const plugin = new NextJSPlugin({ language: 'TypeScript' });
        const configFiles = plugin.getConfigFiles();
        const tsConfig = configFiles.find(f => f.name === 'tsconfig.json');
        
        expect(tsConfig).toBeDefined();
        expect(tsConfig.content).toContain('"jsx": "preserve"');
        expect(tsConfig.content).toContain('"incremental": true');
      }
    },
    {
      name: 'should integrate with Tailwind CSS',
      test: () => {
        const plugin = new NextJSPlugin({ styling: 'tailwind' });
        const deps = plugin.getDependencies();
        const configFiles = plugin.getConfigFiles();
        
        expect(deps.development).toContain('tailwindcss');
        expect(deps.development).toContain('postcss');
        expect(deps.development).toContain('autoprefixer');
        
        const tailwindConfig = configFiles.find(f => f.name.includes('tailwind.config'));
        expect(tailwindConfig).toBeDefined();
      }
    },
    {
      name: 'should be incompatible with other React frameworks',
      test: (plugin) => {
        const mockReactPlugin = {
          constructor: {
            metadata: { name: 'react', category: 'stack' }
          }
        };
        
        expect(plugin.isCompatibleWith(mockReactPlugin)).toBe(false);
      }
    },
    {
      name: 'should provide proper development commands',
      test: (plugin) => {
        const commands = plugin.getCommands();
        
        expect(commands.dev).toBe('npm run dev');
        expect(commands.build).toBe('npm run build');
        expect(commands.start).toBe('npm run start');
        expect(commands.lint).toBe('npm run lint');
      }
    },
    {
      name: 'should include security guidelines',
      test: (plugin) => {
        const guidelines = plugin.getSecurityGuidelines();
        
        expect(guidelines.length).toBeGreaterThan(0);
        expect(guidelines.some(g => g.includes('environment variables'))).toBe(true);
      }
    }
  ]
}));

// Additional configuration-specific tests
describe('NextJS Plugin Configuration Tests', PluginTestHelpers.testWithConfigurations(NextJSPlugin, [
  { language: 'TypeScript', styling: 'tailwind', database: 'postgresql' },
  { language: 'JavaScript', styling: 'css-modules', database: 'mysql' },
  { language: 'TypeScript', styling: 'styled-components', database: 'mongodb' },
  { language: 'JavaScript', styling: 'vanilla-css', database: 'none' }
]));

// Performance-specific tests for NextJS
describe('NextJS Plugin Performance', () => {
  test('should generate large file structures efficiently', () => {
    const plugin = new NextJSPlugin();
    
    const startTime = Date.now();
    const structure = plugin.getFileStructure();
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(10);
    expect(structure.length).toBeGreaterThan(100);
  });

  test('should handle complex configurations without performance degradation', () => {
    const complexConfig = {
      language: 'TypeScript',
      styling: 'tailwind',
      database: 'postgresql',
      testing: 'jest',
      deployment: 'vercel'
    };
    
    const startTime = Date.now();
    
    for (let i = 0; i < 50; i++) {
      const plugin = new NextJSPlugin(complexConfig);
      plugin.getDependencies();
      plugin.getConfigFiles();
      plugin.getFileStructure();
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 50;
    
    expect(avgTime).toBeLessThan(5);
  });
});