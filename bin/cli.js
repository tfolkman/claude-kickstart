#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { runWizard } from '../src/index.js';
import { loadProfile, quickSetup } from '../src/profiles.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(await readFile(join(__dirname, '../package.json'), 'utf8'));

program
  .version(pkg.version)
  .description('Generate perfect Claude Code setup files with plugin system')
  .option('-p, --profile <name>', 'Use saved profile')
  .option('-q, --quick', 'Use last configuration')
  .action(async (options) => {
    console.clear();
    console.log(chalk.blue('🚀 Claude Kickstart v' + pkg.version + ' (Plugin System)'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log();
    
    if (options.profile) {
      await loadProfile(options.profile);
    } else if (options.quick) {
      await quickSetup();
    } else {
      await runWizard();
    }
  });

// Plugin management commands
program
  .command('plugins')
  .description('List available plugins')
  .action(async () => {
    const { registry } = await import('../src/plugins/index.js');
    
    console.log(chalk.cyan('\n🔧 Available Plugins:\n'));
    
    const plugins = registry.getAllPlugins();
    const categories = registry.getAllCategories();
    
    for (const category of categories) {
      const categoryPlugins = registry.getByCategory(category);
      console.log(chalk.yellow(`📁 ${category.toUpperCase()}`));
      
      categoryPlugins.forEach(({ metadata }) => {
        console.log(chalk.gray(`  ${metadata.icon || '📦'} ${metadata.displayName}`));
        console.log(chalk.gray(`    ${metadata.description || 'No description'}`));
        if (metadata.languages) {
          console.log(chalk.gray(`    Languages: ${metadata.languages.join(', ')}`));
        }
        console.log();
      });
    }
    
    console.log(chalk.green(`\n✅ Total: ${plugins.length} plugins available`));
  });

program
  .command('validate <config-file>')
  .description('Validate a configuration file against the schema')
  .action(async (configFile) => {
    try {
      const { validator } = await import('../src/config/schema.js');
      const config = JSON.parse(await readFile(configFile, 'utf8'));
      
      const validation = validator.validate(config);
      
      if (validation.isValid) {
        console.log(chalk.green('✅ Configuration is valid'));
      } else {
        console.log(chalk.red('❌ Configuration validation failed:'));
        validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
        process.exit(1);
      }
      
      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error reading or validating config file:', error.message));
      process.exit(1);
    }
  });

program.parse();