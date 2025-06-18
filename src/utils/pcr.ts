import { cleanSequence } from './dna';

export function calculateMinimalPrimerLength(sequence: string): number {
  // Minimal primer length is typically 20 nucleotides
  return 20;
}

export function designPrimers(sequence: string): { forward: string; reverse: string } {
  const cleanedSequence = cleanSequence(sequence);
  const minimalLength = calculateMinimalPrimerLength(cleanedSequence);
  
  // Get forward primer from start of sequence
  const forwardPrimer = cleanedSequence.substring(0, minimalLength);
  
  // Get reverse primer from end of sequence and reverse complement it
  const reverseSequence = cleanedSequence.substring(cleanedSequence.length - minimalLength);
  const reversePrimer = getReverseComplement(reverseSequence);
  
  return {
    forward: `5'${forwardPrimer}3'`,
    reverse: `5'${reversePrimer}3'`
  };
}

function getReverseComplement(sequence: string): string {
  const complement: Record<string, string> = {
    'A': 'T',
    'T': 'A',
    'C': 'G',
    'G': 'C'
  };
  
  return sequence
    .split('')
    .reverse()
    .map(base => complement[base])
    .join('');
} 