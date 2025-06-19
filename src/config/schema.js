export const configSchema = {
  type: 'object',
  properties: {
    projectType: {
      type: 'string',
      enum: ['fullstack', 'backend', 'frontend', 'cli', 'mobile', 'datascience', 'library'],
      description: 'Type of project being created'
    },
    stack: {
      type: 'string',
      description: 'Technology stack chosen'
    },
    customStack: {
      type: 'string',
      description: 'Custom stack description when stack is "custom"'
    },
    language: {
      type: 'string',
      enum: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Java', 'Ruby', 'Rust', 'C++', 'C#', 'Other'],
      description: 'Primary programming language'
    },
    customLanguage: {
      type: 'string',
      description: 'Custom language when language is "Other"'
    },
    packageManager: {
      type: 'string',
      enum: ['npm', 'yarn', 'pnpm', 'bun'],
      default: 'npm',
      description: 'Package manager for Node.js projects'
    },
    database: {
      type: 'string',
      enum: ['postgresql', 'mysql', 'mongodb', 'sqlite', 'supabase', 'firebase', 'other', 'none'],
      description: 'Database choice'
    },
    customDatabase: {
      type: 'string',
      description: 'Custom database when database is "other"'
    },
    authentication: {
      type: 'string',
      enum: ['nextauth', 'clerk', 'auth0', 'supabase-auth', 'jwt', 'other', 'none'],
      description: 'Authentication strategy'
    },
    customAuthentication: {
      type: 'string',
      description: 'Custom authentication when authentication is "other"'
    },
    styling: {
      type: 'string',
      enum: ['tailwind', 'css-modules', 'styled-components', 'vanilla-css', 'scss', 'emotion'],
      description: 'Styling approach for frontend projects'
    },
    componentLibrary: {
      type: 'string',
      enum: ['shadcn', 'mantine', 'mui', 'antd', 'chakra', 'none'],
      description: 'Component library choice'
    },
    testing: {
      type: 'string',
      enum: ['jest', 'vitest', 'playwright', 'cypress', 'pytest', 'unittest', 'go-test', 'none'],
      description: 'Testing framework'
    },
    deployment: {
      type: 'string',
      enum: ['vercel', 'netlify', 'aws', 'gcp', 'fly', 'railway', 'docker', 'unsure'],
      description: 'Deployment target'
    },
    codeStyle: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['ts-strict', 'functional', 'self-documenting', 'comments', 'early-returns', 'error-handling']
      },
      description: 'Coding style preferences'
    },
    claudeBehavior: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['explain', 'ask-first', 'tdd', 'fast', 'patterns']
      },
      description: 'Claude behavior preferences'
    },
    gitCommitStyle: {
      type: 'string',
      enum: ['conventional', 'simple', 'detailed'],
      description: 'Git commit message style'
    },
    branchStrategy: {
      type: 'string',
      enum: ['feature-slash', 'feature-dash', 'username'],
      description: 'Branch naming strategy'
    },
    wantAdvancedOptions: {
      type: 'boolean',
      default: false,
      description: 'Whether to configure advanced options'
    },
    mcpServers: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['puppeteer', 'sentry', 'database', 'filesystem', 'git', 'none']
      },
      description: 'MCP servers to configure'
    },
    preferredWorkflow: {
      type: 'string',
      enum: ['explore-plan-code', 'tdd', 'screenshot-ui', 'safe-yolo', 'multi-claude', 'standard'],
      default: 'standard',
      description: 'Preferred development workflow'
    },
    teamFeatures: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['shared-mcp', 'team-commands', 'team-allowlist', 'review-automation', 'issue-triage', 'none']
      },
      description: 'Team collaboration features'
    },
    saveProfile: {
      type: 'boolean',
      default: true,
      description: 'Whether to save configuration as a profile'
    },
    profileName: {
      type: 'string',
      description: 'Name for saved profile'
    }
  },
  required: ['projectType']
};

export class ConfigValidator {
  constructor(schema = configSchema) {
    this.schema = schema;
  }

