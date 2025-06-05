import chalk from 'chalk';

export function formatError(message) {
  return chalk.red(`❌ Error: ${message}`);
}

export function formatSuccess(message) {
  return chalk.green(`✅ ${message}`);
}

export function formatWarning(message) {
  return chalk.yellow(`⚠️  ${message}`);
}

export function formatInfo(message) {
  return chalk.blue(`ℹ️  ${message}`);
}

export function printDivider() {
  console.log(chalk.gray('─'.repeat(50)));
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}