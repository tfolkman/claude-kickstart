export class BasePlugin {
  static get metadata() {
    throw new Error('Plugin must implement static metadata getter');
  }

  static get version() {
    return '1.0.0';
  }

  static get requirements() {
    return {
      node: '>=14.0.0',
      npm: '>=6.0.0'
    };
  }

  constructor(config = {}) {
    this.config = config;
    this.validateConfig();
  }

  validateConfig() {
    const schema = this.getConfigSchema();
    if (schema && !this.isValidConfig(this.config, schema)) {
      throw new Error(`Invalid configuration for plugin ${this.constructor.metadata.name}`);
    }
  }

  isValidConfig(config, schema) {
    // Basic validation - can be extended
    return true;
  }

  // Core plugin methods that must be implemented
  getDependencies() {
    return {
      production: [],
      development: []
    };
  }

  getDevDependencies() {
    return [];
  }

  getFileStructure() {
    return '';
  }

  getConfigFiles() {
    return [];
  }

  getConfigSchema() {
    return null;
  }

  // Template and content generation
  getMarkdownSections() {
    return [];
  }

  getQuestions() {
    return [];
  }

  getCommands() {
    return {
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm test',
      lint: 'npm run lint'
    };
  }

  // Lifecycle hooks
  async beforeGeneration(config) {
    // Override in subclasses
  }

  async afterGeneration(config) {
    // Override in subclasses
  }

  // Utility methods
  supports(feature) {
    const features = this.getSupportedFeatures();
    return features.includes(feature);
  }

  getSupportedFeatures() {
    return [];
  }

  getLanguageExtension() {
    return 'js';
  }

  // Plugin compatibility
  isCompatibleWith(otherPlugin) {
    return true;
  }

  getConflicts() {
    return [];
  }

  // Template variables this plugin provides
  getTemplateVariables() {
    return {};
  }

  // Security configurations
  getSecurityGuidelines() {
    return [];
  }

  // Testing configurations
  getTestingStrategy() {
    return null;
  }

  // UI/Styling configurations
  getUIGuidelines() {
    return null;
  }
}