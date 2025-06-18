'use client';

import { useState } from 'react';
import {
  DNASequence,
  DistanceMatrix,
  ClusterNode,
  UPGMAStep,
  calculateDistanceMatrix,
  constructUPGMATree,
  validateDNASequence,
  formatDNASequence
} from '../../utils/phylogeny';

export default function PhylogenyPage() {
  const [inputMode, setInputMode] = useState<'sequences' | 'manual'>('sequences');
  
  // DNA Sequences from the example question
  const [dnaSequences, setDnaSequences] = useState<DNASequence[]>([
    { id: '1', name: 'Espèce 1', sequence: 'ACAAACAGTT CGATCGATTT GCAGTCTGGG' },
    { id: '2', name: 'Espèce 2', sequence: 'ACAAACAGTT TCTAGCGATT GCAGTCAGGG' },
    { id: '3', name: 'Espèce 3', sequence: 'ACAGACAGTT CGATCGATTT GCAGTCTCGG' },
    { id: '4', name: 'Espèce 4', sequence: 'ACTGACAGTT CGATCGATTT GCAGTCAGAG' },
    { id: '5', name: 'Espèce 5', sequence: 'ATTGACAGTT CGATCGATTT GCAGTCAGGA' },
    { id: '6', name: 'Espèce 6', sequence: 'TTTGACAGTT CGATCGATTT GCAGTCAGGG' }
  ]);

  const [manualSpecies, setManualSpecies] = useState([
    { id: '1', name: 'Espèce A' },
    { id: '2', name: 'Espèce B' },
    { id: '3', name: 'Espèce C' },
    { id: '4', name: 'Espèce D' }
  ]);
  
  const [manualDistanceMatrix, setManualDistanceMatrix] = useState<DistanceMatrix>({
    '1': { '2': 2, '3': 4, '4': 6 },
    '2': { '1': 2, '3': 3, '4': 5 },
    '3': { '1': 4, '2': 3, '4': 4 },
    '4': { '1': 6, '2': 5, '3': 4 }
  });

  const [calculatedDistanceMatrix, setCalculatedDistanceMatrix] = useState<DistanceMatrix>({});
  const [phylogeneticTree, setPhylogeneticTree] = useState<ClusterNode | null>(null);
  const [steps, setSteps] = useState<UPGMAStep[]>([]);
  const [sequenceError, setSequenceError] = useState<string>('');

  const addDNASequence = () => {
    const newId = (dnaSequences.length + 1).toString();
    const newSequence = { 
      id: newId, 
      name: `Espèce ${dnaSequences.length + 1}`, 
      sequence: '' 
    };
    setDnaSequences([...dnaSequences, newSequence]);
  };

  const removeDNASequence = (id: string) => {
    if (dnaSequences.length > 2) {
      setDnaSequences(dnaSequences.filter(s => s.id !== id));
    }
  };

  const updateDNASequence = (id: string, field: 'name' | 'sequence', value: string) => {
    setDnaSequences(dnaSequences.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const addManualSpecies = () => {
    const newId = (manualSpecies.length + 1).toString();
    const newSpecies = { id: newId, name: `Espèce ${String.fromCharCode(65 + manualSpecies.length)}` };
    setManualSpecies([...manualSpecies, newSpecies]);
    
    // Initialize distance matrix for new species
    const newMatrix = { ...manualDistanceMatrix };
    newMatrix[newId] = {};
    manualSpecies.forEach(s => {
      newMatrix[newId][s.id] = 0;
      if (!newMatrix[s.id]) newMatrix[s.id] = {};
      newMatrix[s.id][newId] = 0;
    });
    setManualDistanceMatrix(newMatrix);
  };

  const removeManualSpecies = (id: string) => {
    if (manualSpecies.length > 2) {
      setManualSpecies(manualSpecies.filter(s => s.id !== id));
      
      // Remove from distance matrix
      const newMatrix = { ...manualDistanceMatrix };
      delete newMatrix[id];
      Object.keys(newMatrix).forEach(key => {
        delete newMatrix[key][id];
      });
      setManualDistanceMatrix(newMatrix);
    }
  };

  const updateManualSpeciesName = (id: string, name: string) => {
    setManualSpecies(manualSpecies.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateManualDistance = (id1: string, id2: string, distance: number) => {
    const newMatrix = { ...manualDistanceMatrix };
    if (!newMatrix[id1]) newMatrix[id1] = {};
    if (!newMatrix[id2]) newMatrix[id2] = {};
    newMatrix[id1][id2] = distance;
    newMatrix[id2][id1] = distance;
    setManualDistanceMatrix(newMatrix);
  };

  const calculateFromSequences = () => {
    setSequenceError('');
    
    // Validate all sequences
    for (const seq of dnaSequences) {
      if (!seq.sequence.trim()) {
        setSequenceError('Toutes les séquences doivent être remplies');
        return;
      }
      if (!validateDNASequence(seq.sequence)) {
        setSequenceError(`Séquence invalide pour ${seq.name}. Utilisez seulement A, T, C, G`);
        return;
      }
    }

    // Check that all sequences have the same length
    const lengths = dnaSequences.map(s => s.sequence.replace(/\s+/g, '').length);
    if (new Set(lengths).size > 1) {
      setSequenceError('Toutes les séquences doivent avoir la même longueur');
      return;
    }

    try {
      // Calculate distance matrix
      const matrix = calculateDistanceMatrix(dnaSequences);
      setCalculatedDistanceMatrix(matrix);

      // Create clusters for UPGMA
      const clusters: ClusterNode[] = dnaSequences.map(s => ({
        id: s.id,
        name: s.name,
        height: 0,
        isLeaf: true
      }));

      // Construct tree
      const result = constructUPGMATree(clusters, matrix);
      setPhylogeneticTree(result.tree);
      setSteps(result.steps);
    } catch (error) {
      setSequenceError(error instanceof Error ? error.message : 'Erreur lors du calcul');
    }
  };

  const calculateFromManualMatrix = () => {
    // Create clusters for UPGMA
    const clusters: ClusterNode[] = manualSpecies.map(s => ({
      id: s.id,
      name: s.name,
      height: 0,
      isLeaf: true
    }));

    // Construct tree
    const result = constructUPGMATree(clusters, manualDistanceMatrix);
    setPhylogeneticTree(result.tree);
    setSteps(result.steps);
    setCalculatedDistanceMatrix(manualDistanceMatrix);
  };

  const renderTree = (node: ClusterNode, leafPositions: Map<string, number>, currentY: number, maxHeight: number): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    if (node.isLeaf) {
      const x = leafPositions.get(node.id) || 0;
      elements.push(
        <g key={node.id}>
          {/* Leaf node circle */}
          <circle cx={x} cy={currentY} r="6" fill="#10B981" stroke="#065F46" strokeWidth="2" />
          
          {/* Species name */}
          <text x={x + 15} y={currentY + 5} fontSize="14" fill="#065F46" fontWeight="600">
            {node.name}
          </text>
        </g>
      );
      return elements;
    }

    if (!node.children || node.children.length !== 2) return elements;

    // Get leaf nodes to calculate positions
    const getLeafNodes = (n: ClusterNode): ClusterNode[] => {
      if (n.isLeaf) return [n];
      if (!n.children) return [];
      return [...getLeafNodes(n.children[0]), ...getLeafNodes(n.children[1])];
    };

    const leftLeaves = getLeafNodes(node.children[0]);
    const rightLeaves = getLeafNodes(node.children[1]);

    // Calculate the x position for this internal node (average of its leaves)
    const leftX = leftLeaves.reduce((sum, leaf) => sum + (leafPositions.get(leaf.id) || 0), 0) / leftLeaves.length;
    const rightX = rightLeaves.reduce((sum, leaf) => sum + (leafPositions.get(leaf.id) || 0), 0) / rightLeaves.length;
    const nodeX = (leftX + rightX) / 2;

    // Calculate Y position based on branch height
    const nodeY = currentY - (node.height / maxHeight) * 300;

    // Horizontal line connecting the two children
    elements.push(
      <line 
        key={`${node.id}-horizontal`}
        x1={leftX} 
        y1={nodeY} 
        x2={rightX} 
        y2={nodeY} 
        stroke="#374151" 
        strokeWidth="2" 
      />
    );

    // Branch length label
    elements.push(
      <g key={`${node.id}-label`}>
        <rect 
          x={nodeX - 20} 
          y={nodeY - 8} 
          width="40" 
          height="16" 
          fill="white" 
          stroke="#E5E7EB" 
          strokeWidth="1" 
          rx="3"
        />
        <text 
          x={nodeX} 
          y={nodeY + 3} 
          fontSize="10" 
          fill="#1F2937" 
          textAnchor="middle" 
          fontWeight="600"
        >
          {node.height.toFixed(2)}
        </text>
      </g>
    );

    // Vertical lines to children
    const leftChildY = node.children[0].isLeaf ? currentY : currentY - (node.children[0].height / maxHeight) * 300;
    const rightChildY = node.children[1].isLeaf ? currentY : currentY - (node.children[1].height / maxHeight) * 300;

    elements.push(
      <line 
        key={`${node.id}-left-vertical`}
        x1={leftX} 
        y1={nodeY} 
        x2={leftX} 
        y2={leftChildY} 
        stroke="#374151" 
        strokeWidth="2" 
      />
    );

    elements.push(
      <line 
        key={`${node.id}-right-vertical`}
        x1={rightX} 
        y1={nodeY} 
        x2={rightX} 
        y2={rightChildY} 
        stroke="#374151" 
        strokeWidth="2" 
      />
    );

    // Recursively render children
    elements.push(...renderTree(node.children[0], leafPositions, currentY, maxHeight));
    elements.push(...renderTree(node.children[1], leafPositions, currentY, maxHeight));

    return elements;
  };

  // Helper function to calculate maximum height in tree
  const getMaxHeight = (node: ClusterNode): number => {
    if (node.isLeaf) return 0;
    const childHeights = node.children?.map(child => getMaxHeight(child)) || [0];
    return Math.max(node.height, ...childHeights);
  };

  // Helper function to count leaf nodes
  const countLeaves = (node: ClusterNode): number => {
    if (node.isLeaf) return 1;
    return (node.children?.[0] ? countLeaves(node.children[0]) : 0) + 
           (node.children?.[1] ? countLeaves(node.children[1]) : 0);
  };

  const currentSpecies = inputMode === 'sequences' ? dnaSequences : manualSpecies;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Construction d'Arbre Phylogénétique - Méthode UPGMA
        </h1>

        {/* Navigation */}
        <div className="mb-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 mr-4">← Retour à l'analyse ADN</a>
          <a href="/pedigree" className="text-blue-600 hover:text-blue-800">Diagramme de pedigree →</a>
        </div>

        {/* Input Mode Toggle */}
        <div className="mb-6 text-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setInputMode('sequences')}
              className={`px-4 py-2 rounded-md ${
                inputMode === 'sequences' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              À partir de séquences ADN
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={`px-4 py-2 rounded-md ${
                inputMode === 'manual' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Matrice manuelle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {inputMode === 'sequences' ? (
              <>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Séquences ADN</h2>
                  <div className="space-y-4">
                    {dnaSequences.map((seq, idx) => (
                      <div key={seq.id} className="border border-gray-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={seq.name}
                            onChange={(e) => updateDNASequence(seq.id, 'name', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                            placeholder="Nom de l'espèce"
                          />
                          {dnaSequences.length > 2 && (
                            <button
                              onClick={() => removeDNASequence(seq.id)}
                              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <textarea
                          value={seq.sequence}
                          onChange={(e) => updateDNASequence(seq.id, 'sequence', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                          rows={2}
                          placeholder="Séquence ADN (A, T, C, G)"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Longueur: {seq.sequence.replace(/\s+/g, '').length} nucléotides
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addDNASequence}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      + Ajouter une séquence
                    </button>
                  </div>
                  
                  {sequenceError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{sequenceError}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={calculateFromSequences}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold"
                >
                  Calculer la matrice et construire l'arbre
                </button>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Espèces</h2>
                  <div className="space-y-3">
                    {manualSpecies.map((s, idx) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => updateManualSpeciesName(s.id, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        {manualSpecies.length > 2 && (
                          <button
                            onClick={() => removeManualSpecies(s.id)}
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addManualSpecies}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      + Ajouter une espèce
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Matrice de Distance</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-50"></th>
                          {manualSpecies.map(s => (
                            <th key={s.id} className="border border-gray-300 p-2 bg-gray-50 text-sm">
                              {s.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {manualSpecies.map((s1, i) => (
                          <tr key={s1.id}>
                            <td className="border border-gray-300 p-2 bg-gray-50 font-medium text-sm">
                              {s1.name}
                            </td>
                            {manualSpecies.map((s2, j) => (
                              <td key={s2.id} className="border border-gray-300 p-1">
                                {i === j ? (
                                  <span className="text-gray-400">0</span>
                                ) : i < j ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={manualDistanceMatrix[s1.id]?.[s2.id] || 0}
                                    onChange={(e) => updateManualDistance(s1.id, s2.id, parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 text-center border-0 text-sm"
                                  />
                                ) : (
                                  <span className="text-sm text-center block">
                                    {manualDistanceMatrix[s2.id]?.[s1.id] || 0}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={calculateFromManualMatrix}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold"
                >
                  Construire l'Arbre Phylogénétique
                </button>
              </>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Distance Matrix Display */}
            {Object.keys(calculatedDistanceMatrix).length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Matrice de Distance Calculée</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 bg-gray-50"></th>
                        {currentSpecies.map(s => (
                          <th key={s.id} className="border border-gray-300 p-2 bg-gray-50">
                            {s.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSpecies.map(s1 => (
                        <tr key={s1.id}>
                          <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                            {s1.name}
                          </td>
                          {currentSpecies.map(s2 => (
                            <td key={s2.id} className="border border-gray-300 p-2 text-center">
                              {calculatedDistanceMatrix[s1.id]?.[s2.id] || 0}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Construction Steps */}
            {steps.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Étapes de Construction UPGMA</h2>
                <div className="space-y-6">
                  {steps.map((step, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-lg mb-3 text-blue-600">
                        Étape {step.step}: {step.description}
                      </div>
                      
                      {/* Matrix Before */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Matrice avant fusion:</h4>
                        <div className="overflow-x-auto">
                          <table className="border-collapse border border-gray-300 text-xs">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 p-1 bg-gray-50"></th>
                                {step.activeClusters.map(clusterId => {
                                  const cluster = [...currentSpecies, ...steps.slice(0, idx).map(s => ({ id: s.newClusterName, name: s.newClusterName }))].find(c => c.id === clusterId || c.name === clusterId);
                                  const displayName = cluster ? (cluster.name.length > 15 ? cluster.name.substring(0, 15) + '...' : cluster.name) : clusterId;
                                  return (
                                    <th key={clusterId} className="border border-gray-300 p-1 bg-gray-50 text-xs min-w-16">
                                      {displayName}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {step.activeClusters.map(clusterId1 => {
                                const cluster1 = [...currentSpecies, ...steps.slice(0, idx).map(s => ({ id: s.newClusterName, name: s.newClusterName }))].find(c => c.id === clusterId1 || c.name === clusterId1);
                                const displayName1 = cluster1 ? (cluster1.name.length > 15 ? cluster1.name.substring(0, 15) + '...' : cluster1.name) : clusterId1;
                                return (
                                  <tr key={clusterId1}>
                                    <td className="border border-gray-300 p-1 bg-gray-50 font-medium text-xs">
                                      {displayName1}
                                    </td>
                                    {step.activeClusters.map(clusterId2 => (
                                      <td key={clusterId2} className="border border-gray-300 p-1 text-center text-xs">
                                        {clusterId1 === clusterId2 ? '0' : (step.matrixBefore[clusterId1]?.[clusterId2] || 0).toFixed(1)}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Action Description */}
                      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm">
                          <strong>Action:</strong> Les clusters <strong>{step.clusteredNodes.join(' et ')}</strong> sont fusionnés car ils ont la distance minimale de <strong>{step.distance.toFixed(2)}</strong>.
                          Le nouveau cluster <strong>{step.newClusterName}</strong> est créé avec une hauteur de branche de <strong>{(step.distance / 2).toFixed(2)}</strong>.
                        </p>
                      </div>

                      {/* Matrix After (if not the last step) */}
                      {idx < steps.length - 1 && (
                        <div>
                          <h4 className="font-medium mb-2">Matrice après fusion:</h4>
                          <div className="overflow-x-auto">
                            <table className="border-collapse border border-gray-300 text-xs">
                              <thead>
                                <tr>
                                  <th className="border border-gray-300 p-1 bg-gray-50"></th>
                                  {Object.keys(step.matrixAfter).map(clusterId => {
                                    const cluster = [...currentSpecies, ...steps.slice(0, idx + 1).map(s => ({ id: s.newClusterName, name: s.newClusterName }))].find(c => c.id === clusterId || c.name === clusterId);
                                    const displayName = cluster ? (cluster.name.length > 15 ? cluster.name.substring(0, 15) + '...' : cluster.name) : clusterId;
                                    return (
                                      <th key={clusterId} className="border border-gray-300 p-1 bg-gray-50 text-xs min-w-16">
                                        {displayName}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(step.matrixAfter).map(clusterId1 => {
                                  const cluster1 = [...currentSpecies, ...steps.slice(0, idx + 1).map(s => ({ id: s.newClusterName, name: s.newClusterName }))].find(c => c.id === clusterId1 || c.name === clusterId1);
                                  const displayName1 = cluster1 ? (cluster1.name.length > 15 ? cluster1.name.substring(0, 15) + '...' : cluster1.name) : clusterId1;
                                  return (
                                    <tr key={clusterId1}>
                                      <td className="border border-gray-300 p-1 bg-gray-50 font-medium text-xs">
                                        {displayName1}
                                      </td>
                                      {Object.keys(step.matrixAfter).map(clusterId2 => (
                                        <td key={clusterId2} className="border border-gray-300 p-1 text-center text-xs">
                                          {clusterId1 === clusterId2 ? '0' : (step.matrixAfter[clusterId1]?.[clusterId2] || 0).toFixed(1)}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            <p>Les nouvelles distances sont calculées par la moyenne arithmétique (méthode UPGMA).</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phylogenetic Tree */}
            {phylogeneticTree && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-center">🌳 Arbre Phylogénétique</h2>
                <div className="overflow-x-auto bg-gradient-to-b from-blue-50 to-green-50 p-4 rounded-lg border-2 border-green-200">
                  {(() => {
                    const maxHeight = getMaxHeight(phylogeneticTree);
                    const leafCount = countLeaves(phylogeneticTree);
                    const treeWidth = Math.max(800, leafCount * 150 + 200);
                    const treeHeight = 500;
                    
                    // Get all leaf nodes and assign positions
                    const getLeafNodes = (node: ClusterNode): ClusterNode[] => {
                      if (node.isLeaf) return [node];
                      if (!node.children) return [];
                      return [...getLeafNodes(node.children[0]), ...getLeafNodes(node.children[1])];
                    };
                    
                    const leafNodes = getLeafNodes(phylogeneticTree);
                    const leafPositions = new Map<string, number>();
                    const startX = 100;
                    const spacing = Math.max(150, (treeWidth - 200) / Math.max(1, leafNodes.length - 1));
                    
                    leafNodes.forEach((leaf, index) => {
                      leafPositions.set(leaf.id, startX + index * spacing);
                    });
                    
                    const bottomY = treeHeight - 80;
                    const treeElements = renderTree(phylogeneticTree, leafPositions, bottomY, maxHeight);
                    
                    return (
                      <svg width={treeWidth} height={treeHeight} className="mx-auto">
                        {/* Background grid for reference */}
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F3F4F6" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />
                        
                        {/* Title */}
                        <text x={treeWidth/2} y="25" fontSize="16" fill="#1F2937" textAnchor="middle" fontWeight="bold">
                          Arbre Phylogénétique UPGMA
                        </text>
                        
                        {/* Scale bar */}
                        <g transform={`translate(50, ${treeHeight - 30})`}>
                          <line x1="0" y1="0" x2="100" y2="0" stroke="#374151" strokeWidth="2"/>
                          <line x1="0" y1="-5" x2="0" y2="5" stroke="#374151" strokeWidth="2"/>
                          <line x1="100" y1="-5" x2="100" y2="5" stroke="#374151" strokeWidth="2"/>
                          <text x="50" y="-10" fontSize="10" fill="#374151" textAnchor="middle">
                            Distance: {maxHeight > 0 ? (maxHeight / 5).toFixed(1) : '0.5'}
                          </text>
                        </g>
                        
                        {/* Tree elements */}
                        <g transform="translate(0, 0)">
                          {treeElements}
                        </g>
                      </svg>
                    );
                  })()}
                </div>
                
                {/* Legend and Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🔍 Légende</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700"></div>
                        <span>Espèces (feuilles de l'arbre)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-white border border-gray-300 rounded flex items-center justify-center text-xs">1.2</div>
                        <span>Longueur de branche (distance évolutive)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-gray-700"></div>
                        <span>Branches de l'arbre</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">📊 Informations</h3>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>• <strong>Méthode:</strong> UPGMA (Average Linkage)</p>
                      <p>• <strong>Distance:</strong> Différences nucléotidiques</p>
                      <p>• <strong>Espèces:</strong> {countLeaves(phylogeneticTree)}</p>
                      <p>• <strong>Hauteur max:</strong> {getMaxHeight(phylogeneticTree).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>💡 Interprétation:</strong> Plus la longueur de branche est grande, plus les espèces sont éloignées évolutivement. 
                    Les nœuds internes représentent des ancêtres communs hypothétiques.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 