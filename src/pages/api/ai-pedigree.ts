import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePedigreeStructure } from '@/utils/openai';
import { calculateNodePositions, validatePedigreeStructure } from '@/utils/pedigreeParser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  try {
    const structure = await generatePedigreeStructure(prompt);
    if (!structure || typeof structure !== 'object') {
      return res.status(500).json({ error: 'AI did not return a valid JSON object.' });
    }
    if ('error' in structure) {
      return res.status(400).json({ error: structure.error });
    }
    // Calculate positions
    structure.nodes = calculateNodePositions(structure.nodes);
    // Validate
    if (!validatePedigreeStructure(structure)) {
      return res.status(400).json({ error: 'Generated structure is invalid. Please check your prompt or edit the JSON.' });
    }
    res.status(200).json(structure);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate structure' });
  }
} 