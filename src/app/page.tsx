'use client';

import { useState } from "react";
import { validateDNA, calculateProteinLength, formatSequenceWithNumbers } from '../utils/dna';
import { estimateEcoRIFragments } from '../utils/restriction';
import { designPrimers } from '../utils/pcr';

export default function Home() {
  const [sequence, setSequence] = useState("");
  const [results, setResults] = useState<{
    formattedSequence: string | null;
    proteinLength: number | null;
    restrictionFragments: number | null;
    sequenceOccurrences: number | null;
    pcrPrimers: { forward: string; reverse: string } | null;
  }>({
    formattedSequence: null,
    proteinLength: null,
    restrictionFragments: null,
    sequenceOccurrences: null,
    pcrPrimers: null,
  });

  const analyzeSequence = () => {
    if (!validateDNA(sequence)) {
      alert('Invalid DNA sequence. Please enter a sequence containing only A, T, C, and G.');
      return;
    }

    const formattedSequence = formatSequenceWithNumbers(sequence);
    const proteinLength = calculateProteinLength(sequence);
    const restrictionFragments = estimateEcoRIFragments(sequence);
    const sequenceOccurrences = (sequence.match(/cacccgaaacgacgtcgtaa/g) || []).length;
    const pcrPrimers = designPrimers(sequence);

    setResults({
      formattedSequence,
      proteinLength,
      restrictionFragments,
      sequenceOccurrences,
      pcrPrimers,
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">DNA Analysis Tool</h1>
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
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={analyzeSequence}
        >
          Analyze
        </button>
        {results.formattedSequence !== null && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Input Sequence:</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto font-mono text-sm">
                  {results.formattedSequence}
                </pre>
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
