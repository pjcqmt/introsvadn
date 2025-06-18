import { calculateProteinLength, cleanSequence } from './dna';

export interface Mutation {
  position: number;
  original: string;
  replacement: string;
}

export function validateMutation(sequence: string, mutation: Mutation): boolean {
  const cleanedSequence = cleanSequence(sequence);
  
  // Check if position is valid
  if (mutation.position < 1 || mutation.position > cleanedSequence.length) {
    console.log('Invalid position:', mutation.position, 'sequence length:', cleanedSequence.length);
    return false;
  }
  
  // Check if original base matches sequence (case-insensitive)
  const actualBase = cleanedSequence.charAt(mutation.position - 1);
  const originalBase = mutation.original.toUpperCase();
  if (actualBase !== originalBase) {
    console.log('Base mismatch:', actualBase, 'vs', originalBase, 'at position', mutation.position);
    return false;
  }
  
  // Check if replacement is a valid base
  if (!/^[ATCG]$/i.test(mutation.replacement)) {
    console.log('Invalid replacement base:', mutation.replacement);
    return false;
  }
  
  return true;
}

export function applyMutation(sequence: string, mutation: Mutation): string {
  const cleanedSequence = cleanSequence(sequence);
  
  if (!validateMutation(cleanedSequence, mutation)) {
    throw new Error('Invalid mutation');
  }
  
  const before = cleanedSequence.substring(0, mutation.position - 1);
  const after = cleanedSequence.substring(mutation.position);
  return before + mutation.replacement.toUpperCase() + after;
}

export function analyzeMutation(sequence: string, mutation: Mutation): {
  isValid: boolean;
  mutatedSequence?: string;
  originalProteinLength?: number;
  mutatedProteinLength?: number;
  effect?: 'no effect' | 'changed protein length' | 'invalid mutation';
  error?: string;
} {
  try {
    const cleanedSequence = cleanSequence(sequence);
    
    if (!validateMutation(cleanedSequence, mutation)) {
      return {
        isValid: false,
        effect: 'invalid mutation',
        error: `Invalid mutation at position ${mutation.position}. Expected ${mutation.original.toUpperCase()} but found ${cleanedSequence.charAt(mutation.position - 1)}`
      };
    }

    const mutatedSequence = applyMutation(cleanedSequence, mutation);
    const originalLength = calculateProteinLength(cleanedSequence);
    const mutatedLength = calculateProteinLength(mutatedSequence);

    return {
      isValid: true,
      mutatedSequence,
      originalProteinLength: originalLength,
      mutatedProteinLength: mutatedLength,
      effect: originalLength === mutatedLength ? 'no effect' : 'changed protein length'
    };
  } catch (error) {
    return {
      isValid: false,
      effect: 'invalid mutation',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function applyPointMutation(sequence: string, position: number, newBase: string): string {
  if (position < 0 || position >= sequence.length) return sequence;
  return sequence.substring(0, position) + newBase + sequence.substring(position + 1);
}

export function applyInsertion(sequence: string, position: number, insertedBase: string): string {
  if (position < 0 || position > sequence.length) return sequence;
  return sequence.substring(0, position) + insertedBase + sequence.substring(position);
}

export function applyDeletion(sequence: string, position: number): string {
  if (position < 0 || position >= sequence.length) return sequence;
  return sequence.substring(0, position) + sequence.substring(position + 1);
}

export function calculateMutationEffect(originalSequence: string, mutation: { type: 'point' | 'insertion' | 'deletion', position: number, newBase?: string }): number {
  let mutatedSequence = originalSequence;
  switch (mutation.type) {
    case 'point':
      if (mutation.newBase) {
        mutatedSequence = applyPointMutation(originalSequence, mutation.position, mutation.newBase);
      }
      break;
    case 'insertion':
      if (mutation.newBase) {
        mutatedSequence = applyInsertion(originalSequence, mutation.position, mutation.newBase);
      }
      break;
    case 'deletion':
      mutatedSequence = applyDeletion(originalSequence, mutation.position);
      break;
  }
  return calculateProteinLength(mutatedSequence);
} 