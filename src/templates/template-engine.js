import fs from 'fs-extra';
import path from 'path';

export class TemplateEngine {
  constructor() {
    this.templateCache = new Map();
    this.helpers = new Map();
    this.partials = new Map();
    
    // Register built-in helpers
    this.registerHelper('if', this.ifHelper.bind(this));
    this.registerHelper('unless', this.unlessHelper.bind(this));
    this.registerHelper('each', this.eachHelper.bind(this));
    this.registerHelper('join', this.joinHelper.bind(this));
    this.registerHelper('uppercase', this.uppercaseHelper.bind(this));
    this.registerHelper('lowercase', this.lowercaseHelper.bind(this));
  }

  registerHelper(name, fn) {
    this.helpers.set(name, fn);
  }

  registerPartial(name, template) {
    this.partials.set(name, template);
  }

  async loadTemplate(templatePath) {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath);
    }

    try {
      const template = await fs.readFile(templatePath, 'utf8');
      this.templateCache.set(templatePath, template);
      return template;
    } catch (error) {
      throw new Error(`Failed to load template ${templatePath}: ${error.message}`);
    }
  }

  render(template, context = {}) {
    let result = template;

    // Handle partials first {{> partialName}}
    result = this.renderPartials(result, context);

    // Handle conditional blocks {{#if condition}} ... {{/if}}
    result = this.renderConditionals(result, context);

    // Handle loops {{#each items}} ... {{/each}}
    result = this.renderLoops(result, context);

    // Handle simple variable substitution {{variable}}
    result = this.renderVariables(result, context);

    // Handle helper functions {{helper arg1 arg2}}
    result = this.renderHelpers(result, context);

    return result;
  }

  async renderFile(templatePath, context = {}) {
    const template = await this.loadTemplate(templatePath);
    return this.render(template, context);
  }

  renderPartials(template, context) {
    const partialRegex = /\{\{>\s*(\w+)\s*\}\}/g;
    return template.replace(partialRegex, (match, partialName) => {
      const partial = this.partials.get(partialName);
      return partial ? this.render(partial, context) : match;
    });
  }

  renderConditionals(template, context) {
    // Handle {{#if condition}} ... {{else}} ... {{/if}} with proper nesting
    let result = template;
    
    // Process from innermost to outermost by finding the first {{#if}} that has a matching {{/if}}
    while (true) {
      let foundMatch = false;
      
      // Find all {{#if}} positions
      const ifMatches = [];
      const ifRegex = /\{\{#if\s+([^}]+)\}\}/g;
      let match;
      
      while ((match = ifRegex.exec(result)) !== null) {
        ifMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          condition: match[1].trim(),
          fullMatch: match[0]
        });
      }
      
      if (ifMatches.length === 0) break;
      
      // For each {{#if}}, find its matching {{/if}}
      for (const ifMatch of ifMatches) {
        let depth = 1;
        let pos = ifMatch.end;
        let elsePos = null;
        
        while (pos < result.length && depth > 0) {
          const nextIf = result.indexOf('{{#if', pos);
          const nextElse = result.indexOf('{{else}}', pos);
          const nextEndIf = result.indexOf('{{/if}}', pos);
          
          // Find the next significant position
          const positions = [nextIf, nextElse, nextEndIf].filter(p => p !== -1);
          if (positions.length === 0) break;
          
          const nextPos = Math.min(...positions);
          
          if (nextPos === nextIf) {
            depth++;
            pos = nextPos + 5; // Move past {{#if
          } else if (nextPos === nextElse && depth === 1 && elsePos === null) {
            elsePos = nextPos;
            pos = nextPos + 8; // Move past {{else}}
          } else if (nextPos === nextEndIf) {
            depth--;
            if (depth === 0) {
              // Found matching {{/if}}
              const ifContent = result.substring(ifMatch.end, elsePos || nextPos);
              const elseContent = elsePos ? result.substring(elsePos + 8, nextPos) : '';
              
              const value = this.getValue(ifMatch.condition, context);
              const isTruthy = Array.isArray(value) ? value.length > 0 : !!value;
              const replacement = isTruthy ? ifContent : elseContent;
              
              result = result.substring(0, ifMatch.start) + replacement + result.substring(nextPos + 7);
              foundMatch = true;
              break;
            }
            pos = nextPos + 7; // Move past {{/if}}
          }
        }
        
        if (foundMatch) break;
      }
      
      if (!foundMatch) break;
    }
    
    return result;
  }

  renderLoops(template, context) {
    // Handle {{#each items}} ... {{/each}}
    const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(eachRegex, (match, arrayPath, itemTemplate) => {
      const array = this.getValue(arrayPath.trim(), context);
      if (!Array.isArray(array)) return '';

      return array.map((item, index) => {
        const itemContext = {
          ...context,
          this: item,
          '@index': index,
          '@first': index === 0,
          '@last': index === array.length - 1,
          '@length': array.length
        };
        
        // If item is an object, merge its properties into the context
        if (typeof item === 'object' && item !== null) {
          Object.assign(itemContext, item);
        }
        
        return this.render(itemTemplate, itemContext);
      }).join('');
    });
  }

  renderVariables(template, context) {
    // Handle {{variable}} and {{variable.property}} - but NOT helpers with spaces
    const variableRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)*)\}\}/g;
    
    return template.replace(variableRegex, (match, varPath) => {
      const value = this.getValue(varPath.trim(), context);
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  renderHelpers(template, context) {
    // Handle {{helper arg1 arg2}}
    const helperRegex = /\{\{(\w+)\s+([^}]+)\}\}/g;
    
    return template.replace(helperRegex, (match, helperName, args) => {
      const helper = this.helpers.get(helperName);
      if (!helper) return match;

      const argValues = this.parseHelperArgs(args, context);
      const result = helper(...argValues, context);
      return result || '';
    });
  }

  getValue(path, context) {
    if (path === 'this') return context.this || context;
    if (path.startsWith('@')) return context[path];

    const keys = path.split('.');
    let value = context;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  parseHelperArgs(argsString, context) {
    const args = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = null;
    
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }
      
      if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
        // Add the quoted content as an argument
        args.push(current);
        current = '';
        continue;
      }
      
      if (!inQuotes && /\s/.test(char)) {
        if (current.trim()) {
          args.push(current.trim());
          current = '';
        }
        continue;
      }
      
      current += char;
    }
    
    if (current.trim()) {
      args.push(current.trim());
    }
    
    return args.map(arg => {
      // If it looks like a variable path, resolve it
      if (/^[a-zA-Z@]/.test(arg)) {
        return this.getValue(arg, context);
      }
      // If it's a number, parse it
      if (/^\d+$/.test(arg)) {
        return parseInt(arg, 10);
      }
      return arg;
    });
  }

  // Built-in helpers
  ifHelper(condition, context) {
    return condition ? 'true' : '';
  }

  unlessHelper(condition, context) {
    return !condition ? 'true' : '';
  }

  eachHelper(array, template, context) {
    if (!Array.isArray(array)) return '';
    return array.map(item => template.replace(/\{\{this\}\}/g, item)).join('');
  }

  joinHelper(array, separator = ', ', context) {
    if (!Array.isArray(array)) return '';
    return array.join(separator);
  }

  uppercaseHelper(str, context) {
    return String(str).toUpperCase();
  }

  lowercaseHelper(str, context) {
    return String(str).toLowerCase();
  }

  clearCache() {
    this.templateCache.clear();
  }

  getCacheStats() {
    return {
      templatesCached: this.templateCache.size,
      helperCount: this.helpers.size,
      partialCount: this.partials.size
    };
  }
}

export const templateEngine = new TemplateEngine();