'use client';

import { useState } from "react";
import { validateDNA, calculateProteinLength, formatSequenceWithNumbers, formatSequenceWithColoring } from '../utils/dna';
import { estimateEcoRIFragments } from '../utils/restriction';
import { designPrimers, designPrimersDetailed, DetailedPrimerResult } from '../utils/pcr';
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
  const [detailedPrimerResult, setDetailedPrimerResult] = useState<DetailedPrimerResult | null>(null);
  const [showPrimerDetails, setShowPrimerDetails] = useState(false);
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
  };

  const generateDetailedPrimers = () => {
    if (!validateDNA(sequence)) {
      alert('Invalid DNA sequence. Please enter a sequence containing only A, T, C, and G.');
      return;
    }

    const detailed = designPrimersDetailed(sequence);
    setDetailedPrimerResult(detailed);
    setShowPrimerDetails(true);
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
      <div className="mb-6 text-center space-x-4">
        <a href="/pedigree" className="text-blue-600 hover:text-blue-800">Diagramme de pedigree</a>
        <a href="/phylogeny" className="text-blue-600 hover:text-blue-800">Arbre phylogénétique (UPGMA)</a>
        <a href="/prompt-maker" className="text-blue-600 hover:text-blue-800">Générateur de Prompts</a>
        <a href="/pedigree-prompt" className="text-blue-600 hover:text-blue-800">Prompts Pedigree</a>
        <a href="/prader-willi" className="text-blue-600 hover:text-blue-800">Syndrome de Prader-Willi</a>
        <a href="/angelman" className="text-blue-600 hover:text-blue-800">Syndrome d'Angelman</a>
        <a href="/transmission-genetique" className="text-blue-600 hover:text-blue-800">Types de transmission génétique</a>
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
            Analyze Mutation
          </button>
          
          {mutationResult && (
            <div className={`mt-4 p-4 rounded-md ${mutationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              {!mutationResult.isValid ? (
                <div className="text-red-600">
                  <p className="font-semibold">Invalid mutation:</p>
                  <p>{mutationResult.error || 'Please check the position and bases'}</p>
                </div>
              ) : (
                <div className="space-y-3 text-green-700">
                  <p className="font-semibold">Mutation Analysis Results:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Original sequence protein length:</p>
                      <p>{mutationResult.originalProteinLength} amino acids</p>
                    </div>
                    <div>
                      <p className="font-medium">Mutated sequence protein length:</p>
                      <p>{mutationResult.mutatedProteinLength} amino acids</p>
                    </div>
                  </div>
                  <p><span className="font-medium">Mutation effect:</span> {mutationResult.effect}</p>
                  {mutationResult.mutatedSequence && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Preview of mutated sequence:</p>
                      <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                        <code className="text-xs break-all">{formatInputSequence(mutationResult.mutatedSequence)}</code>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Note: Original sequence remains unchanged above. This is just a preview of the mutation effect.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PCR Primer Generator */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold mb-4">Générateur d'amorces PCR</h3>
          <p className="text-sm text-gray-600 mb-4">
            Génération détaillée des amorces pour amplifier par PCR la séquence donnée
          </p>
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 mr-4"
            onClick={generateDetailedPrimers}
          >
            Générer les amorces (étapes détaillées)
          </button>
          {showPrimerDetails && (
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              onClick={() => setShowPrimerDetails(false)}
            >
              Masquer les détails
            </button>
          )}
        </div>

        {/* Detailed Primer Results */}
        {showPrimerDetails && detailedPrimerResult && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🧬 Conception des Amorces PCR - Étapes Détaillées</h2>
            
            {/* Summary */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Résumé des amorces</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded">
                  <h4 className="font-medium text-green-800">Amorce Sens (Forward)</h4>
                  <p className="font-mono text-sm mt-1">5'-{detailedPrimerResult.forward.sequence}-3'</p>
                  <div className="text-xs text-green-600 mt-2">
                    <p>Longueur: {detailedPrimerResult.forward.length} nt</p>
                    <p>GC: {detailedPrimerResult.forward.gcContent.toFixed(1)}%</p>
                    <p>Tm: {detailedPrimerResult.forward.meltingTemp.toFixed(1)}°C</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-medium text-blue-800">Amorce Antisens (Reverse)</h4>
                  <p className="font-mono text-sm mt-1">5'-{detailedPrimerResult.reverse.sequence}-3'</p>
                  <div className="text-xs text-blue-600 mt-2">
                    <p>Longueur: {detailedPrimerResult.reverse.length} nt</p>
                    <p>GC: {detailedPrimerResult.reverse.gcContent.toFixed(1)}%</p>
                    <p>Tm: {detailedPrimerResult.reverse.meltingTemp.toFixed(1)}°C</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded">
                <h4 className="font-medium text-yellow-800">Produit PCR</h4>
                <p className="text-sm text-yellow-700">Longueur attendue: {detailedPrimerResult.amplificationLength} pb</p>
              </div>
            </div>

            {/* Step-by-step process */}
            <div className="space-y-4">
              {detailedPrimerResult.steps.map((step, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-purple-400">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      
                      {step.sequence && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Séquence:</p>
                          <code className="bg-gray-100 p-2 rounded text-xs block overflow-x-auto">
                            {step.sequence.length > 100 ? 
                              `${step.sequence.substring(0, 100)}...` : 
                              step.sequence
                            }
                          </code>
                        </div>
                      )}
                      
                      {step.result && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Résultat:</p>
                          <code className="bg-green-100 p-2 rounded text-sm block font-mono">
                            {step.result}
                          </code>
                        </div>
                      )}
                      
                      {step.details && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Détails:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Recommandations</h3>
              <div className="space-y-2">
                {detailedPrimerResult.recommendations.map((rec, index) => (
                  <p key={index} className="text-sm flex items-start">
                    <span className="mr-2">{rec.includes('⚠️') ? '⚠️' : rec.includes('✅') ? '✅' : '💡'}</span>
                    {rec.replace(/^[⚠️✅💡]\s*/, '')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

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
