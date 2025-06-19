# 🔧 Claude Kickstart Plugin System

## Overview

Claude Kickstart 2.0 introduces a powerful plugin system that makes it easy to add new technology stacks, frameworks, and configurations without modifying the core codebase. This document explains how to use and extend the plugin system.

## ✨ Key Benefits

- **🚀 Extensible**: Add new stacks without touching core code
- **🧩 Modular**: Each plugin encapsulates its own logic and dependencies
- **🔍 Discoverable**: Automatic plugin discovery and validation
- **🧪 Testable**: Built-in testing framework for plugin validation
- **⚡ Performance**: Template caching and lazy loading
- **🔒 Type-Safe**: Configuration schema with validation

## 📁 Architecture

```
src/
├── plugins/
│   ├── base-plugin.js      # Base class all plugins extend
│   ├── registry.js         # Plugin discovery and management
│   ├── nextjs-plugin.js    # Example: Next.js plugin
│   ├── express-plugin.js   # Example: Express plugin
│   └── index.js           # Plugin registration
├── templates/
│   ├── template-engine.js  # Handlebars-like template engine
│   └── base.md            # Main markdown template
├── config/
│   └── schema.js          # Configuration validation
├── test-utils/
│   └── plugin-test-framework.js  # Plugin testing utilities
├── generator-v2.js        # New modular generator
├── questions-v2.js        # Dynamic question system
└── index-v2.js           # Main entry point
```

## 🔌 Creating a Plugin

### 1. Basic Plugin Structure

Every plugin extends the `BasePlugin` class and implements required methods:

```javascript
import { BasePlugin } from './base-plugin.js';

export class MyStackPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'my-stack',
      displayName: 'My Awesome Stack',
      category: 'stack',
      projectTypes: ['fullstack', 'frontend'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '🚀',
      description: 'An awesome new framework'
    };
  }

  getDependencies() {
    return {
      production: ['my-framework', 'other-deps'],
      development: []
    };
  }

  getDevDependencies() {
    const deps = ['my-dev-tools'];
    
    if (this.config.language === 'TypeScript') {
      deps.push('typescript', '@types/my-framework');
    }
    
    return deps;
  }

  getFileStructure() {
    return `src/
├── components/
├── pages/
├── utils/
└── app.${this.getLanguageExtension()}`;
  }

  getConfigFiles() {
    return [
      {
        name: 'my-stack.config.js',
        language: 'javascript',
        content: `export default {
  // Configuration for my stack
  feature: true
};`
      }
    ];
  }

  getLanguageExtension() {
    return this.config.language === 'TypeScript' ? 'ts' : 'js';
  }
}
```

### 2. Required Metadata

Every plugin must provide metadata:

```javascript
static get metadata() {
  return {
    name: 'unique-plugin-id',           // Required: Unique identifier
    displayName: 'Human Readable Name', // Required: Display name
    category: 'stack',                   // Required: Plugin category
    projectTypes: ['fullstack'],        // Optional: Compatible project types
    languages: ['TypeScript'],          // Optional: Supported languages
    icon: '🚀',                         // Optional: Display icon
    description: 'Plugin description'   // Optional: Description
  };
}
```

#### Valid Categories

- `stack` - Technology stacks (Next.js, Express, React, etc.)
- `database` - Database systems (PostgreSQL, MongoDB, etc.)
- `testing` - Testing frameworks (Jest, Vitest, etc.)
- `styling` - CSS frameworks (Tailwind, Styled Components, etc.)
- `deployment` - Deployment platforms (Vercel, AWS, etc.)
- `misc` - Other tools and utilities

### 3. Core Methods

#### `getDependencies()`

Returns production and development dependencies:

```javascript
getDependencies() {
  const deps = ['base-framework'];
  
  // Add conditional dependencies
  if (this.config.database === 'postgresql') {
    deps.push('pg');
  }
  
  return {
    production: deps,
    development: []
  };
}
```

#### `getFileStructure()`

Returns a string representing the project structure:

```javascript
getFileStructure() {
  const ext = this.getLanguageExtension();
  return `src/
├── components/
│   └── Button.${ext}
├── pages/
│   └── Home.${ext}
└── app.${ext}`;
}
```

#### `getConfigFiles()`

Returns configuration files to generate:

