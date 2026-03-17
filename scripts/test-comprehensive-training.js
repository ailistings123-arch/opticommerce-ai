/**
 * COMPREHENSIVE TRAINING TEST
 * Tests all product types across all platforms to verify the 4-step training system
 */

const testProducts = [
  // Beauty Product - Amazon
  {
    name: 'Beauty Product (Amazon)',
    platform: 'amazon',
    mode: 'create',
    productData: {
      title: 'Collagen Niacinamide Jelly Cream',
      description: 'A moisturizing face cream with collagen and niacinamide for hydration and anti-aging.',
      category: 'Beauty & Personal Care',
      price: 24.99,
      specifications: [
        { name: 'Size', value: '50', unit: 'ml' },
        { name: 'Skin Type', value: 'All Skin Types' },
        { name: 'Texture', value: 'Jelly Cream' }
      ]
    }
  },
  
  // Electronics - Amazon
  {
    name: 'Electronics (Amazon)',
    platform: 'amazon',
    mode: 'create',
    productData: {
      title: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with silent click and Bluetooth connectivity',
      category: 'Electronics',
      price: 29.99,
      specifications: [
        { name: 'Connectivity', value: 'Bluetooth 5.0' },
        { name: 'DPI', value: '2400' },
        { name: 'Battery', value: 'Rechargeable' },
        { name: 'Color', value: 'Black' }
      ]
    }
  },
  
  // Digital Product - Etsy
  {
    name: 'Digital Product (Etsy)',
    platform: 'etsy',
    mode: 'create',
    productData: {
      title: 'Wedding Invitation Template',
      description: 'Printable wedding invitation PDF template with rustic floral design',
      category: 'Digital',
      price: 9.99,
      specifications: [
        { name: 'Format', value: 'PDF' },
        { name: 'Size', value: '5x7', unit: 'inches' },
        { name: 'Resolution', value: '300', unit: 'DPI' }
      ]
    }
  },
  
  // Clothing - Shopify
  {
    name: 'Clothing (Shopify)',
    platform: 'shopify',
    mode: 'create',
    productData: {
      title: 'Men Leather Jacket',
      description: 'Black leather jacket for men, cafe racer style',
      category: 'Clothing',
      price: 199.99,
      specifications: [
        { name: 'Material', value: 'Genuine Leather' },
        { name: 'Color', value: 'Black' },
        { name: 'Style', value: 'Cafe Racer' }
      ]
    }
  },
  
  // Home Appliance - Walmart
  {
    name: 'Home Appliance (Walmart)',
    platform: 'walmart',
    mode: 'create',
    productData: {
      title: 'Rice Cooker',
      description: 'Electric rice cooker with steamer basket and keep warm function',
      category: 'Kitchen Appliances',
      price: 49.99,
      specifications: [
        { name: 'Capacity', value: '6', unit: 'cups' },
        { name: 'Features', value: 'Keep Warm Function' },
        { name: 'Material', value: 'Stainless Steel' }
      ]
    }
  },
  
  // Used Item - eBay
  {
    name: 'Used Electronics (eBay)',
    platform: 'ebay',
    mode: 'create',
    productData: {
      title: 'iPhone 13 Pro',
      description: 'Used iPhone 13 Pro in good condition',
      category: 'Cell Phones',
      price: 599.99,
      specifications: [
        { name: 'Condition', value: 'Used - Good' },
        { name: 'Storage', value: '256', unit: 'GB' },
        { name: 'Color', value: 'Graphite' },
        { name: 'Carrier', value: 'Unlocked' }
      ]
    }
  }
];

