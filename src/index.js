import inquirer from 'inquirer';
import chalk from 'chalk';
import { getQuestions } from './questions.js';
import { generateMarkdown } from './generator.js';
import { saveProfile, getProfileHome } from './profiles.js';
import fsExtra from 'fs-extra';
import { join } from 'path';
import ora from 'ora';

const { writeFile, ensureDir } = fsExtra;

export async function runWizard() {
  try {
    // Show welcome menu
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🚀 Start new project setup', value: 'new' },
          { name: '📁 Use saved profile', value: 'profile' },
          { name: '⚡ Quick setup (uses last config)', value: 'quick' }
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

    // Get all questions
    const questions = await getQuestions();
    
    // Show progress
    console.log();
    console.log(chalk.cyan('📋 Answer these questions to generate your perfect setup file...'));
    console.log();

    // Ask all questions
    const answers = await inquirer.prompt(questions);
    
    // Generate the markdown
    const spinner = ora('Generating claude-kickstart.md...').start();
    const markdown = await generateMarkdown(answers);
    
    // Write the file
    await writeFile('claude-kickstart.md', markdown);
    spinner.succeed('Generated claude-kickstart.md');
    
    // Save profile if requested
    if (answers.saveProfile) {
      const profileSpinner = ora('Saving profile...').start();
      await saveProfile(answers.profileName, answers);
      profileSpinner.succeed(`Profile saved as "${answers.profileName}"`);
    }
    
    // Success message
    console.log();
    console.log(chalk.green('✅ Success! Created claude-kickstart.md'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  1. ') + 'Open your project in Claude Code');
    console.log(chalk.gray('  2. ') + 'Run: ' + chalk.yellow('claude /init'));
    console.log(chalk.gray('  3. ') + 'Watch Claude set up your project perfectly!');
    console.log();
    console.log(chalk.gray('Pro tip: Reference @claude-kickstart.md anytime for project context'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error:', error.message));
    process.exit(1);
  }
}