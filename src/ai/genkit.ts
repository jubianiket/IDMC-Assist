import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// Removed OpenAI import as it's causing installation issues
// import {openAI} from '@genkit-ai/openai';

export const ai = genkit({
  plugins: [
    googleAI(), // Assumes GOOGLE_API_KEY is in .env or similar for fallback
    // openAI()    // Assumes OPENAI_API_KEY is in .env or similar for fallback // Temporarily removed
  ],
  model: 'googleai/gemini-2.0-flash', // Default model if not overridden by selection
});