```javascript
getConfigFiles() {
  return [
    {
      name: 'package.json',
      language: 'json',
      content: JSON.stringify({
        name: 'my-project',
        version: '1.0.0'
      }, null, 2)
    }
  ];
}
```

### 4. Advanced Features

#### Custom Questions

Add plugin-specific questions:

```javascript
getQuestions() {
  return [
    {
      type: 'confirm',
      name: 'useAdvancedFeatures',
      message: 'Enable advanced features?',
      default: false
    }
  ];
}
```

#### Custom Markdown Sections

Add custom documentation sections:

```javascript
getMarkdownSections() {
  return [
    {
      title: '🔧 My Stack Configuration',
      content: `Special setup instructions for My Stack:

- Install the CLI: \`npm install -g my-stack-cli\`
- Initialize project: \`my-stack init\`
- Start development: \`my-stack dev\`
`
    }
  ];
}
```

#### Template Variables

Provide variables for template rendering:

```javascript
getTemplateVariables() {
  return {
    hasMyFeature: true,
    myCustomValue: 'hello-world'
  };
}
```

#### Security Guidelines

Add security recommendations:

```javascript
getSecurityGuidelines() {
  return [
    'Always validate user input',
    'Use environment variables for secrets',
    'Enable CSRF protection'
  ];
}
```

### 5. Plugin Registration

Register your plugin in `src/plugins/index.js`:

```javascript
import { MyStackPlugin } from './my-stack-plugin.js';

export function registerBuiltInPlugins() {
  registry.register(NextJSPlugin);
  registry.register(ExpressPlugin);
  registry.register(MyStackPlugin); // Add your plugin
}
```

## 🧪 Testing Plugins

Claude Kickstart v2.0 includes a comprehensive testing framework to ensure plugin quality and compatibility.

### Built-in Test Suites

#### 1. Plugin System Tests
Run the core plugin system tests:

```bash
# Run all plugin tests
npm test tests/plugin-system.test.js

# Run built-in plugin validation
npm test tests/built-in-plugins.test.js
```

#### 2. Individual Plugin Tests
Each plugin can have dedicated test files:

```bash
# Test specific plugin
npm test tests/plugins/nextjs-plugin.test.js
npm test tests/plugins/fastapi-plugin.test.js
```

#### 3. Plugin Test Helpers
Use the comprehensive test helpers from `src/test-utils/plugin-test-helpers.js`:

```javascript
import { PluginTestHelpers } from '../src/test-utils/plugin-test-helpers.js';
import { MyStackPlugin } from '../src/plugins/my-stack-plugin.js';

describe('MyStackPlugin', () => {
  // Create comprehensive test suite
  PluginTestHelpers.createPluginTestSuite(MyStackPlugin, {
    testConfigurations: [
      { language: 'TypeScript', database: 'postgresql' },
      { language: 'JavaScript', styling: 'tailwind' }
    ],
    performance: {
      maxGenerationTime: 1000,
      maxMemoryUsage: 50 * 1024 * 1024 // 50MB
    }
  });

  // Additional custom tests
  test('should handle custom configuration', () => {
    const plugin = new MyStackPlugin({ customFeature: true });
    expect(plugin.getTemplateVariables().hasCustomFeature).toBe(true);
  });
});
```

#### 4. Available Test Utilities

The `PluginTestHelpers` class provides these test methods:

```javascript
// Test plugin metadata compliance
static testPluginCompliance(PluginClass)

// Test plugin with multiple configurations  
static testPluginConfigurations(PluginClass, configs)

// Test plugin integration with generator
static testPluginIntegration(PluginClass, config)

// Test plugin performance
static testPluginPerformance(PluginClass, options)

// Test plugin compatibility with others
static testPluginCompatibility(plugins)

// Generate comprehensive test report
static generateTestReport(results)
```

### Validation Scripts

#### Quick Validation
Test key plugins quickly:

```bash
node quick-validation.js
```

This tests 5 key plugins with essential validation criteria:
- Document structure and completeness
- Dependencies and install commands
- Configuration files
- Required sections

#### Comprehensive Validation  
Test all 17 plugins with multiple configurations:

```bash
node validate-plugin-outputs.js
```

This performs:
- **Generation Testing**: Ensures plugins create valid markdown
- **Structure Validation**: Verifies project structure generation
- **Dependency Validation**: Checks install commands and package lists
- **Configuration Validation**: Tests config file generation
- **Completeness Testing**: Validates all required sections

#### Custom Validation
Create targeted validation for specific use cases:

```javascript
import { PluginOutputValidator } from './validate-plugin-outputs.js';

