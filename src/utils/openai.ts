import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please add OPENAI_API_KEY to your .env.local file');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePedigreeStructure(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a pedigree structure parser. Your job is to convert natural language descriptions of family relationships into a strictly valid JSON object matching this TypeScript interface:

interface PedigreeStructure {
  nodes: Array<{
    id: string;
    gender: 'male' | 'female';
    generation: number;
    position: { x: number; y: number };
  }>;
  relationships: {
    marriages: Array<[string, string]>;
    children: Array<{ 
      parents: [string, string];
      children: string[];
    }>;
  };
}

Rules:
- Output ONLY valid JSON, no markdown, no comments, no extra text.
- All IDs must be unique and descriptive (e.g., 'father', 'mother', 'son1').
- Generation numbers start at 1 (oldest generation).
- Use { x: 0, y: 0 } for all positions (positions will be calculated later).
- If the prompt is ambiguous, ask for clarification in a JSON error object: { "error": "Clarification needed: ..." }
- Do not include any explanations, only the JSON object.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating pedigree structure:', error);
    throw error;
  }
} 