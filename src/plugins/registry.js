import { BasePlugin } from './base-plugin.js';

export class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.categories = new Map();
    this.loadedPlugins = new Set();
  }

  register(PluginClass) {
    if (!this.isValidPlugin(PluginClass)) {
      throw new Error(`Invalid plugin class: ${PluginClass?.name || 'unknown'}`);
    }

    const metadata = PluginClass.metadata;
    const pluginId = metadata.name;

    if (this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already registered`);
    }

    this.plugins.set(pluginId, PluginClass);
    
    // Organize by category
    const category = metadata.category || 'misc';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(pluginId);

    return this;
  }

  unregister(pluginId) {
    const PluginClass = this.plugins.get(pluginId);
    if (PluginClass) {
      const category = PluginClass.metadata.category || 'misc';
      const categoryPlugins = this.categories.get(category) || [];
      const index = categoryPlugins.indexOf(pluginId);
      if (index > -1) {
        categoryPlugins.splice(index, 1);
      }
    }
    
    this.plugins.delete(pluginId);
    this.loadedPlugins.delete(pluginId);
    return this;
  }

  get(pluginId) {
    return this.plugins.get(pluginId);
  }

  getByCategory(category) {
    const pluginIds = this.categories.get(category) || [];
    return pluginIds.map(id => ({
      id,
      class: this.plugins.get(id),
      metadata: this.plugins.get(id).metadata
    }));
  }

  getAllCategories() {
    return Array.from(this.categories.keys());
  }

  getAllPlugins() {
    return Array.from(this.plugins.entries()).map(([id, PluginClass]) => ({
      id,
      class: PluginClass,
      metadata: PluginClass.metadata
    }));
  }

  createInstance(pluginId, config = {}) {
    const PluginClass = this.plugins.get(pluginId);
    if (!PluginClass) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const instance = new PluginClass(config);
    this.loadedPlugins.add(pluginId);
    return instance;
  }

  getCompatiblePlugins(pluginId) {
    const targetPlugin = this.plugins.get(pluginId);
    if (!targetPlugin) return [];

    return this.getAllPlugins().filter(({ id, class: PluginClass }) => {
      if (id === pluginId) return false;
      
      try {
        const instance = new PluginClass();
        const targetInstance = new targetPlugin();
        return instance.isCompatibleWith(targetInstance);
      } catch {
        return false;
      }
    });
  }

  findPluginsByFeature(feature) {
    return this.getAllPlugins().filter(({ class: PluginClass }) => {
      try {
        const instance = new PluginClass();
        return instance.supports(feature);
      } catch {
        return false;
      }
    });
  }

  findPluginsByLanguage(language) {
    return this.getAllPlugins().filter(({ metadata }) => {
      return metadata.languages && metadata.languages.includes(language);
    });
  }

  findPluginsByProjectType(projectType) {
    return this.getAllPlugins().filter(({ metadata }) => {
      return metadata.projectTypes && metadata.projectTypes.includes(projectType);
    });
  }

  validatePluginCompatibility(pluginIds) {
    const conflicts = [];
    const instances = pluginIds.map(id => {
      const PluginClass = this.plugins.get(id);
      return PluginClass ? new PluginClass() : null;
    }).filter(Boolean);

    for (let i = 0; i < instances.length; i++) {
      for (let j = i + 1; j < instances.length; j++) {
        if (!instances[i].isCompatibleWith(instances[j])) {
          conflicts.push({
            plugin1: pluginIds[i],
            plugin2: pluginIds[j],
            reason: 'Incompatible plugins'
          });
        }
      }
    }

    return conflicts;
  }

  isValidPlugin(PluginClass) {
    if (!PluginClass || typeof PluginClass !== 'function') {
      return false;
    }

    if (!PluginClass.prototype instanceof BasePlugin) {
      return false;
    }

    if (!PluginClass.metadata || typeof PluginClass.metadata !== 'object') {
      return false;
    }

    const required = ['name', 'displayName', 'category'];
    return required.every(prop => PluginClass.metadata[prop]);
  }

  async loadExternalPlugin(pluginPath) {
    try {
      const { default: PluginClass } = await import(pluginPath);
      this.register(PluginClass);
      return PluginClass.metadata.name;
    } catch (error) {
      throw new Error(`Failed to load plugin from ${pluginPath}: ${error.message}`);
    }
  }

  getPluginDependencies(pluginId) {
    const PluginClass = this.plugins.get(pluginId);
    if (!PluginClass) return { production: [], development: [] };

    try {
      const instance = new PluginClass();
      return instance.getDependencies();
    } catch {
      return { production: [], development: [] };
    }
  }

  registerBuiltInPlugins() {
    // Will be populated by individual plugin imports
  }
}

// Create and export default registry instance
export const registry = new PluginRegistry();