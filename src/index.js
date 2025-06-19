import inquirer from 'inquirer';
import chalk from 'chalk';
import { questionGenerator } from './questions.js';
import { generator } from './generator.js';
import { saveProfile, getProfileHome } from './profiles.js';
import { validator } from './config/schema.js';
import fsExtra from 'fs-extra';
import { join } from 'path';
import ora from 'ora';

const { writeFile, ensureDir } = fsExtra;

export async function runWizard() {
  try {
    // Initialize plugins
    console.log(chalk.cyan('🔧 Initializing plugin system...'));
    await import('./plugins/index.js');

    // Show welcome menu
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🚀 Start new project setup', value: 'new' },
          { name: '📁 Use saved profile', value: 'profile' },
          { name: '⚡ Quick setup (uses last config)', value: 'quick' },
          { name: '🔍 Browse available plugins', value: 'plugins' }
        ]
      }
    ]);

    if (action === 'profile') {
      const { loadProfile } = await import('./profiles.js');
      await loadProfile();
      return;
    }

    if (action === 'quick') {
      const { quickSetup } = await import('./profiles.js');
      await quickSetup();
      return;
    }

    if (action === 'plugins') {
      await showPluginBrowser();
      return;
    }

    // Get all questions dynamically
    const questions = await questionGenerator.getAllQuestions();
    
    // Show progress
    console.log();
    console.log(chalk.cyan('📋 Answer these questions to generate your perfect setup file...'));
    console.log(chalk.gray('    The questions adapt based on your choices to minimize setup time'));
    console.log();

    // Ask all questions
    const answers = await inquirer.prompt(questions);
    
    // Validate answers
    const validation = questionGenerator.validateAnswers(answers);
    if (validation.errors.length > 0) {
      console.log(chalk.red('\n❌ Configuration errors:'));
      validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
      return;
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      validation.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
      
      const { continue: shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Continue with these warnings?',
          default: true
        }
      ]);
      
      if (!shouldContinue) return;
    }

    // Validate with schema
    const schemaValidation = validator.validate(answers);
    if (!schemaValidation.isValid) {
      console.log(chalk.red('\n❌ Configuration validation failed:'));
      schemaValidation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
      return;
    }
    
    // Generate the markdown
    const spinner = ora('Generating claude-kickstart.md with plugin system...').start();
    
    try {
      const markdown = await generator.generateMarkdown(answers);
      
      // Write the file
      await writeFile('claude-kickstart.md', markdown);
      spinner.succeed('Generated claude-kickstart.md');
      
      // Save profile if requested
      if (answers.saveProfile) {
        const profileSpinner = ora('Saving profile...').start();
        await saveProfile(answers.profileName, answers);
        profileSpinner.succeed(`Profile saved as "${answers.profileName}"`);
      }
      
      // Show success and statistics
      await showGenerationSuccess(answers);
      
    } catch (error) {
      spinner.fail('Failed to generate file');
      throw error;
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error:', error.message));
    if (process.env.NODE_ENV === 'development') {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

async function showPluginBrowser() {
  const { registry } = await import('./plugins/index.js');
  
  console.log(chalk.cyan('\n🔧 Available Plugins:\n'));
  
  const categories = registry.getAllCategories();
  
  for (const category of categories) {
    const plugins = registry.getByCategory(category);
    console.log(chalk.yellow(`📁 ${category.toUpperCase()}`));
    
    plugins.forEach(({ metadata }) => {
      console.log(chalk.gray(`  ${metadata.icon || '📦'} ${metadata.displayName}`));
      console.log(chalk.gray(`    ${metadata.description || 'No description'}`));
      if (metadata.languages) {
        console.log(chalk.gray(`    Languages: ${metadata.languages.join(', ')}`));
      }
      console.log();
    });
  }
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🚀 Start new project', value: 'new' },
        { name: '🔙 Back to main menu', value: 'back' }
      ]
    }
  ]);
  
  if (action === 'new') {
    // Restart the wizard
    await runWizard();
  }
}

async function showGenerationSuccess(answers) {
  const { registry } = await import('./plugins/index.js');
  
  console.log();
  console.log(chalk.green('✅ Success! Created claude-kickstart.md'));
  console.log();
  
  // Show project summary
  console.log(chalk.cyan('📊 Project Summary:'));
  console.log(chalk.gray(`  Type: ${answers.projectType}`));
  console.log(chalk.gray(`  Stack: ${answers.stack || 'Custom'}`));
  console.log(chalk.gray(`  Language: ${answers.language || 'Not specified'}`));
  
  // Show loaded plugins
  const selectedPlugins = [];
  if (answers.stack && answers.stack !== 'custom') {
    const plugin = registry.get(answers.stack);
    if (plugin) selectedPlugins.push(plugin.metadata.displayName);
  }
  
  if (selectedPlugins.length > 0) {
    console.log(chalk.gray(`  Plugins: ${selectedPlugins.join(', ')}`));
  }
  
  console.log();
  console.log(chalk.cyan('🚀 Next steps:'));
  console.log(chalk.gray('  1. ') + 'Open your project in Claude Code');
  console.log(chalk.gray('  2. ') + 'Run: ' + chalk.yellow('claude /init'));
  console.log(chalk.gray('  3. ') + 'Watch Claude set up your project perfectly!');
  console.log();
  console.log(chalk.cyan('💡 Pro tips:'));
  console.log(chalk.gray('  • ') + 'Reference @claude-kickstart.md anytime for project context');
  console.log(chalk.gray('  • ') + 'Use profile system to quickly recreate similar projects');
  console.log(chalk.gray('  • ') + 'Plugin system ensures your setup is always up-to-date');
  console.log();
}

// Export for testing and module compatibility
export { questionGenerator, generator, validator };