async function testProduct(product) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🧪 TESTING: ${product.name}`);
  console.log(`${'═'.repeat(80)}`);
  console.log(`Platform: ${product.platform.toUpperCase()}`);
  console.log(`Product: ${product.productData.title}`);
  console.log(`Category: ${product.productData.category}`);
  console.log(`\n📡 Sending request to API...\n`);

  try {
    const response = await fetch('http://localhost:3000/api/generate-listing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ REQUEST FAILED:', data.error);
      if (data.details) console.error('Details:', data.details);
      return { success: false, error: data.error };
    }

    // Analyze results
    const analysis = analyzeResults(data.data, product.platform);
    
    console.log('✅ SUCCESS!\n');
    console.log('─'.repeat(80));
    console.log('📊 ANALYSIS RESULTS');
    console.log('─'.repeat(80));
    
    console.log(`\n✓ Title Length: ${data.data.title.length} chars`);
    console.log(`  Target: ${analysis.titleTarget}`);
    console.log(`  Utilization: ${analysis.titleUtilization}%`);
    console.log(`  Status: ${analysis.titleUtilization >= 90 ? '✅ EXCELLENT' : analysis.titleUtilization >= 80 ? '⚠️  GOOD' : '❌ NEEDS IMPROVEMENT'}`);
    
    console.log(`\n✓ Bullets: ${data.data.bullets.length} bullets`);
    console.log(`  Expected: ${analysis.expectedBullets}`);
    console.log(`  Status: ${data.data.bullets.length === analysis.expectedBullets ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    console.log(`\n✓ Description Length: ${data.data.description.length} chars`);
    console.log(`  Minimum: ${analysis.descriptionMin}`);
    console.log(`  Status: ${data.data.description.length >= analysis.descriptionMin ? '✅ MEETS MINIMUM' : '❌ TOO SHORT'}`);
    
    console.log(`\n✓ Keywords: ${data.data.keywords.length} keywords`);
    console.log(`  Maximum: ${analysis.keywordsMax}`);
    console.log(`  Status: ${data.data.keywords.length <= analysis.keywordsMax ? '✅ WITHIN LIMIT' : '❌ TOO MANY'}`);
    
    // Check for prohibited words
    const prohibitedWords = checkProhibitedWords(data.data);
    if (prohibitedWords.length > 0) {
      console.log(`\n❌ PROHIBITED WORDS FOUND: ${prohibitedWords.join(', ')}`);
    } else {
      console.log(`\n✅ NO PROHIBITED WORDS`);
    }
    
    // Check for generic filler words
    const fillerWords = checkFillerWords(data.data);
    if (fillerWords.length > 0) {
      console.log(`\n⚠️  FILLER WORDS FOUND: ${fillerWords.join(', ')}`);
    } else {
      console.log(`\n✅ NO FILLER WORDS`);
    }
    
    // Check for specific features (not generic)
    const hasSpecificFeatures = checkSpecificFeatures(data.data);
    console.log(`\n${hasSpecificFeatures ? '✅' : '❌'} SPECIFIC FEATURES: ${hasSpecificFeatures ? 'YES' : 'NO'}`);
    
    console.log('\n─'.repeat(80));
    console.log('📝 GENERATED CONTENT');
    console.log('─'.repeat(80));
    
    console.log(`\n📌 TITLE (${data.data.title.length} chars):`);
    console.log(data.data.title);
    
    console.log('\n📌 BULLETS:');
    data.data.bullets.forEach((bullet, i) => {
      console.log(`\n${i + 1}. ${bullet}`);
      console.log(`   (${bullet.length} chars)`);
    });
    
    console.log(`\n📌 DESCRIPTION (${data.data.description.length} chars):`);
    console.log(data.data.description.substring(0, 500) + '...');
    
    console.log('\n📌 KEYWORDS:');
    console.log(data.data.keywords.join(', '));
    
    if (data.data.platform_notes) {
      console.log('\n📌 PLATFORM NOTES:');
      console.log(data.data.platform_notes);
    }

    return { 
      success: true, 
      analysis,
      titleUtilization: analysis.titleUtilization,
      hasProhibitedWords: prohibitedWords.length > 0,
      hasFillerWords: fillerWords.length > 0,
      hasSpecificFeatures
    };

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

function analyzeResults(data, platform) {
  const platformConfig = {
    amazon: { titleMax: 200, titleTarget: '180-200', bullets: 5, descMin: 1000, keywordsMax: 15 },
    etsy: { titleMax: 140, titleTarget: '126-140', bullets: 5, descMin: 400, keywordsMax: 13 },
    shopify: { titleMax: 70, titleTarget: '60-70', bullets: 5, descMin: 300, keywordsMax: 10 },
    woocommerce: { titleMax: 70, titleTarget: '60-70', bullets: 5, descMin: 400, keywordsMax: 12 },
    ebay: { titleMax: 80, titleTarget: '72-80', bullets: 5, descMin: 300, keywordsMax: 10 },
    walmart: { titleMax: 75, titleTarget: '68-75', bullets: 6, descMin: 300, keywordsMax: 10 }
  };
  
  const config = platformConfig[platform] || platformConfig.amazon;
  const titleUtilization = Math.round((data.title.length / config.titleMax) * 100);
  
  return {
    titleTarget: config.titleTarget,
    titleUtilization,
    expectedBullets: config.bullets,
    descriptionMin: config.descMin,
    keywordsMax: config.keywordsMax
  };
}

function checkProhibitedWords(data) {
  const prohibited = [
    'FREE', 'SALE', 'BEST', '#1', 'CHEAP', 'GUARANTEE', 'WINNER',
    'AMAZING', 'INCREDIBLE', 'UNBELIEVABLE', 'PERFECT', 'ULTIMATE',
    'REVOLUTIONARY', 'MIRACLE', 'MAGIC', 'GAME CHANGER', 'MUST HAVE',
    'LIFE CHANGING', 'TRANSFORM YOUR', 'SOLVE YOUR PROBLEM'
  ];
  
  const fullText = `${data.title} ${data.bullets.join(' ')} ${data.description}`.toUpperCase();
  return prohibited.filter(word => fullText.includes(word));
}

function checkFillerWords(data) {
  const fillers = [
    'PREMIUM', 'PROFESSIONAL', 'GRADE', 'QUALITY', 'HIGH-QUALITY',
    'SUPERIOR', 'ADVANCED', 'ENHANCED', 'IMPROVED', 'ELITE',
    'PRO', 'PLUS', 'MAX', 'ULTRA', 'SUPER', 'DELUXE'
  ];
  
  const fullText = `${data.title} ${data.bullets.join(' ')} ${data.description}`.toUpperCase();
  return fillers.filter(word => fullText.includes(word));
}

function checkSpecificFeatures(data) {
  // Check if title and bullets contain specific numbers, measurements, or technical terms
  const fullText = `${data.title} ${data.bullets.join(' ')}`;
  
  // Look for numbers (specs, measurements, etc.)
  const hasNumbers = /\d+/.test(fullText);
  
  // Look for technical terms (DPI, Bluetooth, etc.)
  const hasTechnicalTerms = /bluetooth|wifi|usb|dpi|mah|ghz|rpm|watts|volts|amps/i.test(fullText);
  
  // Look for materials
  const hasMaterials = /steel|leather|cotton|aluminum|plastic|wood|glass|ceramic|silicone/i.test(fullText);
  
  // Look for specific ingredients (for beauty products)
  const hasIngredients = /collagen|niacinamide|hyaluronic|retinol|vitamin|peptide|acid/i.test(fullText);
  
  return hasNumbers || hasTechnicalTerms || hasMaterials || hasIngredients;
}

async function runAllTests() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('🚀 COMPREHENSIVE TRAINING SYSTEM TEST');
  console.log('═'.repeat(80));
  console.log('Testing all product types across all platforms...');
  console.log('This will verify the 4-step training system is working correctly.\n');
  
  const results = [];
  
  for (const product of testProducts) {
    const result = await testProduct(product);
    results.push({ name: product.name, ...result });
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('═'.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  console.log('\n─'.repeat(80));
  console.log('DETAILED RESULTS:');
  console.log('─'.repeat(80));
  
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    if (result.success) {
      console.log(`  ✅ Success`);
      console.log(`  📏 Title Utilization: ${result.titleUtilization}%`);
      console.log(`  🚫 Prohibited Words: ${result.hasProhibitedWords ? '❌ FOUND' : '✅ NONE'}`);
      console.log(`  📝 Filler Words: ${result.hasFillerWords ? '⚠️  FOUND' : '✅ NONE'}`);
      console.log(`  🎯 Specific Features: ${result.hasSpecificFeatures ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
  });
  
  console.log('\n');
  console.log('═'.repeat(80));
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Training system is working correctly!');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.');
  }
  
  console.log('═'.repeat(80));
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
