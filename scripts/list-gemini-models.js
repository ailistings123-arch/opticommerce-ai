/**
 * List Available Gemini Models
 */

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log('🔍 Fetching available Gemini models...\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );

    if (!response.ok) {
      console.error('❌ Error:', response.status, response.statusText);
      const error = await response.json();
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    const data = await response.json();
    
    console.log('✅ Available Models:\n');
    
    data.models.forEach(model => {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });

    console.log('\n💡 Models that support generateContent:');
    const generateContentModels = data.models.filter(m => 
      m.supportedGenerationMethods.includes('generateContent')
    );
    
    generateContentModels.forEach(model => {
      const modelName = model.name.replace('models/', '');
      console.log(`   - ${modelName}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
