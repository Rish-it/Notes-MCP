// claude-notes-cli.ts
import axios from 'axios';
import readline from 'readline';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000/process-note-request';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(chalk.blue('NotesY CLI - Apple Notes integration for Claude'));
console.log(chalk.gray('Enter your request in natural language or type "exit" to quit\n'));

function processInput() {
  rl.question(chalk.green('> '), async (text) => {
    if (text.trim().toLowerCase() === 'exit' || text.trim().toLowerCase() === 'quit') {
      rl.close();
      return;
    }

    try {
      const response = await axios.post(API_URL, { text });
      
      if (response.data.success) {
        console.log(chalk.green('\n✓ Success:'));
        console.log(chalk.white(`Action: ${response.data.action}`));
        console.log(chalk.white(`Title: ${response.data.title}`));
        console.log();
      } else {
        console.log(chalk.yellow('\nResponse:'));
        console.log(chalk.white(JSON.stringify(response.data, null, 2)));
        console.log();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\n✗ Error:'), chalk.white(error.message));
      } else if (axios.isAxiosError(error) && error.response) {
        console.error(chalk.red('\n✗ Error:'), chalk.white(JSON.stringify(error.response.data, null, 2)));
      } else {
        console.error(chalk.red('\n✗ Error:'), chalk.white(String(error)));
      }
      console.log();
    }
    
    processInput();
  });
}

processInput();

// Handle exit gracefully
rl.on('close', () => {
  console.log(chalk.blue('\nThanks for using NotesY CLI!'));
  process.exit(0);
});