const validator = new PluginOutputValidator();

// Test specific plugin configurations
const results = await validator.validatePlugin('nextjs-app', {
  language: 'TypeScript',
  styling: 'tailwind',
  database: 'postgresql'
});

console.log(results.tests); // Detailed test results
```

### Writing Plugin Tests

#### 1. Basic Plugin Test Structure

```javascript
// tests/plugins/my-stack-plugin.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { PluginTestHelpers } from '../../src/test-utils/plugin-test-helpers.js';
import { MyStackPlugin } from '../../src/plugins/my-stack-plugin.js';

describe('MyStackPlugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new MyStackPlugin({
      language: 'TypeScript',
      projectType: 'fullstack'
    });
  });

  // Use built-in comprehensive tests
  PluginTestHelpers.createPluginTestSuite(MyStackPlugin);

  // Custom functionality tests
  describe('Dependencies', () => {
    test('should include framework dependencies', () => {
      const deps = plugin.getDependencies();
      expect(deps.production).toContain('my-framework');
      expect(deps.development).toEqual(plugin.getDevDependencies());
    });

    test('should adapt to TypeScript', () => {
      expect(plugin.getDevDependencies()).toContain('typescript');
    });
  });

  describe('File Structure', () => {
    test('should generate appropriate structure', () => {
      const structure = plugin.getFileStructure();
      expect(structure).toMatch(/src\/.*\.ts/);
      expect(structure).toContain('components');
    });
  });

  describe('Configuration', () => {
    test('should generate valid config files', () => {
      const configs = plugin.getConfigFiles();
      expect(configs).toBeInstanceOf(Array);
      expect(configs.length).toBeGreaterThan(0);
      
      configs.forEach(config => {
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('content');
      });
    });
  });
});
```

#### 2. Integration Tests

Test plugin integration with the generator:

```javascript
describe('MyStackPlugin Integration', () => {
  test('should work with generator', async () => {
    const { generator } = await import('../../src/generator.js');
    
    const config = {
      stack: 'my-stack',
      language: 'TypeScript',
      projectType: 'fullstack'
    };

    const markdown = await generator.generateMarkdown(config);
    
    // Validate generated content
    expect(markdown).toContain('# 🚀 Claude Code Project Setup');
    expect(markdown).toContain('my-framework');
    expect(markdown).toContain('TypeScript');
  });
});
```

#### 3. Performance Tests

Ensure plugins meet performance requirements:

```javascript
describe('MyStackPlugin Performance', () => {
  test('should generate quickly', () => {
    const start = Date.now();
    
    const plugin = new MyStackPlugin({ language: 'TypeScript' });
    plugin.getDependencies();
    plugin.getFileStructure();
    plugin.getConfigFiles();
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in <100ms
  });

  test('should not leak memory', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Create many plugin instances
    for (let i = 0; i < 1000; i++) {
      new MyStackPlugin({ language: 'TypeScript' });
    }
    
    // Force garbage collection if available
    if (global.gc) global.gc();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // <10MB increase
  });
});
```

#### 4. Compatibility Tests

Test plugin compatibility with other plugins:

```javascript
describe('MyStackPlugin Compatibility', () => {
  test('should be compatible with database plugins', () => {
    const plugin = new MyStackPlugin({
      language: 'TypeScript',
      database: 'postgresql'
    });

    const deps = plugin.getDependencies();
    expect(deps.production).toContain('pg'); // Should include database driver
  });

  test('should work with styling frameworks', () => {
    const plugin = new MyStackPlugin({
      language: 'TypeScript',
      styling: 'tailwind'
    });

    const devDeps = plugin.getDevDependencies();
    expect(devDeps).toContain('tailwindcss');
  });
});
```

### Test Configuration Options

#### Test Suite Options

```javascript
PluginTestHelpers.createPluginTestSuite(MyStackPlugin, {
  // Test with multiple configurations
  testConfigurations: [
    { language: 'TypeScript', database: 'postgresql' },
    { language: 'JavaScript', styling: 'tailwind' },
    { language: 'TypeScript', testing: 'jest' }
  ],

  // Performance thresholds
  performance: {
    maxGenerationTime: 1000,      // 1 second max
    maxMemoryUsage: 50 * 1024 * 1024,  // 50MB max
    maxDependencies: 50           // Max 50 dependencies
  },

  // Compatibility tests
  compatibility: {
    testWithOtherPlugins: ['react', 'express'],
    validateConflicts: true
  },

  // Custom validation
  customValidations: [
    (plugin) => {
      // Custom validation logic
      return plugin.getFileStructure().includes('src/');
    }
  ]
});
```

### Running All Tests

#### Complete Test Suite
```bash
# Run all tests
npm test

