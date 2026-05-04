import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(name, dir, command, args) {
  console.log(`[${name}] Starting...`);
  const child = spawn(command, args, { 
    cwd: path.join(__dirname, dir), 
    shell: true,
    stdio: 'inherit' 
  });
  
  child.on('error', (err) => {
    console.error(`[${name}] Error:`, err);
  });
  
  return child;
}

console.log('🗳️  Indian Voting Commission - Starting Services...');

// Run backend and frontend concurrently
const backend = run('Backend', 'backend', 'npm', ['install', '&&', 'npm', 'run', 'dev']);
const frontend = run('Frontend', 'frontend', 'npm', ['install', '&&', 'npm', 'run', 'dev']);

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
