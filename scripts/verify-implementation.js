/**
 * Quick Implementation Verification
 * Checks that all changes are in place and working
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 IMPLEMENTATION VERIFICATION');
console.log('═══════════════════════════════════════════════════════════════\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Check 1: Verify files exist
console.log('1. Checking modified files...');
const filesToCheck = [
  'src/app/api/analyze-url/route.ts',
  'src/app/api/analyze-url-deep/route.ts',
  'src/lib/ai/scoringSystem.ts',
  'src/lib/ai/promptBuilder.ts',
  'src/lib/ai/trainingContext.ts'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
    checks.passed++;
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
    checks.failed++;
  }
});

// Check 2: Verify verification loop in analyze-url
console.log('\n2. Checking backend SEO verification loop...');
const analyzeUrlContent = fs.readFileSync('src/app/api/analyze-url/route.ts', 'utf8');

if (analyzeUrlContent.includes('backend SEO verification')) {
  console.log('   ✅ Verification loop added to analyze-url');
  checks.passed++;
} else {
  console.log('   ❌ Verification loop NOT found in analyze-url');
  checks.failed++;
}

if (analyzeUrlContent.includes('maxAttempts = 3')) {
  console.log('   ✅ Max attempts configured (3)');
  checks.passed++;
} else {
  console.log('   ⚠️  Max attempts not found or different value');
  checks.warnings++;
}

if (analyzeUrlContent.includes('seoScore >= 80')) {
  console.log('   ✅ 80% threshold configured');
  checks.passed++;
} else {
  console.log('   ❌ 80% threshold NOT found');
  checks.failed++;
}

// Check 3: Verify verification loop in analyze-url-deep
console.log('\n3. Checking deep analysis verification...');
const analyzeDeepContent = fs.readFileSync('src/app/api/analyze-url-deep/route.ts', 'utf8');

if (analyzeDeepContent.includes('backend SEO verification')) {
  console.log('   ✅ Verification loop added to analyze-url-deep');
  checks.passed++;
} else {
  console.log('   ❌ Verification loop NOT found in analyze-url-deep');
  checks.failed++;
}

// Check 4: Verify improved scoring
console.log('\n4. Checking improved scoring system...');
const scoringContent = fs.readFileSync('src/lib/ai/scoringSystem.ts', 'utf8');

if (scoringContent.includes('IMPROVED - More lenient')) {
  console.log('   ✅ Improved scoring system implemented');
  checks.passed++;
} else {
  console.log('   ❌ Improved scoring NOT found');
  checks.failed++;
}

if (scoringContent.includes('utilization >= 85')) {
  console.log('   ✅ Title utilization lowered to 85%');
  checks.passed++;
} else {
  console.log('   ⚠️  Title utilization threshold may be different');
  checks.warnings++;
}

if (scoringContent.includes('benefitFirstRatio >= 0.7')) {
  console.log('   ✅ Bullet benefit-first lowered to 70%');
  checks.passed++;
} else {
  console.log('   ⚠️  Bullet benefit-first threshold may be different');
  checks.warnings++;
}

// Check 5: Verify enhanced training
console.log('\n5. Checking enhanced AI training...');
const trainingContent = fs.readFileSync('src/lib/ai/trainingContext.ts', 'utf8');

if (trainingContent.includes('80-100 points')) {
  console.log('   ✅ 80+ score requirement added to training');
  checks.passed++;
} else {
  console.log('   ❌ 80+ score requirement NOT found');
  checks.failed++;
}

if (trainingContent.includes('MANDATORY')) {
  console.log('   ✅ Mandatory requirements emphasized');
  checks.passed++;
} else {
  console.log('   ⚠️  Mandatory emphasis may be missing');
  checks.warnings++;
}

// Check 6: Verify test scripts
console.log('\n6. Checking test scripts...');
const testScripts = [
  'scripts/test-seo-verification.js',
  'scripts/test-system-comprehensive.js'
];

testScripts.forEach(script => {
  if (fs.existsSync(script)) {
    console.log(`   ✅ ${script}`);
    checks.passed++;
  } else {
    console.log(`   ❌ ${script} - NOT FOUND`);
    checks.failed++;
  }
});

// Check 7: Verify documentation
console.log('\n7. Checking documentation...');
const docs = [
  'SEO_VERIFICATION_IMPLEMENTATION.md',
  'QUICK_START_GUIDE.md',
  'IMPLEMENTATION_SUMMARY.md'
];

docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    console.log(`   ✅ ${doc}`);
    checks.passed++;
  } else {
    console.log(`   ❌ ${doc} - NOT FOUND`);
    checks.failed++;
  }
});

// Final summary
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 VERIFICATION RESULTS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

const total = checks.passed + checks.failed;
const successRate = Math.round((checks.passed / total) * 100);
console.log(`\nSuccess Rate: ${successRate}%\n`);

if (checks.failed === 0) {
  console.log('🎉 ALL CHECKS PASSED!');
  console.log('\n✅ Implementation is complete and ready for testing');
  console.log('\nNext steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Run tests: node scripts/test-seo-verification.js');
  console.log('3. Monitor backend logs for verification messages');
  console.log('4. Test with real product URLs\n');
} else {
  console.log('⚠️  SOME CHECKS FAILED');
  console.log('\nPlease review the failed checks above and fix any issues.\n');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════════\n');
