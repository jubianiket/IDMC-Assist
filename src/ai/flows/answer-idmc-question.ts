
'use server';

/**
 * @fileOverview Provides an AI agent to answer questions about Informatica IDMC
 * using Google AI (Gemini) models.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskIdmcQuestionInputSchema = z.object({
  question: z.string().describe('The question about Informatica IDMC.'),
  modelId: z.string().describe("The identifier for the Google AI model to use (e.g., 'googleai/gemini-2.0-flash')."),
  apiKey: z.string().optional().describe('Optional API key for Google AI.'),
});
export type AskIdmcQuestionInput = z.infer<typeof AskIdmcQuestionInputSchema>;

const AskIdmcQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type AskIdmcQuestionOutput = z.infer<typeof AskIdmcQuestionOutputSchema>;

export async function askIdmcQuestion(input: AskIdmcQuestionInput): Promise<AskIdmcQuestionOutput> {
  return askIdmcQuestionFlow(input);
}

const basePromptConfig = {
  input: {schema: z.object({ question: z.string() }) },
  output: {schema: AskIdmcQuestionOutputSchema},
  prompt: `You are an AI assistant that helps users learn Informatica IDMC. Answer the following question accurately and concisely:\n\nQuestion: {{{question}}}`,
};

const askIdmcQuestionFlow = ai.defineFlow(
  {
    name: 'askIdmcQuestionFlow',
    inputSchema: AskIdmcQuestionInputSchema,
    outputSchema: AskIdmcQuestionOutputSchema,
  },
  async (input) => {
    const { question, modelId, apiKey } = input;

    if (!modelId) {
        throw new Error('modelId is required.');
    }

    // If a custom API key is provided, use a local instance to apply it
    if (apiKey && modelId.startsWith('googleai/')) {
      const { genkit: localGenkit } = await import('genkit');
      const { googleAI } = await import('@genkit-ai/googleai');
      
      const tempAi = localGenkit({ 
        plugins: [googleAI({ apiKey })], 
        logLevel: 'warn' 
      });
      
      const tempPrompt = tempAi.definePrompt({
          name: 'askIdmcQuestionTempPrompt',
          ...basePromptConfig
      });

      const { output } = await tempPrompt(
          { question },
          { model: modelId }
      );
      return output!;

    } else {
      // Use the global AI instance (uses GEMINI_API_KEY environment variable)
      const globalPrompt = ai.definePrompt({
        name: 'askIdmcQuestionGlobalPrompt', 
        ...basePromptConfig
      });

      const { output } = await globalPrompt(
        { question },
        { model: modelId }
      );
      return output!;
    }
  }
);
