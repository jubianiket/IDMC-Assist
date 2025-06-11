import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from '@genkit-ai/openai'; // OpenAI plugin removed temporarily

export const ai = genkit({
  plugins: [
    googleAI(), // Assumes GOOGLE_API_KEY is in .env or similar for fallback
    // openAI()    // OpenAI plugin removed temporarily. Assumes OPENAI_API_KEY is in .env or similar for fallback
  ],
  model: 'googleai/gemini-2.0-flash', // Default model if not overridden by selection
});