# Run only plugin tests
npm test tests/plugins/

# Run specific test patterns
npm test -- --testNamePattern="Plugin"

# Run tests in watch mode
npm test -- --watch
```

#### Validation Scripts
```bash
# Quick validation (5 key plugins)
npm run validate:quick

# Full validation (all 17 plugins)
npm run validate:comprehensive

# Validate specific plugin
npm run validate:plugin -- nextjs-app
```

### Test Reports

#### Generate Test Report
```javascript
import { PluginTestHelpers } from './src/test-utils/plugin-test-helpers.js';

const results = await PluginTestHelpers.testAllPlugins();
const report = PluginTestHelpers.generateTestReport(results);

console.log(report); // Detailed HTML/markdown report
```

#### Continuous Integration
Set up CI testing:

```yaml
# .github/workflows/plugin-tests.yml
name: Plugin Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run validate:comprehensive
```

## 🔄 Template Engine

The plugin system includes a powerful template engine with Handlebars-like syntax:

### Basic Variables

```markdown
Project: {{projectName}}
Language: {{language}}
```

### Conditionals

```markdown
{{#if hasDatabase}}
## Database Configuration
Database: {{databaseName}}
{{/if}}

{{#unless isSimpleProject}}
## Advanced Configuration
...
{{/unless}}
```

### Loops

```markdown
## Dependencies
{{#each dependencies}}
- {{this}}
{{/each}}
```

### Helpers

```markdown
## Features
{{#join features ', '}}{{/join}}

Project Name: {{uppercase projectName}}
```

### Partials

Register reusable template parts:

```javascript
templateEngine.registerPartial('header', `
# {{title}}
Generated on {{date}}
`);

// Use in templates
{{> header}}
```

## 📝 Configuration Schema

### Validation

The system includes comprehensive configuration validation:

```javascript
import { validator } from './config/schema.js';

const config = {
  projectType: 'fullstack',
  stack: 'my-stack',
  language: 'TypeScript'
};

const validation = validator.validate(config);

if (!validation.isValid) {
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
}
```

### Custom Validation

Add plugin-specific validation:

```javascript
export class MyStackPlugin extends BasePlugin {
  validateConfig() {
    super.validateConfig();
    
    // Custom validation logic
    if (this.config.myFeature && !this.config.language) {
      throw new Error('MyFeature requires language to be specified');
    }
  }
}
```

## 🎯 Best Practices

### 1. Plugin Design

- **Single Responsibility**: Each plugin should handle one technology/framework
- **Configuration Driven**: Use config to adapt behavior rather than multiple plugins
- **Defensive Programming**: Handle edge cases and invalid configurations gracefully
- **Performance**: Avoid expensive operations in constructors

### 2. File Structure

- Keep file structures realistic and practical
- Use appropriate file extensions based on language
- Include essential directories and files
- Consider different project sizes (starter vs. complex)

### 3. Dependencies

- Only include necessary dependencies
- Separate production and development dependencies
- Use conditional logic for optional dependencies
- Keep dependency lists up to date

### 4. Documentation

- Provide clear, actionable documentation
- Include code examples in markdown sections
- Explain setup steps and gotchas
- Link to official documentation

### 5. Testing

- Test with different configurations
- Verify compatibility with other plugins
- Test performance with realistic configs
- Include integration tests

## 🚀 Advanced Usage

### Dynamic Plugin Loading

Load external plugins at runtime:

```javascript
import { registry } from './plugins/registry.js';

// Load plugin from file
const pluginId = await registry.loadExternalPlugin('./my-external-plugin.js');

// Use the plugin
const plugin = registry.createInstance(pluginId, config);
```

### Plugin Compatibility

Check plugin compatibility:

```javascript
const conflicts = registry.validatePluginCompatibility(['nextjs-app', 'react']);

if (conflicts.length > 0) {
  console.log('Plugin conflicts:', conflicts);
}
```

### Plugin Discovery

Find plugins by criteria:

```javascript
// Find all TypeScript-compatible plugins
const tsPlugins = registry.findPluginsByLanguage('TypeScript');

// Find all frontend plugins
const frontendPlugins = registry.findPluginsByProjectType('frontend');

// Find plugins by feature
const testingPlugins = registry.findPluginsByFeature('testing');
```

### Custom Categories

Create custom plugin categories:

```javascript
export class MyToolPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'my-tool',
      displayName: 'My Development Tool',
      category: 'development-tools', // Custom category
      // ...
    };
  }
}
```

## 🚀 Plugin Development Workflow

### 1. Planning Your Plugin

Before coding, plan your plugin:

```markdown
## Plugin Specification: My Stack

**Purpose**: Support for My Awesome Framework
**Target Users**: Developers using My Framework
**Project Types**: fullstack, frontend
**Languages**: TypeScript, JavaScript

**Key Features**:
- Hot reloading development server
- Built-in testing framework
- Optimized production builds
- TypeScript support

**Dependencies**:
- Production: my-framework, my-runtime
- Development: my-dev-tools, my-types

**Configuration Files**:
- my-stack.config.js
- .my-stack-rc
```

### 2. Development Process

#### Step 1: Create Plugin File
```bash
# Create your plugin file
touch src/plugins/my-stack-plugin.js
```

#### Step 2: Implement Base Structure
```javascript
import { BasePlugin } from './base-plugin.js';

export class MyStackPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'my-stack',
      displayName: 'My Awesome Stack',
      category: 'stack',
      projectTypes: ['fullstack'],
      languages: ['TypeScript', 'JavaScript'],
      icon: '🚀',
      description: 'Modern web development with My Framework'
    };
  }

  // Implement required methods...
}
```

#### Step 3: Register Plugin
```javascript
// src/plugins/index.js
import { MyStackPlugin } from './my-stack-plugin.js';

export function registerBuiltInPlugins() {
  // ... existing plugins
  registry.register(MyStackPlugin);
}
```

#### Step 4: Create Tests
```javascript
// tests/plugins/my-stack-plugin.test.js
import { PluginTestHelpers } from '../../src/test-utils/plugin-test-helpers.js';
import { MyStackPlugin } from '../../src/plugins/my-stack-plugin.js';

describe('MyStackPlugin', () => {
  PluginTestHelpers.createPluginTestSuite(MyStackPlugin);
  // Add custom tests...
});
```

#### Step 5: Test Development
```bash
# Run your plugin tests
npm run test:plugin-specific -- my-stack-plugin

# Validate plugin compliance
npm run validate:comprehensive

# Test in isolation
npm run validate:plugin -- my-stack
```

### 3. Testing Checklist

Before submitting your plugin, ensure:

- [ ] All metadata fields are complete
- [ ] Plugin passes compliance tests
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Documentation is complete
- [ ] Examples work correctly
- [ ] Multiple configurations tested
- [ ] Memory usage is reasonable
- [ ] Dependencies are minimal and correct
- [ ] File structure is realistic

### 4. Quality Standards

#### Code Quality
- Follow existing code patterns
- Use meaningful variable names
- Add JSDoc comments
- Handle edge cases gracefully

#### Performance Standards
- Plugin creation: < 100ms
- Dependency generation: < 50ms
- File structure generation: < 20ms
- Memory usage: < 10MB per instance

#### Compatibility
- Works with all supported languages
- Integrates with common databases
- Compatible with popular styling frameworks
- Supports various testing frameworks

### 5. Publishing Workflow

#### Internal Plugin (Built-in)
1. Create plugin in `src/plugins/`
2. Add comprehensive tests
3. Update documentation
4. Submit PR for review

#### External Plugin
1. Create standalone npm package
2. Follow plugin interface
3. Include comprehensive tests
4. Publish to npm
5. Submit to plugin registry

## 🐛 Troubleshooting

### Common Issues

1. **Plugin Not Found**
   - Ensure plugin is registered in `index.js`
   - Check plugin name matches metadata.name
   - Verify no naming conflicts

2. **Configuration Errors**
   - Validate config with schema
   - Check required fields are present
   - Ensure enum values are valid

3. **Template Rendering Issues**
   - Verify template syntax
   - Check variable names match data
   - Ensure conditional logic is correct

4. **Performance Problems**
   - Profile plugin methods
   - Cache expensive operations
   - Avoid large file structures

5. **Test Failures**
   - Check all required methods are implemented
   - Verify return types match expectations
   - Ensure dependencies are valid
   - Test with multiple configurations

### Debug Mode

Enable debug mode for detailed logging:

```javascript
process.env.PLUGIN_DEBUG = 'true';

// Now plugins will log detailed information
```

### Testing Individual Plugins

```bash
# Test specific plugin
npm run test:plugin-specific -- --testNamePattern="MyStackPlugin"

# Test plugin compliance
npm run validate:comprehensive

# List all plugins
npm run plugins:list

# Quick validation
npm run validate:quick

# Core system validation
npm run validate:core
```

### Plugin Development Tips

1. **Start Simple**: Begin with minimal implementation, then add features
2. **Test Early**: Write tests as you develop features
3. **Follow Patterns**: Study existing plugins for best practices
4. **Document Everything**: Clear documentation helps adoption
5. **Performance First**: Profile early and optimize bottlenecks
6. **Think Compatibility**: Consider how your plugin works with others

## 🔮 Future Enhancements

### Planned Features

- **Plugin Marketplace**: Community-contributed plugins
- **Visual Plugin Builder**: GUI for creating plugins
- **Plugin Dependencies**: Plugins that depend on other plugins
- **Hot Reloading**: Development mode with plugin hot reloading
- **Plugin Versioning**: Support for plugin versions and compatibility
- **External Plugin Registry**: Fetch plugins from npm/GitHub

### Contributing

To contribute a new plugin:

1. Create plugin following the guidelines above
2. Add comprehensive tests
3. Update documentation
4. Submit PR with example usage

## 📚 API Reference

### BasePlugin

The base class all plugins must extend.

#### Properties

- `config: object` - Plugin configuration
- `static metadata: object` - Plugin metadata (must be implemented)
- `static version: string` - Plugin version (default: '1.0.0')
- `static requirements: object` - System requirements

#### Methods

- `getDependencies(): {production: string[], development: string[]}` - Get package dependencies
- `getDevDependencies(): string[]` - Get development dependencies
- `getFileStructure(): string` - Get project file structure
- `getConfigFiles(): object[]` - Get configuration files to generate
- `getMarkdownSections(): object[]` - Get custom documentation sections
- `getQuestions(): object[]` - Get plugin-specific questions
- `getCommands(): object` - Get project commands (dev, build, etc.)
- `getSupportedFeatures(): string[]` - Get list of supported features
- `getSecurityGuidelines(): string[]` - Get security recommendations
- `getTemplateVariables(): object` - Get variables for template rendering
- `isCompatibleWith(plugin): boolean` - Check compatibility with another plugin

### PluginRegistry

Manages plugin registration and discovery.

#### Methods

- `register(PluginClass)` - Register a plugin class
- `get(pluginId): PluginClass` - Get plugin class by ID
- `createInstance(pluginId, config): Plugin` - Create plugin instance
- `getAllPlugins(): object[]` - Get all registered plugins
- `getByCategory(category): object[]` - Get plugins by category
- `findPluginsByLanguage(language): object[]` - Find plugins supporting language
- `findPluginsByProjectType(type): object[]` - Find plugins supporting project type
- `validatePluginCompatibility(pluginIds): object[]` - Check plugin conflicts

### TemplateEngine

Renders templates with dynamic data.

#### Methods

- `render(template, context): string` - Render template string
- `renderFile(path, context): string` - Render template file
- `registerHelper(name, fn)` - Register template helper
- `registerPartial(name, template)` - Register template partial

---

*Generated with ❤️ by Claude Kickstart Plugin System*