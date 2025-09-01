# AI Tutor Setup Guide

This guide helps you set up multiple AI providers for your EDU AI tutor system.

## Prerequisites

1. **Ollama** (already installed)
2. **Google AI Studio API Key**
3. **Hugging Face API Key**
4. **Image Generation API Keys** (Splash, Stability AI, OpenAI)

## Setup Instructions

### 1. Ollama Setup

Make sure Ollama is running on `http://localhost:11434`:

```bash
ollama serve
```

List your available models:

```bash
ollama list
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and add your API keys:

```env
# Database
DATABASE_URL="your-database-url"

# JWT
JWT_SECRET="your-jwt-secret"

# AI Services
OLLAMA_URL="http://localhost:11434"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
HUGGINGFACE_API_KEY="your-huggingface-api-key"

# Image Generation APIs
SPLASH_API_KEY="your-splash-api-key"
STABILITY_API_KEY="your-stability-ai-api-key"
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Getting API Keys

#### Google AI Studio

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your .env file

#### Hugging Face

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with read permissions
3. Copy the token to your .env file

#### Stability AI

1. Go to [Stability AI Platform](https://platform.stability.ai/account/keys)
2. Create a new API key
3. Copy the key to your .env file

#### OpenAI (for DALL-E)

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to your .env file

### 4. Testing the Setup

Start both servers:

```bash
# Terminal 1: Backend
cd apps/api
pnpm run start:dev

# Terminal 2: Frontend
cd ../..
pnpm run dev --filter web
```

Go to `http://localhost:3000/tutor` and test:

1. Text chat with different providers
2. Image generation with different services

### 5. Available Models

**Ollama Models** (your local models):

- Check with `ollama list`
- Popular options: llama2, codellama, mistral, etc.

**Google AI Models**:

- gemini-pro
- gemini-pro-vision

**Hugging Face Models**:

- microsoft/DialoGPT-large
- facebook/blenderbot-400M-distill
- gpt2
- distilgpt2

**Image Generation**:

- Stability AI: stable-diffusion-v1-6
- OpenAI: dall-e-2
- Splash: splash-v1

### 6. Troubleshooting

**Ollama not connecting**:

- Make sure Ollama is running: `ollama serve`
- Check the URL in .env: `OLLAMA_URL="http://localhost:11434"`

**API Key errors**:

- Verify API keys are correct
- Check API quotas and billing

**CORS errors**:

- Make sure both frontend and backend servers are running
- Frontend: localhost:3000
- Backend: localhost:4000

### 7. Usage Tips

1. **For studying**: Ask conceptual questions, request explanations
2. **For coding**: Use Ollama with code models like codellama
3. **For visual learning**: Generate diagrams and illustrations
4. **For research**: Use Google AI for comprehensive answers

### 8. Cost Considerations

- **Ollama**: Free (runs locally)
- **Google AI**: Pay per request
- **Hugging Face**: Free tier available
- **Stability AI**: Pay per image generation
- **OpenAI**: Pay per request/image

Start with Ollama and free tiers, then upgrade as needed.
