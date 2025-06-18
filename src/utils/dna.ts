export function cleanSequence(sequence: string): string {
  // Remove spaces and convert to uppercase
  return sequence.replace(/\s+/g, '').toUpperCase();
}

export function validateDNA(sequence: string): boolean {
  const cleanedSequence = cleanSequence(sequence);
  return /^[ATCG]+$/.test(cleanedSequence);
}

export function findFirstATG(sequence: string): number {
  const cleanedSequence = cleanSequence(sequence);
  return cleanedSequence.indexOf('ATG');
}

export function translateDNA(sequence: string): string {
  const cleanedSequence = cleanSequence(sequence);
  const geneticCode: Record<string, string> = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
  };

  let protein = '';
  for (let i = 0; i < cleanedSequence.length; i += 3) {
    const codon = cleanedSequence.substring(i, i + 3);
    if (codon.length === 3) {
      protein += geneticCode[codon] || '?';
    }
  }
  return protein;
}

export function calculateProteinLength(sequence: string): number {
  const cleanedSequence = cleanSequence(sequence);
  const startIndex = findFirstATG(cleanedSequence);
  if (startIndex === -1) return 0;
  const codingSequence = cleanedSequence.substring(startIndex);
  const protein = translateDNA(codingSequence);
  const stopIndex = protein.indexOf('*');
  return stopIndex === -1 ? protein.length : stopIndex;
}

export function formatSequenceWithNumbers(sequence: string): string {
  const cleanedSequence = cleanSequence(sequence);
  const chunks: string[] = [];
  const chunkSize = 10;
  
  // Split sequence into chunks of 10
  for (let i = 0; i < cleanedSequence.length; i += chunkSize) {
    chunks.push(cleanedSequence.slice(i, i + chunkSize));
  }
  
  // Format each line with chunk and position number
  return chunks
    .map((chunk, index) => {
      const position = (index * chunkSize + 1).toString().padStart(3, ' ');
      return `${position} ${chunk}`;
    })
    .join('\n');
} 