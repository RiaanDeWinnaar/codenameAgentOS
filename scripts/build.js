#!/usr/bin/env node
/* eslint-disable no-console */

const { spawn } = require('child_process');
const fs = require('fs');

/**
 * Build script for YOLO-Browser
 * Handles the complete build process for development and production
 */

const args = process.argv.slice(2);
const isProduction =
  args.includes('--production') || process.env.NODE_ENV === 'production';
const shouldClean = args.includes('--clean');
const shouldPackage = args.includes('--package');
const shouldMake = args.includes('--make');

console.log(
  `🔨 Building YOLO-Browser in ${isProduction ? 'production' : 'development'} mode...`
);

// Helper function to run commands
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

async function build() {
  try {
    // Set environment variable
    if (isProduction) {
      process.env.NODE_ENV = 'production';
    }

    // Clean dist directory if requested
    if (shouldClean) {
      console.log('🧹 Cleaning dist directory...');
      await runCommand('npm', ['run', 'clean']);
    }

    // Type check first
    console.log('🔍 Type checking...');
    await runCommand('npm', ['run', 'type-check']);

    // Lint the code
    console.log('🔍 Linting...');
    await runCommand('npm', ['run', 'lint']);

    // Build all targets
    console.log('🏗️  Building main process...');
    await runCommand('npm', ['run', 'build:main']);

    console.log('🏗️  Building preload script...');
    await runCommand('npm', ['run', 'build:preload']);

    console.log('🏗️  Building renderer...');
    await runCommand('npm', ['run', 'build:renderer']);

    // Check that all build outputs exist
    const buildOutputs = [
      'dist/main/main.js',
      'dist/preload/preload.js',
      'dist/renderer/renderer.js',
      'dist/renderer/index.html',
    ];

    for (const output of buildOutputs) {
      if (!fs.existsSync(output)) {
        throw new Error(`Build output missing: ${output}`);
      }
    }

    console.log('✅ All build outputs created successfully');

    // Package if requested
    if (shouldPackage) {
      console.log('📦 Packaging application...');
      await runCommand('npm', ['run', 'package']);
    }

    // Make distributable if requested
    if (shouldMake) {
      console.log('📦 Creating distributables...');
      await runCommand('npm', ['run', 'make']);
    }

    console.log('🎉 Build completed successfully!');

    // Show next steps
    console.log('\n📋 Next steps:');
    if (!shouldPackage && !shouldMake) {
      console.log('   npm start          - Start the application');
      console.log('   npm run package    - Package for distribution');
      console.log('   npm run make       - Create installers');
    }
    console.log('   npm run dev        - Start development server');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Help text
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔨 YOLO-Browser Build Script

Usage: node scripts/build.js [options]

Options:
  --production     Build for production (optimized)
  --clean          Clean dist directory before building
  --package        Package the application after building
  --make           Create distributables after building
  --help, -h       Show this help message

Examples:
  node scripts/build.js                    # Development build
  node scripts/build.js --production       # Production build
  node scripts/build.js --clean --make     # Clean, build, and create distributables
  `);
  process.exit(0);
}

// Run the build
build();
