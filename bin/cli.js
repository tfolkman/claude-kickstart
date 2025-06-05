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
  .description('Generate perfect Claude Code setup files')
  .option('-p, --profile <name>', 'Use saved profile')
  .option('-q, --quick', 'Use last configuration')
  .action(async (options) => {
    console.clear();
    console.log(chalk.blue('🚀 Claude Kickstart v' + pkg.version));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    
    if (options.profile) {
      await loadProfile(options.profile);
    } else if (options.quick) {
      await quickSetup();
    } else {
      await runWizard();
    }
  });

program.parse();