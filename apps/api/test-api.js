// Quick API test script
const axios = require('axios');

async function testAPI() {
  console.log('🔍 Testing API endpoints...');

  try {
    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    const response = await axios.get('http://localhost:4000/ai/providers', {
      timeout: 5000,
    });

    console.log('✅ API is working!');
    console.log('📊 Available providers:');

    response.data.forEach((provider, index) => {
      console.log(
        `  ${index + 1}. ${provider.displayName}: ${provider.models.length} models`,
      );
      provider.models.forEach((model, modelIndex) => {
        console.log(
          `     - ${model.name}${model.description ? ` (${model.description})` : ''}`,
        );
      });
    });

    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ API server is not running on port 4000');
      console.log('💡 Start it with: cd apps/api && pnpm start:dev');
    } else {
      console.log('❌ API Error:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 EDU AI API Test');
  console.log('='.repeat(40));

  const success = await testAPI();

  if (success) {
    console.log('\n✅ Your models should now appear in the frontend!');
    console.log('🌐 Open: http://localhost:3000');
  } else {
    console.log('\n❌ Please start the API server first');
  }
}

main().catch(console.error);

