// Complete setup and testing script for EDU AI models
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Your provided API key
const GOOGLE_AI_KEY = 'AIzaSyBmffnjO0VAkPSDyZk0WRj8iFFxHtq7BAE';

async function createEnvFile() {
  console.log('🔧 Creating .env file...');

  const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/edu_ai?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# AI Service API Keys
OLLAMA_URL="http://localhost:11434"
GOOGLE_AI_API_KEY="${GOOGLE_AI_KEY}"
HUGGINGFACE_API_KEY=""
ANTHROPIC_API_KEY=""
DEEPSEEK_API_KEY=""

# Image Generation API Keys
SPLASH_API_KEY=""
STABILITY_API_KEY=""
OPENAI_API_KEY=""

# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN="http://localhost:3000"`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created with Google AI key');
  } catch (error) {
    console.log('❌ Could not create .env file:', error.message);
  }
}

async function testOllamaModels() {
  console.log('🔍 Testing Ollama Models...');
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    const models = response.data.models || [];

    console.log(`✅ Found ${models.length} Ollama models:`);
    models.forEach((model, index) => {
      const size = (model.size / 1024 / 1024 / 1024).toFixed(1);
      console.log(`  ${index + 1}. ${model.name} (${size} GB)`);
    });

    return models;
  } catch (error) {
    console.log('❌ Ollama not available:', error.message);
    console.log('   Make sure to run: ollama serve');
    return [];
  }
}

async function testGoogleAI() {
  console.log('🔍 Testing Google AI / Gemini...');

  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-vision',
  ];

  const workingModels = [];

  for (const model of models) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_KEY}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Say hello in one word' }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        },
        { timeout: 10000 },
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        console.log(`  ✅ ${model} - Working (response: "${content.trim()}")`);
        workingModels.push({
          name: model,
          description: `Google Gemini ${model}`,
        });
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (status === 404) {
        console.log(`  ❓ ${model} - Not available`);
      } else if (status === 403) {
        console.log(`  ❌ ${model} - API key issue: ${message}`);
      } else {
        console.log(`  ❌ ${model} - Error: ${message}`);
      }
    }
  }

  return workingModels;
}

async function testHuggingFace() {
  console.log('🔍 Testing HuggingFace Models...');

  const models = [
    'mistralai/Mistral-7B-Instruct-v0.1',
    'HuggingFaceH4/zephyr-7b-beta',
  ];

  console.log('⚠️  HuggingFace requires API key to be configured');
  console.log('   Get one from: https://huggingface.co/settings/tokens');
  console.log(
    '   Add it to your .env file: HUGGINGFACE_API_KEY="your_token_here"',
  );

  models.forEach((model, index) => {
    console.log(`  ${index + 1}. ${model} - Ready (needs API key)`);
  });

  return models.map((name) => ({ name, description: 'HuggingFace model' }));
}

async function simulateAPIResponse(ollamaModels, geminiModels, hfModels) {
  console.log('📡 Expected /ai/providers Response:');

  const providers = [];

  // Ollama provider
  if (ollamaModels.length > 0) {
    providers.push({
      name: 'ollama',
      displayName: 'Ollama (Local)',
      models: ollamaModels.map((m) => ({ name: m.name })),
      type: 'text',
    });
  }

  // Google AI provider
  if (geminiModels.length > 0) {
    providers.push({
      name: 'google',
      displayName: 'Google AI',
      models: geminiModels,
      type: 'text',
    });
  }

  // HuggingFace provider
  providers.push({
    name: 'huggingface',
    displayName: 'Hugging Face',
    models: hfModels,
    type: 'text',
  });

  console.log(JSON.stringify(providers, null, 2));

  return providers;
}

async function testAPIEndpoint() {
  console.log('🚀 Testing API Server...');

  try {
    const response = await axios.get('http://localhost:4000/ai/providers', {
      timeout: 5000,
    });
    console.log('✅ API Server is running');
    console.log('✅ Providers endpoint working');

    const providers = response.data;
    console.log(`Found ${providers.length} providers:`);

    providers.forEach((provider) => {
      console.log(
        `  - ${provider.displayName}: ${provider.models.length} models`,
      );
    });

    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ API Server not running');
      console.log('   Start it with: cd apps/api && pnpm start:dev');
    } else {
      console.log('❌ API Error:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 EDU AI Complete Setup & Test');
  console.log('='.repeat(60));

  // Step 1: Create environment file
  await createEnvFile();
  console.log();

  // Step 2: Test all model types
  const ollamaModels = await testOllamaModels();
  console.log();

  const geminiModels = await testGoogleAI();
  console.log();

  const hfModels = await testHuggingFace();
  console.log();

  // Step 3: Show expected API structure
  console.log('='.repeat(60));
  await simulateAPIResponse(ollamaModels, geminiModels, hfModels);
  console.log();

  // Step 4: Test live API if running
  console.log('='.repeat(60));
  const apiWorking = await testAPIEndpoint();
  console.log();

  // Step 5: Summary and next steps
  console.log('='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`✅ Ollama models: ${ollamaModels.length} found`);
  console.log(`✅ Google AI models: ${geminiModels.length} working`);
  console.log(`⚠️  HuggingFace models: 2 configured (need API key)`);
  console.log(
    `${apiWorking ? '✅' : '❌'} API Server: ${apiWorking ? 'Running' : 'Not running'}`,
  );

  console.log('\\n🎯 NEXT STEPS:');
  console.log('1. Add HuggingFace API key to .env file (optional)');

  if (!apiWorking) {
    console.log('2. Start API server: cd apps/api && pnpm start:dev');
  }

  console.log(
    `${apiWorking ? '2' : '3'}. Test your frontend at http://localhost:3000`,
  );
  console.log(
    `${apiWorking ? '3' : '4'}. All ${ollamaModels.length + geminiModels.length + (hfModels ? 2 : 0)} models should appear in your AI interface!`,
  );
}

main().catch(console.error);
