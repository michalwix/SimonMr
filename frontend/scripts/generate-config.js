/**
 * Generate runtime config.js from environment variables
 * This script runs during the build process to inject API URLs
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const apiUrl = process.env.VITE_API_URL || '';
const socketUrl = process.env.VITE_SOCKET_URL || apiUrl;

const configContent = `// Runtime API Configuration
// Auto-generated at build time from environment variables

window.__API_CONFIG__ = {
  apiUrl: ${apiUrl ? `'${apiUrl}'` : 'undefined'},
  socketUrl: ${socketUrl ? `'${socketUrl}'` : 'undefined'},
};
`;

const outputPath = join(process.cwd(), 'public', 'config.js');
writeFileSync(outputPath, configContent, 'utf-8');

console.log('✅ Generated config.js');
if (apiUrl) {
  console.log(`   API URL: ${apiUrl}`);
  console.log(`   Socket URL: ${socketUrl}`);
} else {
  console.log('   ⚠️  No VITE_API_URL set - using defaults');
}