  validate(config) {
    const errors = [];
    const warnings = [];

    // Basic type and required field validation
    this.validateRequired(config, this.schema, errors);
    this.validateTypes(config, this.schema, errors);
    this.validateEnums(config, this.schema, errors);

    // Business logic validation
    this.validateBusinessRules(config, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateRequired(config, schema, errors, path = '') {
    if (!schema.required) return;

    for (const field of schema.required) {
      if (config[field] === undefined || config[field] === null) {
        errors.push(`Required field missing: ${path}${field}`);
      }
    }
  }

  validateTypes(config, schema, errors, path = '') {
    if (!schema.properties) return;

    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      const value = config[field];
      if (value === undefined || value === null) continue;

      const fieldPath = path ? `${path}.${field}` : field;

      switch (fieldSchema.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${fieldPath} must be a string, got ${typeof value}`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${fieldPath} must be a boolean, got ${typeof value}`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${fieldPath} must be an array, got ${typeof value}`);
          }
          break;
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`${fieldPath} must be an object, got ${typeof value}`);
          }
          break;
      }
    }
  }

  validateEnums(config, schema, errors, path = '') {
    if (!schema.properties) return;

    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      const value = config[field];
      if (value === undefined || value === null) continue;

      const fieldPath = path ? `${path}.${field}` : field;

      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        errors.push(`${fieldPath} must be one of: ${fieldSchema.enum.join(', ')}`);
      }

      if (fieldSchema.type === 'array' && fieldSchema.items?.enum && Array.isArray(value)) {
        for (const item of value) {
          if (!fieldSchema.items.enum.includes(item)) {
            errors.push(`${fieldPath} contains invalid value: ${item}`);
          }
        }
      }
    }
  }

  validateBusinessRules(config, errors, warnings) {
    // Custom stack validation
    if (config.stack === 'custom' && !config.customStack) {
      errors.push('customStack is required when stack is "custom"');
    }

    if (config.language === 'Other' && !config.customLanguage) {
      errors.push('customLanguage is required when language is "Other"');
    }

    if (config.database === 'other' && !config.customDatabase) {
      errors.push('customDatabase is required when database is "other"');
    }

    if (config.authentication === 'other' && !config.customAuthentication) {
      errors.push('customAuthentication is required when authentication is "other"');
    }

    // Profile name validation
    if (config.saveProfile && !config.profileName) {
      errors.push('profileName is required when saveProfile is true');
    }

    // Compatibility warnings
    if (config.stack === 'nextjs-app' && config.styling === 'styled-components') {
      warnings.push('Styled Components with App Router may require additional configuration');
    }

    if (config.database === 'mongodb' && config.language === 'Go') {
      warnings.push('MongoDB with Go may require additional driver setup');
    }

    // Logical consistency checks
    if (['cli', 'library'].includes(config.projectType) && 
        ['tailwind', 'styled-components'].includes(config.styling)) {
      warnings.push('Styling frameworks are typically not needed for CLI tools or libraries');
    }

    if (config.projectType === 'backend' && config.componentLibrary !== 'none') {
      warnings.push('Component libraries are not typically used in backend-only projects');
    }
  }

  getDefaults() {
    return this.extractDefaults(this.schema);
  }

  extractDefaults(schema, result = {}) {
    if (!schema.properties) return result;

    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      if (fieldSchema.default !== undefined) {
        result[field] = fieldSchema.default;
      }

      if (fieldSchema.type === 'object' && fieldSchema.properties) {
        result[field] = result[field] || {};
        this.extractDefaults(fieldSchema, result[field]);
      }
    }

    return result;
  }

  sanitize(config) {
    const sanitized = { ...config };

    // Remove undefined and null values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined || sanitized[key] === null) {
        delete sanitized[key];
      }
    });

    // Ensure arrays are actually arrays
    ['codeStyle', 'claudeBehavior', 'mcpServers', 'teamFeatures'].forEach(field => {
      if (sanitized[field] && !Array.isArray(sanitized[field])) {
        sanitized[field] = [sanitized[field]];
      }
    });

    // Trim string values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim();
      }
    });

    return sanitized;
  }
}

export const validator = new ConfigValidator();