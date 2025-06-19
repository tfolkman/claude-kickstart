# Plugin Testing Framework

This directory contains tests for individual plugins and a comprehensive testing framework for plugin development.

## Overview

The plugin testing framework provides several testing utilities:

1. **PluginTestHelpers** - Comprehensive test suite generators
2. **pluginTestFramework** - Core compliance and integration testing
3. **Individual Plugin Tests** - Specific tests for each plugin
4. **Bulk Testing** - Test multiple plugins with the same configuration

## Usage

### Creating Tests for a New Plugin

```javascript
import { PluginTestHelpers } from '../../src/test-utils/plugin-test-helpers.js';
import { MyPlugin } from '../../src/plugins/my-plugin.js';

describe('MyPlugin Tests', PluginTestHelpers.createPluginTestSuite(MyPlugin, {
  name: 'my-plugin',
  displayName: 'My Plugin',
  requiredDependencies: ['some-package'],
  requiredDevDependencies: ['some-dev-package'],
  requiredConfigFiles: ['config.json'],
  customTests: [
    {
      name: 'should do something specific',
      test: (plugin) => {
        // Your custom test logic
        expect(plugin.someMethod()).toBe('expected');
      }
    }
  ]
}));
```

### Quick Validation Test

For simple validation without extensive testing:

```javascript
describe('MyPlugin Quick Validation', 
  PluginTestHelpers.createQuickValidationTest(MyPlugin)
);
```

### Configuration Testing

Test a plugin with multiple configurations:

```javascript
describe('MyPlugin Configuration Tests', PluginTestHelpers.testWithConfigurations(MyPlugin, [
  { language: 'TypeScript', styling: 'tailwind' },
  { language: 'JavaScript', styling: 'css-modules' },
  // ... more configurations
]));
```

### Bulk Testing

Test multiple plugins with the same configuration:

```javascript
describe('Frontend Plugins', PluginTestHelpers.bulkTestPlugins([
  ReactPlugin,
  VuePlugin,
  AngularPlugin
], { language: 'TypeScript' }));
```

## Test Categories

### 1. Core Plugin System Tests (`../plugin-system.test.js`)
- BasePlugin abstract class functionality
- PluginRegistry registration and retrieval
- Plugin compatibility checking
- Error handling

### 2. Built-in Plugin Tests (`../built-in-plugins.test.js`)
- Basic functionality tests for all built-in plugins
- Dependency verification
- File structure validation
- Configuration adaptation

### 3. Individual Plugin Tests (`./[plugin-name].test.js`)
- Comprehensive tests for specific plugins
- Plugin-specific functionality
- Integration with frameworks and tools
- Custom configuration handling

### 4. Bulk Plugin Tests (`./all-plugins.test.js`)
- Cross-plugin compatibility testing
- Performance benchmarks
- Category-specific validation
- Configuration stress testing

## Test Configuration Options

When using `createPluginTestSuite`, you can configure:

- `name`: Plugin identifier name
- `displayName`: Human-readable plugin name
- `requiredDependencies`: Array of production dependencies that must be present
- `requiredDevDependencies`: Array of development dependencies that must be present
- `requiredConfigFiles`: Array of config file names/patterns that must be generated
- `customTests`: Array of custom test objects with `name` and `test` properties
- `skipIntegrationTests`: Skip framework compliance tests (default: false)
- `skipPerformanceTests`: Skip performance tests (default: false)

## Custom Test Structure

Custom tests receive the plugin instance and plugin class:

```javascript
{
  name: 'test description',
  test: (pluginInstance, PluginClass) => {
    // Test logic here
    expect(pluginInstance.someMethod()).toBeDefined();
    expect(PluginClass.metadata.name).toBe('expected-name');
  }
}
```

## Performance Considerations

The framework includes performance tests to ensure plugins:
- Instantiate quickly (< 5ms per instance)
- Execute methods efficiently
- Handle complex configurations without degradation

## Framework Compliance

All plugins are tested for:
- Proper BasePlugin inheritance
- Required method implementations
- Correct return types
- Valid metadata structure
- Configuration handling
- Compatibility declarations

## Adding New Tests

1. Create a new test file in `tests/plugins/`
2. Import the plugin and test helpers
3. Use the appropriate helper method
4. Add custom tests for plugin-specific functionality
5. Run tests with `npm test`

## Best Practices

1. **Use descriptive test names** that explain what functionality is being tested
2. **Test edge cases** like empty configurations, missing dependencies, etc.
3. **Include performance tests** for plugins with complex logic
4. **Test compatibility** with other plugins in the ecosystem
5. **Validate generated files** for correct syntax and content
6. **Test configuration adaptation** for different setups (TypeScript, databases, etc.)

## Running Tests

```bash
# Run all tests
npm test

# Run only plugin tests
npm test -- tests/plugins/

# Run specific plugin test
npm test -- tests/plugins/nextjs-plugin.test.js

# Run with verbose output
npm test -- --verbose
```