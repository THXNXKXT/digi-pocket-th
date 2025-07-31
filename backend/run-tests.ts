#!/usr/bin/env bun

import { spawn } from 'bun';
import { existsSync } from 'fs';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds per test
  retries: 2,
  parallel: false, // Run tests sequentially for better stability
};

// Test suites
const TEST_SUITES = [
  {
    name: '🔐 Authentication System',
    file: 'tests/auth.comprehensive.test.ts',
    description: 'User registration, login, JWT validation, session management',
  },
  {
    name: '📱 Device Tracking System',
    file: 'tests/device-tracking.comprehensive.test.ts',
    description: 'Device fingerprinting, IP tracking, login patterns, security analysis',
  },
  {
    name: '🛡️ Security System',
    file: 'tests/security.comprehensive.test.ts',
    description: 'Input validation, rate limiting, account security, data protection',
  },
  {
    name: '🛒 E-commerce System',
    file: 'tests/ecommerce.comprehensive.test.ts',
    description: 'Product management, order processing, inventory, validation',
  },
  {
    name: '⚡ Performance Tests',
    file: 'tests/performance.comprehensive.test.ts',
    description: 'Response times, load testing, stress testing, scalability',
  },
];

// Legacy test files
const LEGACY_TESTS = [
  'tests/auth.enhanced.test.ts',
  'tests/auth.simple.test.ts',
  'tests/device-tracking.integration.test.ts',
  'tests/product.test.ts',
  'tests/users.schema.security.test.ts',
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title: string) {
  const border = '='.repeat(60);
  console.log(colorize(border, 'cyan'));
  console.log(colorize(`  ${title}`, 'bright'));
  console.log(colorize(border, 'cyan'));
}

function printSection(title: string) {
  console.log(colorize(`\n📋 ${title}`, 'blue'));
  console.log(colorize('-'.repeat(40), 'blue'));
}

async function runCommand(command: string, args: string[]): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const proc = spawn({
      cmd: [command, ...args],
      stdout: 'pipe',
      stderr: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    proc.stdout?.on('data', (data) => {
      const text = new TextDecoder().decode(data);
      output += text;
      process.stdout.write(text);
    });

    proc.stderr?.on('data', (data) => {
      const text = new TextDecoder().decode(data);
      errorOutput += text;
      process.stderr.write(text);
    });

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output + errorOutput,
      });
    });
  });
}

async function runTestSuite(suite: typeof TEST_SUITES[0]): Promise<boolean> {
  console.log(colorize(`\n🧪 Running: ${suite.name}`, 'yellow'));
  console.log(colorize(`   ${suite.description}`, 'reset'));
  
  if (!existsSync(suite.file)) {
    console.log(colorize(`   ❌ Test file not found: ${suite.file}`, 'red'));
    return false;
  }

  const startTime = Date.now();
  const result = await runCommand('bun', ['test', suite.file]);
  const duration = Date.now() - startTime;

  if (result.success) {
    console.log(colorize(`   ✅ Passed (${duration}ms)`, 'green'));
    return true;
  } else {
    console.log(colorize(`   ❌ Failed (${duration}ms)`, 'red'));
    return false;
  }
}

async function runLegacyTests(): Promise<{ passed: number; total: number }> {
  let passed = 0;
  const total = LEGACY_TESTS.length;

  for (const testFile of LEGACY_TESTS) {
    if (!existsSync(testFile)) {
      console.log(colorize(`   ⚠️  Legacy test not found: ${testFile}`, 'yellow'));
      continue;
    }

    console.log(colorize(`   Running: ${testFile}`, 'reset'));
    const result = await runCommand('bun', ['test', testFile]);
    
    if (result.success) {
      console.log(colorize(`   ✅ ${testFile}`, 'green'));
      passed++;
    } else {
      console.log(colorize(`   ❌ ${testFile}`, 'red'));
    }
  }

  return { passed, total };
}

