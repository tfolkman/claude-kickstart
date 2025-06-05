import { homedir } from 'os';
import { join } from 'path';
import fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generateMarkdown } from './generator.js';
import { writeFile } from 'fs/promises';

const { ensureDir, readJson, writeJson, pathExists, readdir } = fsExtra;

const PROFILE_DIR = join(homedir(), '.claude-kickstart', 'profiles');
const LAST_CONFIG_FILE = join(homedir(), '.claude-kickstart', 'last-config.json');

export async function getProfileHome() {
  await ensureDir(PROFILE_DIR);
  return PROFILE_DIR;
}

export async function saveProfile(name, config) {
  try {
    await ensureDir(PROFILE_DIR);
    const profilePath = join(PROFILE_DIR, `${name}.json`);
    await writeJson(profilePath, config, { spaces: 2 });
    
    // Also save as last config
    await ensureDir(join(homedir(), '.claude-kickstart'));
    await writeJson(LAST_CONFIG_FILE, config, { spaces: 2 });
    
    return profilePath;
  } catch (error) {
    console.error(chalk.red('Error saving profile:', error.message));
    throw error;
  }
}

export async function loadProfile(profileName) {
  try {
    await ensureDir(PROFILE_DIR);
    
    if (!profileName) {
      // Show profile selection menu
      const profiles = await listProfiles();
      
      if (profiles.length === 0) {
        console.log(chalk.yellow('No saved profiles found.'));
        console.log(chalk.gray('Create one by running claude-kickstart without options.'));
        process.exit(0);
      }
      
      const { selectedProfile } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedProfile',
          message: 'Select a profile:',
          choices: profiles
        }
      ]);
      
      profileName = selectedProfile;
    }
    
    const profilePath = join(PROFILE_DIR, `${profileName}.json`);
    
    if (!(await pathExists(profilePath))) {
      console.error(chalk.red(`Profile "${profileName}" not found.`));
      const profiles = await listProfiles();
      if (profiles.length > 0) {
        console.log(chalk.gray('Available profiles:', profiles.join(', ')));
      }
      process.exit(1);
    }
    
    const config = await readJson(profilePath);
    
    console.log(chalk.green(`✓ Loaded profile: ${profileName}`));
    console.log();
    
    // Generate and write the markdown
    const markdown = await generateMarkdown(config);
    await writeFile('claude-kickstart.md', markdown);
    
    console.log(chalk.green('✅ Success! Created claude-kickstart.md'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  1. ') + 'Open your project in Claude Code');
    console.log(chalk.gray('  2. ') + 'Run: ' + chalk.yellow('claude /init'));
    console.log(chalk.gray('  3. ') + 'Watch Claude set up your project perfectly!');
    
  } catch (error) {
    console.error(chalk.red('Error loading profile:', error.message));
    process.exit(1);
  }
}

export async function quickSetup() {
  try {
    if (!(await pathExists(LAST_CONFIG_FILE))) {
      console.log(chalk.yellow('No previous configuration found.'));
      console.log(chalk.gray('Run claude-kickstart without options to create one.'));
      process.exit(0);
    }
    
    const config = await readJson(LAST_CONFIG_FILE);
    
    console.log(chalk.green('✓ Using last configuration'));
    console.log();
    
    // Generate and write the markdown
    const markdown = await generateMarkdown(config);
    await writeFile('claude-kickstart.md', markdown);
    
    console.log(chalk.green('✅ Success! Created claude-kickstart.md'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  1. ') + 'Open your project in Claude Code');
    console.log(chalk.gray('  2. ') + 'Run: ' + chalk.yellow('claude /init'));
    console.log(chalk.gray('  3. ') + 'Watch Claude set up your project perfectly!');
    
  } catch (error) {
    console.error(chalk.red('Error in quick setup:', error.message));
    process.exit(1);
  }
}

export async function listProfiles() {
  try {
    await ensureDir(PROFILE_DIR);
    const files = await readdir(PROFILE_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    return [];
  }
}