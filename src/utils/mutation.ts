import { calculateProteinLength } from './dna';

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