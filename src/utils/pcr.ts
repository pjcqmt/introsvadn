import { cleanSequence } from './dna';

export interface PrimerDesignStep {
  step: number;
  title: string;
  description: string;
  result?: string;
  sequence?: string;
  details?: string[];
}

export interface PrimerAnalysis {
  length: number;
  gcContent: number;
  meltingTemp: number;
  sequence: string;
  position: { start: number; end: number };
}

export interface DetailedPrimerResult {
  forward: PrimerAnalysis;
  reverse: PrimerAnalysis;
  steps: PrimerDesignStep[];
  amplificationLength: number;
  recommendations: string[];
}

export function calculateGCContent(sequence: string): number {
  const gcCount = (sequence.match(/[GC]/g) || []).length;
  return (gcCount / sequence.length) * 100;
}

export function calculateMeltingTemp(sequence: string): number {
  // Simplified Tm calculation: Tm = 64.9 + 41 * (G+C-16.4)/N
  const gcContent = calculateGCContent(sequence);
  const length = sequence.length;
  
  if (length < 14) {
    // For short primers: Tm = (A+T) * 2 + (G+C) * 4
    const atCount = (sequence.match(/[AT]/g) || []).length;
    const gcCount = (sequence.match(/[GC]/g) || []).length;
    return atCount * 2 + gcCount * 4;
  } else {
    // For longer primers: Tm = 64.9 + 41 * (G+C-16.4)/N
    return 64.9 + 41 * (gcContent - 16.4) / length;
  }
}

export function findOptimalPrimerLength(sequence: string, startPos: number, targetTm: number = 60): number {
  let bestLength = 20;
  let bestTmDiff = Infinity;
  
  for (let length = 18; length <= 25; length++) {
    if (startPos + length > sequence.length) break;
    
    const primerSeq = sequence.substring(startPos, startPos + length);
    const tm = calculateMeltingTemp(primerSeq);
    const tmDiff = Math.abs(tm - targetTm);
    
    if (tmDiff < bestTmDiff) {
      bestTmDiff = tmDiff;
      bestLength = length;
    }
  }
  
  return bestLength;
}

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

export function designPrimersDetailed(sequence: string): DetailedPrimerResult {
  const cleanedSequence = cleanSequence(sequence);
  const steps: PrimerDesignStep[] = [];
  
  // Step 1: Sequence preparation
  steps.push({
    step: 1,
    title: "Préparation de la séquence",
    description: "Nettoyage et validation de la séquence d'entrée",
    sequence: cleanedSequence,
    details: [
      `Séquence originale: ${sequence.length} nucléotides`,
      `Séquence nettoyée: ${cleanedSequence.length} nucléotides`,
      "Suppression des espaces et caractères non-ADN"
    ]
  });
  
  // Step 2: Target region selection
  const amplificationStart = Math.floor(cleanedSequence.length * 0.1);
  const amplificationEnd = Math.floor(cleanedSequence.length * 0.9);
  const amplificationLength = amplificationEnd - amplificationStart;
  
  steps.push({
    step: 2,
    title: "Sélection de la région à amplifier",
    description: "Définition de la région cible pour l'amplification PCR",
    details: [
      `Position de début: ${amplificationStart + 1}`,
      `Position de fin: ${amplificationEnd + 1}`,
      `Longueur d'amplification: ${amplificationLength} pb`,
      "Marges de 10% aux extrémités pour éviter les effets de bord"
    ]
  });
  
  // Step 3: Forward primer design
  const forwardLength = findOptimalPrimerLength(cleanedSequence, amplificationStart);
  const forwardSequence = cleanedSequence.substring(amplificationStart, amplificationStart + forwardLength);
  const forwardGC = calculateGCContent(forwardSequence);
  const forwardTm = calculateMeltingTemp(forwardSequence);
  
  steps.push({
    step: 3,
    title: "Conception de l'amorce sens (forward)",
    description: "Sélection et analyse de l'amorce 5' → 3'",
    sequence: forwardSequence,
    result: `5'-${forwardSequence}-3'`,
    details: [
      `Position: ${amplificationStart + 1} à ${amplificationStart + forwardLength}`,
      `Longueur: ${forwardLength} nucléotides`,
      `Contenu GC: ${forwardGC.toFixed(1)}%`,
      `Température de fusion (Tm): ${forwardTm.toFixed(1)}°C`
    ]
  });
  
  // Step 4: Reverse primer design
  const reverseStart = amplificationEnd - 20;
  const reverseLength = findOptimalPrimerLength(cleanedSequence, reverseStart);
  const reverseTemplateSequence = cleanedSequence.substring(reverseStart, reverseStart + reverseLength);
  const reverseSequence = getReverseComplement(reverseTemplateSequence);
  const reverseGC = calculateGCContent(reverseSequence);
  const reverseTm = calculateMeltingTemp(reverseSequence);
  
  steps.push({
    step: 4,
    title: "Conception de l'amorce antisens (reverse)",
    description: "Sélection de la séquence complémentaire et calcul du reverse complément",
    sequence: reverseTemplateSequence,
    result: `5'-${reverseSequence}-3'`,
    details: [
      `Position sur le brin template: ${reverseStart + 1} à ${reverseStart + reverseLength}`,
      `Séquence template: 5'-${reverseTemplateSequence}-3'`,
      `Reverse complément: 5'-${reverseSequence}-3'`,
      `Longueur: ${reverseLength} nucléotides`,
      `Contenu GC: ${reverseGC.toFixed(1)}%`,
      `Température de fusion (Tm): ${reverseTm.toFixed(1)}°C`
    ]
  });
  
  // Step 5: Analysis and validation
  const tmDifference = Math.abs(forwardTm - reverseTm);
  const recommendations: string[] = [];
  
  if (tmDifference > 5) {
    recommendations.push(`⚠️ Différence de Tm importante (${tmDifference.toFixed(1)}°C). Ajuster les longueurs.`);
  }
  if (forwardGC < 40 || forwardGC > 60) {
    recommendations.push(`⚠️ Contenu GC de l'amorce sens non optimal (${forwardGC.toFixed(1)}%).`);
  }
  if (reverseGC < 40 || reverseGC > 60) {
    recommendations.push(`⚠️ Contenu GC de l'amorce antisens non optimal (${reverseGC.toFixed(1)}%).`);
  }
  if (amplificationLength > 3000) {
    recommendations.push(`⚠️ Produit PCR long (${amplificationLength} pb). Vérifier les conditions PCR.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("✅ Amorces optimales pour PCR standard.");
  }
  
  steps.push({
    step: 5,
    title: "Validation et recommandations",
    description: "Analyse des paramètres critiques pour l'efficacité PCR",
    details: [
      `Différence de Tm: ${tmDifference.toFixed(1)}°C (idéal: <5°C)`,
      `Longueur du produit PCR: ${amplificationLength} pb`,
      `Recommandations: ${recommendations.join(' ')}`,
      "Température d'hybridation recommandée: " + Math.min(forwardTm, reverseTm).toFixed(1) + "°C"
    ]
  });
  
  return {
    forward: {
      length: forwardLength,
      gcContent: forwardGC,
      meltingTemp: forwardTm,
      sequence: forwardSequence,
      position: { start: amplificationStart, end: amplificationStart + forwardLength }
    },
    reverse: {
      length: reverseLength,
      gcContent: reverseGC,
      meltingTemp: reverseTm,
      sequence: reverseSequence,
      position: { start: reverseStart, end: reverseStart + reverseLength }
    },
    steps,
    amplificationLength,
    recommendations
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