async function checkPrerequisites(): Promise<boolean> {
  console.log(colorize('🔍 Checking prerequisites...', 'blue'));

  // Check if Docker containers are running
  const dockerCheck = await runCommand('docker-compose', ['ps']);
  if (!dockerCheck.success) {
    console.log(colorize('❌ Docker Compose not available or containers not running', 'red'));
    console.log(colorize('   Please run: docker-compose up -d', 'yellow'));
    return false;
  }

  // Check if API is responding
  try {
    const response = await fetch('http://localhost:3031/health');
    if (!response.ok) {
      console.log(colorize('❌ API server not responding', 'red'));
      return false;
    }
  } catch (error) {
    console.log(colorize('❌ Cannot connect to API server', 'red'));
    console.log(colorize('   Please ensure the backend is running on port 3031', 'yellow'));
    return false;
  }

  console.log(colorize('✅ Prerequisites check passed', 'green'));
  return true;
}

async function generateTestReport(results: { name: string; passed: boolean; duration?: number }[]) {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = (passedTests / totalTests) * 100;

  printSection('Test Results Summary');
  
  console.log(colorize(`📊 Total Test Suites: ${totalTests}`, 'blue'));
  console.log(colorize(`✅ Passed: ${passedTests}`, 'green'));
  console.log(colorize(`❌ Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green'));
  console.log(colorize(`📈 Success Rate: ${successRate.toFixed(1)}%`, successRate >= 80 ? 'green' : 'red'));

  if (failedTests > 0) {
    console.log(colorize('\n❌ Failed Test Suites:', 'red'));
    results.filter(r => !r.passed).forEach(result => {
      console.log(colorize(`   • ${result.name}`, 'red'));
    });
  }

  console.log(colorize('\n✅ Passed Test Suites:', 'green'));
  results.filter(r => r.passed).forEach(result => {
    console.log(colorize(`   • ${result.name}`, 'green'));
  });
}

async function main() {
  const startTime = Date.now();
  
  printHeader('🧪 Digi-Pocket-TH Comprehensive Test Suite');
  
  // Check prerequisites
  const prerequisitesOk = await checkPrerequisites();
  if (!prerequisitesOk) {
    process.exit(1);
  }

  // Run main test suites
  printSection('Main Test Suites');
  const results: { name: string; passed: boolean; duration?: number }[] = [];

  for (const suite of TEST_SUITES) {
    const suiteStartTime = Date.now();
    const passed = await runTestSuite(suite);
    const duration = Date.now() - suiteStartTime;
    
    results.push({
      name: suite.name,
      passed,
      duration,
    });
  }

  // Run legacy tests
  printSection('Legacy Tests');
  const legacyResults = await runLegacyTests();
  console.log(colorize(`\n📊 Legacy Tests: ${legacyResults.passed}/${legacyResults.total} passed`, 
    legacyResults.passed === legacyResults.total ? 'green' : 'yellow'));

  // Generate report
  const totalDuration = Date.now() - startTime;
  await generateTestReport(results);

  console.log(colorize(`\n⏱️  Total Duration: ${totalDuration}ms`, 'blue'));
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    console.log(colorize('\n🎉 All tests passed!', 'green'));
    process.exit(0);
  } else {
    console.log(colorize('\n💥 Some tests failed!', 'red'));
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧪 Digi-Pocket-TH Test Runner

Usage: bun run-tests.ts [options]

Options:
  --help, -h     Show this help message
  --suite <name> Run specific test suite
  --legacy       Run only legacy tests
  --no-prereq    Skip prerequisite checks

Examples:
  bun run-tests.ts                    # Run all tests
  bun run-tests.ts --suite auth       # Run authentication tests
  bun run-tests.ts --legacy           # Run legacy tests only
`);
  process.exit(0);
}

if (args.includes('--legacy')) {
  printHeader('🧪 Legacy Tests Only');
  runLegacyTests().then(results => {
    console.log(colorize(`\n📊 Results: ${results.passed}/${results.total} passed`, 
      results.passed === results.total ? 'green' : 'red'));
    process.exit(results.passed === results.total ? 0 : 1);
  });
} else {
  main().catch(error => {
    console.error(colorize(`💥 Test runner error: ${error.message}`, 'red'));
    process.exit(1);
  });
}
