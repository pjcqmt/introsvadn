'use client';

import { useState } from "react";
import { validateDNA, calculateProteinLength, formatSequenceWithNumbers, formatSequenceWithColoring } from '../utils/dna';
import { estimateEcoRIFragments } from '../utils/restriction';
import { designPrimers } from '../utils/pcr';
import { Mutation, analyzeMutation } from '../utils/mutation';

function formatInputSequence(sequence: string): string {
  // Remove all spaces first
  const cleanSequence = sequence.replace(/\s+/g, '');
  // Split into chunks of 10 and join with spaces
  const chunks: string[] = [];
  for (let i = 0; i < cleanSequence.length; i += 10) {
    chunks.push(cleanSequence.slice(i, i + 10));
  }
  return chunks.join(' ');
}

export default function Home() {
  const [sequence, setSequence] = useState("");
  const [mutation, setMutation] = useState<Mutation>({
    position: 0,
    original: '',
    replacement: ''
  });
  const [mutationResult, setMutationResult] = useState<{
    isValid: boolean;
    mutatedSequence?: string;
    originalProteinLength?: number;
    mutatedProteinLength?: number;
    effect?: string;
    error?: string;
  } | null>(null);
  const [results, setResults] = useState<{
    formattedSequence: string | null;
    coloredSequence: string | null;
    proteinLength: number | null;
    restrictionFragments: number | null;
    sequenceOccurrences: number | null;
    pcrPrimers: { forward: string; reverse: string } | null;
  }>({
    formattedSequence: null,
    coloredSequence: null,
    proteinLength: null,
    restrictionFragments: null,
    sequenceOccurrences: null,
    pcrPrimers: null,
  });

  const handleMutationChange = (field: keyof Mutation, value: string) => {
    let processedValue: string | number = value;
    
    if (field === 'position') {
      processedValue = parseInt(value) || 0;
    } else {
      processedValue = value.toUpperCase();
    }

    setMutation(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const analyzeMutationEffect = () => {
    if (!sequence) {
      alert('Please enter a DNA sequence first');
      return;
    }

    if (!mutation.position || !mutation.original || !mutation.replacement) {
      alert('Please fill in all mutation fields');
      return;
    }

    const result = analyzeMutation(sequence, mutation);
    setMutationResult(result);

    if (result.isValid && result.mutatedSequence) {
      // Update the sequence with the mutation
      setSequence(formatInputSequence(result.mutatedSequence));
    }
  };

  const analyzeSequence = () => {
    if (!validateDNA(sequence)) {
      alert('Invalid DNA sequence. Please enter a sequence containing only A, T, C, and G.');
      return;
    }

    // Format the input sequence and update the textarea
    const formattedInput = formatInputSequence(sequence);
    setSequence(formattedInput);

    // Format sequences for display
    const formattedSequence = formatSequenceWithNumbers(sequence);
    const coloredSequence = formatSequenceWithColoring(sequence);
    const proteinLength = calculateProteinLength(sequence);
    const restrictionFragments = estimateEcoRIFragments(sequence);
    const sequenceOccurrences = (sequence.match(/cacccgaaacgacgtcgtaa/g) || []).length;
    const pcrPrimers = designPrimers(sequence);

    setResults({
      formattedSequence,
      coloredSequence,
      proteinLength,
      restrictionFragments,
      sequenceOccurrences,
      pcrPrimers,
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">DNA Analysis Tool</h1>
      
      {/* Navigation */}
      <div className="mb-6 text-center">
        <a href="/pedigree" className="text-blue-600 hover:text-blue-800 mr-4">Diagramme de pedigree</a>
        <a href="/phylogeny" className="text-blue-600 hover:text-blue-800 mr-4">Arbre phylogénétique (UPGMA)</a>
        <a href="/prompt-maker" className="text-blue-600 hover:text-blue-800">Générateur de Prompts →</a>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter DNA Sequence:</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md font-mono"
            rows={5}
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            placeholder="Paste your DNA sequence here..."
          />
        </div>
        
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold mb-4">Mutation Analysis</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position:</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={mutation.position || ''}
                onChange={(e) => handleMutationChange('position', e.target.value)}
                placeholder="Enter position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Base:</label>
              <input
                type="text"
                maxLength={1}
                className="w-full p-2 border border-gray-300 rounded-md uppercase"
                value={mutation.original}
                onChange={(e) => handleMutationChange('original', e.target.value)}
                placeholder="A/T/C/G"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Replacement:</label>
              <input
                type="text"
                maxLength={1}
                className="w-full p-2 border border-gray-300 rounded-md uppercase"
                value={mutation.replacement}
                onChange={(e) => handleMutationChange('replacement', e.target.value)}
                placeholder="A/T/C/G"
              />
            </div>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={analyzeMutationEffect}
          >
            Apply Mutation
          </button>
          
          {mutationResult && (
            <div className={`mt-4 p-4 rounded-md ${mutationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              {!mutationResult.isValid ? (
                <div className="text-red-600">
                  <p className="font-semibold">Invalid mutation:</p>
                  <p>{mutationResult.error || 'Please check the position and bases'}</p>
                </div>
              ) : (
                <div className="space-y-2 text-green-700">
                  <p>Mutation successfully applied!</p>
                  <p>Original protein length: {mutationResult.originalProteinLength} amino acids</p>
                  <p>Mutated protein length: {mutationResult.mutatedProteinLength} amino acids</p>
                  <p>Effect: {mutationResult.effect}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={analyzeSequence}
        >
          Analyze Sequence
        </button>

        {results.formattedSequence !== null && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Input Sequence:</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <pre 
                    className="font-mono text-sm"
                    dangerouslySetInnerHTML={{ __html: results.coloredSequence || '' }}
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    <span className="inline-block mr-4">
                      <span className="text-green-600 font-bold">ATG</span> = Start codon
                    </span>
                    <span className="inline-block mr-4">
                      <span className="text-red-600 font-bold">TAA/TAG/TGA</span> = Stop codon
                    </span>
                    <span className="inline-block">
                      <span className="text-blue-600">SEQUENCE</span> = Coding sequence
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Protein Length:</h3>
                <p>{results.proteinLength} amino acids</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Restriction Analysis:</h3>
                <p>Expected EcoRI Fragments: {results.restrictionFragments}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">PCR Primers:</h3>
                <p>Forward Primer: {results.pcrPrimers?.forward}</p>
                <p>Reverse Primer: {results.pcrPrimers?.reverse}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
