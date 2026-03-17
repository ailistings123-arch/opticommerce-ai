/**
 * Test Multi-Word Phrase Removal
 * Specifically tests "Solve Your Problem" and similar phrases
 */

const testProduct = {
  platform: 'amazon',
  mode: 'create',
  productData: {
    title: 'Test Product to Solve Your Problem',
    description: 'This product will solve your problem and fix your issues. It is the ultimate solution for all your problems.',
    category: 'Test',
    price: 29.99,
    specifications: [
      { name: 'Feature', value: 'Test Feature' }
    ]
  }
};

async function testPhraseRemoval() {
  console.log('\n🧪 Testing Multi-Word Phrase Removal\n');
  console.log('Input Title:', testProduct.productData.title);
  console.log('Input Description:', testProduct.productData.description);
  console.log('\n📡 Sending request...\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ FAILED:', data.error);
      process.exit(1);
    }

    console.log('✅ SUCCESS!\n');
    console.log('═'.repeat(80));
    console.log('RESULTS');
    console.log('═'.repeat(80));
    
    console.log(`\n📌 TITLE:`);
    console.log(data.data.title);
    
    console.log(`\n📌 DESCRIPTION (first 300 chars):`);
    console.log(data.data.description.substring(0, 300) + '...');
    
    // Check for prohibited phrases
    const prohibitedPhrases = [
      'solve your problem',
      'solve your problems',
      'fix your problem',
      'fix your problems',
      'ultimate solution',
      'the solution',
      'problem solver'
    ];
    
    const titleLower = data.data.title.toLowerCase();
    const descLower = data.data.description.toLowerCase();
    const allText = `${titleLower} ${descLower}`;
    
    const foundPhrases = prohibitedPhrases.filter(phrase => allText.includes(phrase));
    
    console.log('\n' + '═'.repeat(80));
    console.log('PHRASE CHECK');
    console.log('═'.repeat(80));
    
    if (foundPhrases.length > 0) {
      console.log('\n❌ PROHIBITED PHRASES FOUND:');
      foundPhrases.forEach(phrase => console.log(`  - "${phrase}"`));
      console.log('\n⚠️  AUTO-FIX DID NOT WORK PROPERLY');
    } else {
      console.log('\n✅ NO PROHIBITED PHRASES FOUND');
      console.log('✅ AUTO-FIX WORKING CORRECTLY');
    }
    
    console.log('\n' + '═'.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testPhraseRemoval();
