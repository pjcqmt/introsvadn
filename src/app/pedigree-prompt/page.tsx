'use client';

import React, { useState } from 'react';

interface Individual {
  id: string;
  generation: number;
  position: number;
  sex: 'H' | 'F';
  phenotype: 'normal' | 'affected';
  isProband?: boolean;
}

interface Couple {
  parent1: string;
  parent2: string;
  children: string[];
}

interface PedigreeData {
  individuals: Individual[];
  couples: Couple[];
  trait: string;
  inheritance: string;
  question: string;
}

export default function PedigreePrompt() {
  const [trait, setTrait] = useState('Albinisme');
  const [inheritance, setInheritance] = useState('autosomique récessif');
  const [individuals, setIndividuals] = useState<Individual[]>([
    { id: 'I.1', generation: 1, position: 1, sex: 'H', phenotype: 'affected' },
    { id: 'I.2', generation: 1, position: 2, sex: 'F', phenotype: 'normal' },
    { id: 'I.3', generation: 1, position: 3, sex: 'H', phenotype: 'affected' },
    { id: 'I.4', generation: 1, position: 4, sex: 'F', phenotype: 'normal' },
    { id: 'II.1', generation: 2, position: 1, sex: 'F', phenotype: 'normal' },
    { id: 'II.2', generation: 2, position: 2, sex: 'H', phenotype: 'normal' },
    { id: 'II.3', generation: 2, position: 3, sex: 'F', phenotype: 'normal' },
    { id: 'II.4', generation: 2, position: 4, sex: 'F', phenotype: 'normal' },
    { id: 'II.5', generation: 2, position: 5, sex: 'F', phenotype: 'normal' },
    { id: 'II.6', generation: 2, position: 6, sex: 'H', phenotype: 'normal' },
    { id: 'III.1', generation: 3, position: 1, sex: 'F', phenotype: 'normal' },
    { id: 'III.2', generation: 3, position: 2, sex: 'H', phenotype: 'normal' },
    { id: 'IV.1', generation: 4, position: 1, sex: 'H', phenotype: 'normal', isProband: true }
  ]);

  const [couples, setCouples] = useState<Couple[]>([
    { parent1: 'I.1', parent2: 'I.2', children: ['II.1', 'II.2'] },
    { parent1: 'I.3', parent2: 'I.4', children: ['II.3', 'II.4'] },
    { parent1: 'II.2', parent2: 'II.5', children: ['III.1'] },
    { parent1: 'II.3', parent2: 'II.6', children: ['III.2'] },
    { parent1: 'III.1', parent2: 'III.2', children: ['IV.1'] }
  ]);

  const [questions] = useState([
    'Quel est le mode de transmission de ce trait ?',
    'Quelle est la probabilité que IV.1 soit affecté ?',
    'Quels sont les génotypes possibles des parents ?',
    'Justifiez votre réponse en analysant le pedigree',
    'Calculez les probabilités pour la descendance'
  ]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const addIndividual = () => {
    const maxGen = Math.max(...individuals.map(i => i.generation));
    const newId = `${toRoman(maxGen + 1)}.1`;
    const newIndividual: Individual = {
      id: newId,
      generation: maxGen + 1,
      position: 1,
      sex: 'H',
      phenotype: 'normal'
    };
    setIndividuals([...individuals, newIndividual]);
  };

  const updateIndividual = (index: number, field: keyof Individual, value: any) => {
    const updated = [...individuals];
    updated[index] = { ...updated[index], [field]: value };
    setIndividuals(updated);
  };

  const removeIndividual = (index: number) => {
    const individual = individuals[index];
    const updatedCouples = couples.filter(couple => 
      couple.parent1 !== individual.id && 
      couple.parent2 !== individual.id && 
      !couple.children.includes(individual.id)
    ).map(couple => ({
      ...couple,
      children: couple.children.filter(child => child !== individual.id)
    }));
    
    setCouples(updatedCouples);
    setIndividuals(individuals.filter((_, i) => i !== index));
  };

  const addCouple = () => {
    const newCouple: Couple = {
      parent1: '',
      parent2: '',
      children: []
    };
    setCouples([...couples, newCouple]);
  };

  const updateCouple = (index: number, field: keyof Couple, value: any) => {
    const updated = [...couples];
    updated[index] = { ...updated[index], [field]: value };
    setCouples(updated);
  };

  const removeCouple = (index: number) => {
    setCouples(couples.filter((_, i) => i !== index));
  };

  const addChildToCouple = (coupleIndex: number) => {
    const updated = [...couples];
    updated[coupleIndex].children.push('');
    setCouples(updated);
  };

  const updateChild = (coupleIndex: number, childIndex: number, value: string) => {
    const updated = [...couples];
    updated[coupleIndex].children[childIndex] = value;
    setCouples(updated);
  };

  const removeChild = (coupleIndex: number, childIndex: number) => {
    const updated = [...couples];
    updated[coupleIndex].children.splice(childIndex, 1);
    setCouples(updated);
  };

  const toggleQuestion = (question: string) => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const addCustomQuestion = () => {
    if (customQuestion.trim()) {
      setSelectedQuestions([...selectedQuestions, customQuestion.trim()]);
      setCustomQuestion('');
    }
  };

  const generatePrompt = () => {
    let prompt = 'RELATIONS PARENTALES:\n';
    
    couples.forEach(couple => {
      if (couple.parent1 && couple.parent2 && couple.children.length > 0) {
        const parent1 = individuals.find(i => i.id === couple.parent1);
        const parent2 = individuals.find(i => i.id === couple.parent2);
        
        if (parent1 && parent2) {
          const parent1Text = `${parent1.id} (${parent1.sex},${parent1.phenotype === 'affected' ? trait.toLowerCase() : 'normal'})`;
          const parent2Text = `${parent2.id} (${parent2.sex},${parent2.phenotype === 'affected' ? trait.toLowerCase() : 'normal'})`;
          
          const childrenText = couple.children
            .filter(childId => childId)
            .map(childId => {
              const child = individuals.find(i => i.id === childId);
              if (child) {
                if (child.isProband) {
                  return `${child.id} (??,??)`;
                }
                return `${child.id} (${child.sex},${child.phenotype === 'affected' ? trait.toLowerCase() : 'normal'})`;
              }
              return childId;
            })
            .join(', ');
          
          if (childrenText) {
            prompt += `${parent1Text} + ${parent2Text} → ${childrenText}\n`;
          }
        }
      }
    });
    
    prompt += `PHÉNOTYPE: ${trait} = ${inheritance}\n\n`;
    
    if (selectedQuestions.length > 0) {
      prompt += 'QUESTIONS:\n';
      selectedQuestions.forEach((question, index) => {
        prompt += `${index + 1}. ${question}\n`;
      });
    }
    
    setGeneratedPrompt(prompt);
  };

  const toRoman = (num: number): string => {
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return romanNumerals[num] || `${num}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('Prompt copié dans le presse-papiers !');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Générateur de Prompts - Problèmes de Pedigree
          </h1>

          {/* Trait Configuration */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Configuration du trait</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du trait
                </label>
                <input
                  type="text"
                  value={trait}
                  onChange={(e) => setTrait(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Albinisme, Daltonisme..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de transmission
                </label>
                <select
                  value={inheritance}
                  onChange={(e) => setInheritance(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="autosomique récessif">Autosomique récessif</option>
                  <option value="autosomique dominant">Autosomique dominant</option>
                  <option value="lié au sexe récessif">Lié au sexe récessif</option>
                  <option value="lié au sexe dominant">Lié au sexe dominant</option>
                  <option value="mitochondrial">Mitochondrial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Individuals Management */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Individus du pedigree</h2>
              <button
                onClick={addIndividual}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                + Ajouter individu
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {individuals.map((individual, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-center p-3 bg-white rounded border">
                  <input
                    type="text"
                    value={individual.id}
                    onChange={(e) => updateIndividual(index, 'id', e.target.value)}
                    className="p-2 border rounded text-sm"
                    placeholder="I.1"
                  />
                  <select
                    value={individual.sex}
                    onChange={(e) => updateIndividual(index, 'sex', e.target.value)}
                    className="p-2 border rounded text-sm"
                  >
                    <option value="H">Homme (H)</option>
                    <option value="F">Femme (F)</option>
                  </select>
                  <select
                    value={individual.phenotype}
                    onChange={(e) => updateIndividual(index, 'phenotype', e.target.value)}
                    className="p-2 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="affected">Affecté</option>
                  </select>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={individual.isProband || false}
                      onChange={(e) => updateIndividual(index, 'isProband', e.target.checked)}
                      className="mr-1"
                    />
                    Proposant
                  </label>
                  <span className="text-xs text-gray-500">
                    Gen {individual.generation}
                  </span>
                  <button
                    onClick={() => removeIndividual(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Couples Management */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Relations parentales</h2>
              <button
                onClick={addCouple}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                + Ajouter couple
              </button>
            </div>

            <div className="space-y-4">
              {couples.map((couple, coupleIndex) => (
                <div key={coupleIndex} className="p-4 bg-white rounded border">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent 1</label>
                      <select
                        value={couple.parent1}
                        onChange={(e) => updateCouple(coupleIndex, 'parent1', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        {individuals.map(ind => (
                          <option key={ind.id} value={ind.id}>{ind.id} ({ind.sex})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent 2</label>
                      <select
                        value={couple.parent2}
                        onChange={(e) => updateCouple(coupleIndex, 'parent2', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        {individuals.map(ind => (
                          <option key={ind.id} value={ind.id}>{ind.id} ({ind.sex})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeCouple(coupleIndex)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        × Supprimer
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Enfants</label>
                      <button
                        onClick={() => addChildToCouple(coupleIndex)}
                        className="bg-green-400 hover:bg-green-500 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        + Enfant
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {couple.children.map((child, childIndex) => (
                        <div key={childIndex} className="flex items-center">
                          <select
                            value={child}
                            onChange={(e) => updateChild(coupleIndex, childIndex, e.target.value)}
                            className="p-1 border rounded text-sm mr-1"
                          >
                            <option value="">Sélectionner...</option>
                            {individuals.map(ind => (
                              <option key={ind.id} value={ind.id}>{ind.id}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeChild(coupleIndex, childIndex)}
                            className="bg-red-400 hover:bg-red-500 text-white px-1 py-1 rounded text-xs transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions Management */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Questions à poser</h2>
            
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Questions prédéfinies</h3>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question)}
                      onChange={() => toggleQuestion(question)}
                      className="mr-2"
                    />
                    <span className="text-sm">{question}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Ajouter une question personnalisée</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez votre question..."
                />
                <button
                  onClick={addCustomQuestion}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <button
              onClick={generatePrompt}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Générer le Prompt de Pedigree
            </button>
          </div>

          {/* Generated Prompt */}
          {generatedPrompt && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Prompt Généré</h2>
                <button
                  onClick={copyToClipboard}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  📋 Copier
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded-md border overflow-auto max-h-96 font-mono">
                {generatedPrompt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 