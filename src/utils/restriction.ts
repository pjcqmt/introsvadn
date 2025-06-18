import { cleanSequence } from './dna';

export function countEcoRISites(sequence: string): number {
  const cleanedSequence = cleanSequence(sequence);
  const ecoRISite = 'GAATTC';
  let count = 0;
  let index = cleanedSequence.indexOf(ecoRISite);
  while (index !== -1) {
    count++;
    index = cleanedSequence.indexOf(ecoRISite, index + 1);
  }
  return count;
}

export function estimateEcoRIFragments(sequence: string): number {
  return countEcoRISites(sequence) + 1;
} 