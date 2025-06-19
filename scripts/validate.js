#!/usr/bin/env node

import '../src/plugins/index.js'; // Auto-register plugins
import { questionGenerator } from '../src/questions.js';
import { generator } from '../src/generator.js';
import { registry } from '../src/plugins/registry.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Consolidated Plugin Validation System
 * 
 * Combines comprehensive output validation, quick checks, and core requirement testing
 */
class ValidationSuite {
  constructor(options = {}) {
    this.generator = generator;
    this.registry = registry;
    this.questionGenerator = questionGenerator;
    this.outputDir = options.outputDir || './validation-output';
    this.mode = options.mode || 'full'; // 'quick', 'full', 'requirements', 'all'
    this.results = {
      plugins: [],
      requirements: null,
      summary: {
        totalPlugins: 0,
        passed: 0,
        warnings: 0,
        failed: 0,
        startTime: Date.now(),
        endTime: null
      }
    };
  }

  async run() {
    console.log(`🧪 Claude Kickstart Validation Suite (${this.mode} mode)\n`);
    console.log('='.repeat(60));

    try {
      switch (this.mode) {
        case 'quick':
          await this.runQuickValidation();
          break;
        case 'requirements':
          await this.runRequirementsValidation();
          break;
        case 'full':
          await this.runFullValidation();
          break;
        case 'all':
          await this.runRequirementsValidation();
          console.log('\n' + '='.repeat(60) + '\n');
          await this.runFullValidation();
          break;
        default:
          throw new Error(`Unknown validation mode: ${this.mode}`);
      }

      this.results.summary.endTime = Date.now();
      this.printFinalSummary();
      
      return this.results;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  // Quick validation mode - tests key plugins only
  async runQuickValidation() {
    console.log('🚀 Quick Plugin Validation\n');
    
    const keyPlugins = [
      { id: 'nextjs-app', config: { stack: 'nextjs-app', projectType: 'fullstack', language: 'TypeScript', styling: 'tailwind', database: 'postgresql' }},
      { id: 'react', config: { stack: 'react', projectType: 'frontend', language: 'TypeScript', styling: 'tailwind' }},
      { id: 'fastapi', config: { stack: 'fastapi', projectType: 'backend', language: 'Python', database: 'postgresql' }},
      { id: 'mern', config: { stack: 'mern', projectType: 'fullstack', language: 'TypeScript' }},
      { id: 'vue', config: { stack: 'vue', projectType: 'frontend', language: 'TypeScript', styling: 'tailwind' }}
    ];

    await fs.ensureDir(this.outputDir);

    for (const { id, config } of keyPlugins) {
      console.log(`📦 Testing ${id}...`);
      await this.validateSinglePlugin(id, config, true);
    }

    this.results.summary.totalPlugins = keyPlugins.length;
  }

  // Full validation mode - tests all plugins with multiple configurations
  async runFullValidation() {
    console.log('🔬 Comprehensive Plugin Validation\n');
    
    await fs.ensureDir(this.outputDir);
    const allPlugins = this.registry.getAllPlugins();
    console.log(`Found ${allPlugins.length} plugins to validate:\n`);

    for (const { id, metadata } of allPlugins) {
      console.log(`📦 Testing ${metadata.displayName} (${id})`);
      await this.validatePluginWithConfigurations(id, metadata);
      console.log('');
    }

    this.results.summary.totalPlugins = allPlugins.length;
    this.printPluginSummary();
  }

  // Requirements validation mode - tests core system requirements
  async runRequirementsValidation() {
    console.log('📋 Core Requirements Validation\n');

    const requirements = {
      questionCoverage: await this.validateQuestionCoverage(),
      pluginArchitecture: await this.validatePluginArchitecture(),
      outputQuality: await this.validateOutputQuality(),
      templateSystem: await this.validateTemplateSystem()
    };

    this.results.requirements = requirements;
    this.printRequirementsSummary(requirements);
  }

  async validateSinglePlugin(pluginId, config, isQuickMode = false) {
    try {
      const markdown = await this.generator.generateMarkdown(config);
      
      // Save output file
      const filename = isQuickMode ? `${pluginId}-quick.md` : `${pluginId}-${this.getConfigName(config)}.md`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, markdown);

      // Validate content
      const validation = this.validateContent(markdown, config);
      const result = {
        pluginId,
        config: isQuickMode ? 'quick' : this.getConfigName(config),
        validation,
        status: this.getValidationStatus(validation),
        length: markdown.length,
        errors: []
      };

      this.results.plugins.push(result);
      
      if (isQuickMode) {
        const passCount = Object.values(validation).filter(v => typeof v === 'boolean' && v).length;
        const totalChecks = Object.values(validation).filter(v => typeof v === 'boolean').length;
        console.log(`   ${result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'} PASS - Score: ${passCount}/${totalChecks} (${markdown.length} chars)`);
      }

      this.updateSummaryCounters(result.status);
      return result;

    } catch (error) {
      const result = {
        pluginId,
        config: isQuickMode ? 'quick' : this.getConfigName(config),
        validation: {},
        status: 'failed',
        length: 0,
        errors: [error.message]
      };
      
      this.results.plugins.push(result);
      this.updateSummaryCounters('failed');
      console.log(`   ❌ Failed: ${error.message}`);
      return result;
    }
  }

  async validatePluginWithConfigurations(pluginId, metadata) {
    const configs = this.generateTestConfigurations(pluginId, metadata);
    
    for (const config of configs) {
      const configName = this.getConfigName(config);
      console.log(`  → Testing configuration: ${configName}`);
      await this.validateSinglePlugin(pluginId, config, false);
    }
  }

  validateContent(markdown, config) {
    return {
      hasTitle: markdown.includes('# 🚀 Claude Code Project Setup'),
      hasOverview: markdown.includes('## Project Overview'),
      hasStructure: markdown.includes('## 📁 Project Structure'),
      hasDependencies: markdown.includes('## 📦 Dependencies to Install'),
      hasProductionDeps: markdown.includes('### Production Dependencies') || markdown.includes('Production Dependencies'),
      hasInstallCommand: markdown.includes('npm install') || markdown.includes('pip install') || markdown.includes('go get') || markdown.includes('bundle install'),
      hasConfigFiles: markdown.includes('## ⚙️ Configuration Files'),
      hasCommands: markdown.includes('## 📝 Common Commands') || markdown.includes('Commands'),
      hasProTips: markdown.includes('## 💡 Pro Tips') || markdown.includes('Critical Instructions'),
      hasSuccessCriteria: markdown.includes('## ✅ Success Criteria') || markdown.includes('Success Criteria'),
      hasValidStructure: this.validateFileStructure(markdown),
      hasValidDependencies: this.validateDependencies(markdown, config),
      hasValidConfiguration: this.validateConfiguration(markdown)
    };
  }

  validateFileStructure(markdown) {
    const structureRegex = /## 📁 Project Structure[\s\S]*?```([\s\S]*?)```/;
    const match = markdown.match(structureRegex);
    if (!match) return false;
    
    const structure = match[1];
    return structure.length > 20 && (structure.includes('├──') || structure.includes('└──'));
  }

  validateDependencies(markdown, config) {
    const startIdx = markdown.indexOf('## 📦 Dependencies to Install');
    if (startIdx === -1) return false;
    
    const nextSectionIdx = markdown.indexOf('\n## ', startIdx + 1);
    const depsSection = nextSectionIdx === -1 
      ? markdown.substring(startIdx)
      : markdown.substring(startIdx, nextSectionIdx);
    
    return depsSection.includes('Production Dependencies') && 
           (depsSection.includes('npm install') || depsSection.includes('pip install') || 
            depsSection.includes('go get') || depsSection.includes('bundle install'));
  }

  validateConfiguration(markdown) {
    const configRegex = /## ⚙️ Configuration Files[\s\S]*?(?=##|$)/;
    const match = markdown.match(configRegex);
    return match && match[0].includes('```') && match[0].length > 100;
  }

  getValidationStatus(validation) {
    const booleanChecks = Object.values(validation).filter(v => typeof v === 'boolean');
    const passed = booleanChecks.filter(v => v).length;
    const total = booleanChecks.length;
    
    if (passed === total) return 'passed';
    if (passed >= total * 0.8) return 'warning';
    return 'failed';
  }

  updateSummaryCounters(status) {
    switch (status) {
      case 'passed': this.results.summary.passed++; break;
      case 'warning': this.results.summary.warnings++; break;
      case 'failed': this.results.summary.failed++; break;
    }
  }

  generateTestConfigurations(pluginId, metadata) {
    const baseConfig = {
      stack: pluginId,
      projectType: metadata.projectTypes[0],
      language: metadata.languages?.[0] || 'JavaScript',
      packageManager: 'npm',
      deployment: 'vercel',
      testing: 'jest',
      gitCommitStyle: 'conventional',
      branchStrategy: 'feature-slash'
    };

    const configurations = [baseConfig];

    // Add TypeScript configuration if supported
    if (metadata.languages?.includes('TypeScript')) {
      configurations.push({
        ...baseConfig,
        language: 'TypeScript',
        styling: 'tailwind',
        database: 'postgresql',
        authentication: 'jwt'
      });
    }

    // Add different project type if available
    if (metadata.projectTypes.length > 1) {
      configurations.push({
        ...baseConfig,
        projectType: metadata.projectTypes[1]
      });
    }

    return configurations;
  }

  getConfigName(config) {
    const parts = [];
    if (config.language) parts.push(config.language.toLowerCase());
    if (config.styling) parts.push(config.styling);
    if (config.database && config.database !== 'none') parts.push(config.database);
    return parts.join('-') || 'basic';
  }

  async validateQuestionCoverage() {
    const questions = await this.questionGenerator.getQuestions();
    
    const questionTypes = {};
    const covered = {
      projectTypes: [],
      stackSelection: false,
      languageSelection: false,
      databaseOptions: false,
      authOptions: false,
      stylingOptions: false,
      testingOptions: false,
      deploymentOptions: false,
      profileSaving: false
    };

    questions.forEach(q => {
      if (!questionTypes[q.type]) questionTypes[q.type] = 0;
      questionTypes[q.type]++;
      
      if (q.name === 'projectType') covered.projectTypes = q.choices.map(c => c.value);
      if (q.name === 'stack') covered.stackSelection = true;
      if (q.name === 'language') covered.languageSelection = true;
      if (q.name === 'database') covered.databaseOptions = true;
      if (q.name === 'authentication') covered.authOptions = true;
      if (q.name === 'styling') covered.stylingOptions = true;
      if (q.name === 'testing') covered.testingOptions = true;
      if (q.name === 'deployment') covered.deploymentOptions = true;
      if (q.name === 'saveProfile') covered.profileSaving = true;
    });

    return { questionTypes, covered, totalQuestions: questions.length };
  }

  async validatePluginArchitecture() {
    const allPlugins = this.registry.getAllPlugins();
    const categories = {};
    const projectTypes = {};

    allPlugins.forEach(({ metadata }) => {
      if (!categories[metadata.category]) categories[metadata.category] = 0;
      categories[metadata.category]++;
      
      metadata.projectTypes.forEach(type => {
        if (!projectTypes[type]) projectTypes[type] = 0;
        projectTypes[type]++;
      });
    });

    return {
      totalPlugins: allPlugins.length,
      categories,
      projectTypes
    };
  }

  async validateOutputQuality() {
    const testConfigs = [
      { stack: 'nextjs-app', projectType: 'fullstack', language: 'TypeScript' },
      { stack: 'react', projectType: 'frontend', language: 'TypeScript' },
      { stack: 'fastapi', projectType: 'backend', language: 'Python' },
      { stack: 'mern', projectType: 'fullstack', language: 'TypeScript' }
    ];

    const results = [];
    for (const config of testConfigs) {
      try {
        const markdown = await this.generator.generateMarkdown(config);
        const validation = this.validateContent(markdown, config);
        const passed = Object.values(validation).filter(v => typeof v === 'boolean' && v).length;
        const total = Object.values(validation).filter(v => typeof v === 'boolean').length;
        
        results.push({
          stack: config.stack,
          score: `${passed}/${total}`,
          length: markdown.length,
          status: passed === total ? '✅' : '⚠️'
        });
      } catch (error) {
        results.push({
          stack: config.stack,
          score: '0/0',
          length: 0,
          status: '❌',
          error: error.message
        });
      }
    }

    return results;
  }

  async validateTemplateSystem() {
    try {
      const { TemplateEngine } = await import('../src/templates/template-engine.js');
      const engine = new TemplateEngine();
      
      const testTemplate = `Dependencies: {{join deps ' '}}
{{#if hasDB}}Database: {{db}}{{/if}}
{{#each items}}
- {{this}}
{{/each}}`;

      const testData = {
        deps: ['react', 'next'],
        hasDB: true,
        db: 'postgresql',
        items: ['item1', 'item2']
      };

      const result = engine.render(testTemplate, testData);
      const isWorking = result.includes('react next') && result.includes('postgresql');
      
      return {
        working: isWorking,
        sampleOutput: result.trim()
      };
    } catch (error) {
      return {
        working: false,
        error: error.message
      };
    }
  }

  printPluginSummary() {
    console.log('\n📊 PLUGIN VALIDATION SUMMARY\n');
    console.log('='.repeat(50));
    
    const { totalPlugins, passed, warnings, failed } = this.results.summary;
    console.log(`Total Plugins Tested: ${totalPlugins}`);
    console.log(`✅ Fully Passed: ${passed}`);
    console.log(`⚠️  With Warnings: ${warnings}`);
    console.log(`❌ With Failures: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ Plugins with failures:');
      this.results.plugins
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  - ${r.pluginId} (${r.config})`);
          r.errors.forEach(error => console.log(`    Error: ${error}`));
        });
    }

    if (warnings > 0) {
      console.log('\n⚠️  Plugins with warnings:');
      this.results.plugins
        .filter(r => r.status === 'warning')
        .forEach(r => {
          console.log(`  - ${r.pluginId} (${r.config})`);
          const failedChecks = Object.entries(r.validation)
            .filter(([_, value]) => typeof value === 'boolean' && !value)
            .map(([key, _]) => key);
          if (failedChecks.length > 0) {
            console.log(`    Issues: ${failedChecks.join(', ')}`);
          }
        });
    }

    console.log(`\n📁 Generated files saved to: ${this.outputDir}/`);
  }

  printRequirementsSummary(requirements) {
    console.log('📋 Question Coverage Analysis');
    console.log('Question Types:', requirements.questionCoverage.questionTypes);
    console.log(`Total Questions: ${requirements.questionCoverage.totalQuestions}`);
    
    console.log('\n📊 Coverage Analysis:');
    const { covered } = requirements.questionCoverage;
    console.log('Project Types:', covered.projectTypes);
    console.log('Stack Selection:', covered.stackSelection ? '✅' : '❌');
    console.log('Language Selection:', covered.languageSelection ? '✅' : '❌');
    console.log('Database Options:', covered.databaseOptions ? '✅' : '❌');
    console.log('Auth Options:', covered.authOptions ? '✅' : '❌');
    console.log('Styling Options:', covered.stylingOptions ? '✅' : '❌');
    console.log('Testing Options:', covered.testingOptions ? '✅' : '❌');
    console.log('Deployment Options:', covered.deploymentOptions ? '✅' : '❌');
    console.log('Profile Saving:', covered.profileSaving ? '✅' : '❌');

    console.log('\n🔧 Plugin Architecture Analysis');
    console.log(`Total Plugins: ${requirements.pluginArchitecture.totalPlugins}`);
    console.log('Plugins by Category:', requirements.pluginArchitecture.categories);
    console.log('Plugins by Project Type:', requirements.pluginArchitecture.projectTypes);

    console.log('\n📄 Output Quality Analysis');
    requirements.outputQuality.forEach(result => {
      console.log(`${result.stack}: ${result.score} (${result.length} chars) ${result.status}`);
    });

    console.log('\n🎨 Template System Validation');
    if (requirements.templateSystem.working) {
      console.log('Template Engine: ✅ Working');
      console.log('Sample output:', requirements.templateSystem.sampleOutput);
    } else {
      console.log('Template Engine: ❌ Failed');
      if (requirements.templateSystem.error) {
        console.log('Error:', requirements.templateSystem.error);
      }
    }
  }

  printFinalSummary() {
    const duration = this.results.summary.endTime - this.results.summary.startTime;
    console.log('\n🎉 VALIDATION COMPLETE!');
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    
    if (this.mode === 'all' || this.mode === 'full' || this.mode === 'quick') {
      const { passed, warnings, failed } = this.results.summary;
      if (failed > 0) {
        console.log(`❌ ${failed} plugins failed validation`);
        process.exit(1);
      } else if (warnings > 0) {
        console.log(`⚠️  ${warnings} plugins have warnings`);
      } else {
        console.log(`✅ All ${passed} plugins passed validation`);
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'full';
  
  const validModes = ['quick', 'full', 'requirements', 'all'];
  if (!validModes.includes(mode)) {
    console.log('Usage: node validate.js [mode]');
    console.log('Modes:');
    console.log('  quick        - Test 5 key plugins only');
    console.log('  full         - Test all plugins with multiple configurations');
    console.log('  requirements - Test core system requirements');
    console.log('  all          - Run requirements + full validation');
    process.exit(1);
  }

  const validator = new ValidationSuite({ mode });
  await validator.run();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export { ValidationSuite };