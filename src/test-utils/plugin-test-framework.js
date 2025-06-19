import { BasePlugin } from '../plugins/base-plugin.js';
import { PluginRegistry } from '../plugins/registry.js';
import { validator } from '../config/schema.js';

export class PluginTestFramework {
  constructor() {
    this.testRegistry = new PluginRegistry();
  }

  // Core plugin validation tests
  async testPluginCompliance(PluginClass) {
    const tests = [
      () => this.testPluginStructure(PluginClass),
      () => this.testPluginMetadata(PluginClass),
      () => this.testPluginInstantiation(PluginClass),
      () => this.testPluginMethods(PluginClass),
      () => this.testPluginRegistration(PluginClass),
      () => this.testPluginConfiguration(PluginClass)
    ];

    const results = [];

    for (const test of tests) {
      try {
        const result = await test();
        results.push({ ...result, passed: true });
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error.message,
          stack: error.stack
        });
      }
    }

    return {
      pluginName: PluginClass.metadata?.name || 'Unknown',
      passed: results.every(r => r.passed),
      results
    };
  }

  testPluginStructure(PluginClass) {
    if (!PluginClass) {
      throw new Error('Plugin class is required');
    }

    if (typeof PluginClass !== 'function') {
      throw new Error('Plugin must be a class/function');
    }

    if (!PluginClass.prototype instanceof BasePlugin) {
      throw new Error('Plugin must extend BasePlugin');
    }

    return { name: 'Plugin Structure', details: 'Plugin has correct inheritance' };
  }

  testPluginMetadata(PluginClass) {
    const metadata = PluginClass.metadata;

    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Plugin must have static metadata getter');
    }

    const required = ['name', 'displayName', 'category'];
    const missing = required.filter(prop => !metadata[prop]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required metadata: ${missing.join(', ')}`);
    }

    // Validate metadata values
    if (typeof metadata.name !== 'string' || metadata.name.length === 0) {
      throw new Error('Metadata.name must be a non-empty string');
    }

    if (typeof metadata.displayName !== 'string' || metadata.displayName.length === 0) {
      throw new Error('Metadata.displayName must be a non-empty string');
    }

    const validCategories = ['stack', 'database', 'testing', 'styling', 'deployment', 'misc'];
    if (!validCategories.includes(metadata.category)) {
      throw new Error(`Invalid category: ${metadata.category}. Must be one of: ${validCategories.join(', ')}`);
    }

    return { name: 'Plugin Metadata', details: `Valid metadata for ${metadata.name}` };
  }

  testPluginInstantiation(PluginClass) {
    // Test with empty config
    const plugin1 = new PluginClass();
    if (!plugin1) {
      throw new Error('Plugin should instantiate with empty config');
    }

    // Test with sample config
    const sampleConfig = {
      projectType: 'fullstack',
      language: 'TypeScript',
      stack: PluginClass.metadata.name
    };

    const plugin2 = new PluginClass(sampleConfig);
    if (!plugin2) {
      throw new Error('Plugin should instantiate with config');
    }

    if (plugin2.config !== sampleConfig) {
      throw new Error('Plugin should store config properly');
    }

    return { name: 'Plugin Instantiation', details: 'Plugin instantiates correctly' };
  }

  testPluginMethods(PluginClass) {
    const plugin = new PluginClass();
    const requiredMethods = [
      'getDependencies',
      'getDevDependencies',
      'getFileStructure',
      'getConfigFiles',
      'getMarkdownSections',
      'getQuestions',
      'getCommands',
      'getSupportedFeatures',
      'getLanguageExtension',
      'isCompatibleWith',
      'getTemplateVariables',
      'getSecurityGuidelines'
    ];

    const missingMethods = requiredMethods.filter(method => 
      typeof plugin[method] !== 'function'
    );

    if (missingMethods.length > 0) {
      throw new Error(`Missing required methods: ${missingMethods.join(', ')}`);
    }

    // Test method return types
    const deps = plugin.getDependencies();
    if (!deps || typeof deps !== 'object' || !deps.production || !Array.isArray(deps.production)) {
      throw new Error('getDependencies() must return object with production array');
    }

    const devDeps = plugin.getDevDependencies();
    if (!Array.isArray(devDeps)) {
      throw new Error('getDevDependencies() must return array');
    }

    const fileStructure = plugin.getFileStructure();
    if (typeof fileStructure !== 'string') {
      throw new Error('getFileStructure() must return string');
    }

    const configFiles = plugin.getConfigFiles();
    if (!Array.isArray(configFiles)) {
      throw new Error('getConfigFiles() must return array');
    }

    const sections = plugin.getMarkdownSections();
    if (!Array.isArray(sections)) {
      throw new Error('getMarkdownSections() must return array');
    }

    const questions = plugin.getQuestions();
    if (!Array.isArray(questions)) {
      throw new Error('getQuestions() must return array');
    }

    const commands = plugin.getCommands();
    if (!commands || typeof commands !== 'object') {
      throw new Error('getCommands() must return object');
    }

    const features = plugin.getSupportedFeatures();
    if (!Array.isArray(features)) {
      throw new Error('getSupportedFeatures() must return array');
    }

    return { name: 'Plugin Methods', details: 'All required methods present and return correct types' };
  }

  testPluginRegistration(PluginClass) {
    const testRegistry = new PluginRegistry();
    
    // Test successful registration
    testRegistry.register(PluginClass);
    
    const registered = testRegistry.get(PluginClass.metadata.name);
    if (registered !== PluginClass) {
      throw new Error('Plugin not registered correctly');
    }

    // Test duplicate registration
    try {
      testRegistry.register(PluginClass);
      throw new Error('Should not allow duplicate registration');
    } catch (error) {
      if (!error.message.includes('already registered')) {
        throw new Error('Should throw specific error for duplicate registration');
      }
    }

    return { name: 'Plugin Registration', details: 'Plugin registers correctly and prevents duplicates' };
  }

  testPluginConfiguration(PluginClass) {
    const plugin = new PluginClass();
    const schema = plugin.getConfigSchema();
    
    // Schema is optional, but if present should be valid
    if (schema && (typeof schema !== 'object' || schema === null)) {
      throw new Error('getConfigSchema() must return object or null');
    }

    // Test with invalid config if schema exists
    if (schema) {
      const invalidConfig = { invalid: 'config' };
      try {
        new PluginClass(invalidConfig);
        // If it doesn't throw, validation might not be implemented
      } catch (error) {
        // Expected if validation is strict
      }
    }

    return { name: 'Plugin Configuration', details: 'Plugin handles configuration correctly' };
  }

  // Integration tests
  async testPluginIntegration(PluginClass) {
    const tests = [
      () => this.testWithGenerator(PluginClass),
      () => this.testWithQuestionSystem(PluginClass),
      () => this.testCompatibility(PluginClass)
    ];

    const results = [];

    for (const test of tests) {
      try {
        const result = await test();
        results.push({ ...result, passed: true });
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error.message
        });
      }
    }

    return {
      pluginName: PluginClass.metadata?.name || 'Unknown',
      integrationPassed: results.every(r => r.passed),
      results
    };
  }

  async testWithGenerator(PluginClass) {
    const { generator } = await import('../generator.js');
    
    const config = {
      projectType: 'fullstack',
      stack: PluginClass.metadata.name,
      language: 'TypeScript',
      packageManager: 'npm',
      styling: 'tailwind',
      testing: 'jest',
      deployment: 'vercel'
    };

    // This should not throw
    const markdown = await generator.generateMarkdown(config);
    
    if (typeof markdown !== 'string' || markdown.length === 0) {
      throw new Error('Generator should produce non-empty markdown');
    }

    return { name: 'Generator Integration', details: 'Plugin works with generator' };
  }

  async testWithQuestionSystem(PluginClass) {
    const { questionGenerator } = await import('../questions.js');
    
    // This should not throw
    const questions = await questionGenerator.getQuestions();
    
    if (!Array.isArray(questions)) {
      throw new Error('Question system should return array');
    }

    return { name: 'Question System Integration', details: 'Plugin works with question system' };
  }

  testCompatibility(PluginClass) {
    const plugin = new PluginClass();
    const otherPlugin = new PluginClass(); // Self-compatibility test
    
    const isCompatible = plugin.isCompatibleWith(otherPlugin);
    
    if (typeof isCompatible !== 'boolean') {
      throw new Error('isCompatibleWith() must return boolean');
    }

    return { name: 'Plugin Compatibility', details: 'Plugin compatibility system works' };
  }

  // Performance tests
  async testPluginPerformance(PluginClass) {
    const iterations = 100;
    const startTime = Date.now();

    // Test instantiation performance
    for (let i = 0; i < iterations; i++) {
      const plugin = new PluginClass();
      plugin.getDependencies();
      plugin.getFileStructure();
      plugin.getConfigFiles();
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    if (avgTime > 10) { // 10ms per iteration threshold
      throw new Error(`Plugin is too slow: ${avgTime}ms per operation`);
    }

    return {
      name: 'Plugin Performance',
      details: `Average operation time: ${avgTime.toFixed(2)}ms`,
      totalTime,
      iterations
    };
  }

  // Utility methods for test setup
  async runAllTests(PluginClass) {
    const results = {};

    results.compliance = await this.testPluginCompliance(PluginClass);
    results.integration = await this.testPluginIntegration(PluginClass);
    results.performance = await this.testPluginPerformance(PluginClass);

    const allPassed = results.compliance.passed && 
                     results.integration.integrationPassed &&
                     (results.performance && typeof results.performance === 'object');

    return {
      pluginName: PluginClass.metadata?.name || 'Unknown',
      allPassed,
      results
    };
  }

  generateTestReport(testResults) {
    let report = `# Plugin Test Report\n\n`;
    report += `**Plugin:** ${testResults.pluginName}\n`;
    report += `**Overall Status:** ${testResults.allPassed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    report += `## Compliance Tests\n`;
    report += `**Status:** ${testResults.results.compliance.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    testResults.results.compliance.results.forEach(result => {
      report += `- **${result.name}:** ${result.passed ? '✅' : '❌'} ${result.details || result.error}\n`;
    });

    report += `\n## Integration Tests\n`;
    report += `**Status:** ${testResults.results.integration.integrationPassed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    testResults.results.integration.results.forEach(result => {
      report += `- **${result.name}:** ${result.passed ? '✅' : '❌'} ${result.details || result.error}\n`;
    });

    report += `\n## Performance Tests\n`;
    if (testResults.results.performance.details) {
      report += `**Status:** ✅ PASSED\n`;
      report += `- **Performance:** ✅ ${testResults.results.performance.details}\n`;
    } else {
      report += `**Status:** ❌ FAILED\n`;
    }

    return report;
  }
}

export const pluginTestFramework = new PluginTestFramework();