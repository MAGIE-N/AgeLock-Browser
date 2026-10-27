const { execSync } = require('child_process');

try {
    // Install dependencies
    execSync('npm install', { stdio: 'inherit' });
    
    // Rebuild native module
    execSync('electron-rebuild', { stdio: 'inherit' });
    
    console.log('Native module rebuilt successfully');
} catch (error) {
    console.error('Error rebuilding native module:', error);
    process.exit(1);
}
