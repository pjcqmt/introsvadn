'use client';

import React, { useState } from 'react';

interface MarkerData {
  name: string;
  location: string;
  father: string;
  mother: string;
  child: string;
}

interface SouthernBlotData {
  father: {
    before: string;
    after: string;
  };
  mother: {
    before: string;
    after: string;
  };
  child: {
    before: string;
    after: string;
  };
}

export default function PromptMaker() {
  const [syndrome, setSyndrome] = useState<'angelman' | 'prader-willi'>('angelman');
  const [childGender, setChildGender] = useState('enfant');
  const [southernBlot, setSouthernBlot] = useState<SouthernBlotData>({
    father: {
      before: 'une bande 100%, une bande 50%',
      after: 'une bande 50%'
    },
    mother: {
      before: 'une bande 100%, une bande 50%',
      after: 'une bande 50%'
    },
    child: {
      before: 'une bande 100%',
      after: 'une bande 100%'
    }
  });

  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      name: 'D15S128',
      location: 'dans région critique',
      father: '11, 14',
      mother: '12, 14',
      child: '14 (grand, 1 de chaque parent)'
    },
    {
      name: 'D15S165',
      location: 'hors région critique',
      father: '22, 25',
      mother: '23 (deux)',
      child: '22, 23'
    }
  ]);

  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const addMarker = () => {
    setMarkers([...markers, {
      name: '',
      location: '',
      father: '',
      mother: '',
      child: ''
    }]);
  };

  const removeMarker = (index: number) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  const updateMarker = (index: number, field: keyof MarkerData, value: string) => {
    const updated = [...markers];
    updated[index][field] = value;
    setMarkers(updated);
  };

  const updateSouthernBlot = (person: keyof SouthernBlotData, timepoint: 'before' | 'after', value: string) => {
    setSouthernBlot(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        [timepoint]: value
      }
    }));
  };

  const generatePrompt = () => {
    const syndromeText = syndrome === 'angelman' ? "syndrome d'Angelman" : "syndrome de Prader-Willi";
    
    let prompt = `Analyse génétique ${syndromeText}:
Contexte clinique :
* ${childGender} affecté par le ${syndromeText}
* La sonde s'hybride au IC (Imprinting Center) sur le chromosome 15. L'ADN génomique a été digéré avec Xba I seulement et avec Xba I + Not I

Résultats des analyses moléculaires :
1. Southern blot :
* Profil du père : avant: [${southernBlot.father.before}], après: [${southernBlot.father.after}]
* Profil de la mère : avant: [${southernBlot.mother.before}], après: [${southernBlot.mother.after}]
* Profil de l'enfant : avant: [${southernBlot.child.before}], après: [${southernBlot.child.after}]

2. Analyse des microsatellites :`;

    markers.forEach((marker, index) => {
      prompt += `
* Marqueur ${index + 1} : [${marker.name}] - localisation : [${marker.location}]
   * Père : [présent, ${marker.father}]
   * Mère : [présent, ${marker.mother}]
   * Enfant : [présent, ${marker.child}]`;
    });

    prompt += `

Questions posées :
* Identifier la cause moléculaire parmi les 4 possibles
* Justifier le choix et expliquer pourquoi les autres sont exclues

Analyse les 4 causes possibles : délétion, disomie uniparentale, mutation du gène, défaut d'empreinte.`;

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('Prompt copié dans le presse-papiers !');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Générateur de Prompts - Syndromes d'Angelman et Prader-Willi
          </h1>

          {/* Configuration du syndrome */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Configuration générale</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syndrome
                </label>
                <select
                  value={syndrome}
                  onChange={(e) => setSyndrome(e.target.value as 'angelman' | 'prader-willi')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="angelman">Syndrome d'Angelman</option>
                  <option value="prader-willi">Syndrome de Prader-Willi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre de l'enfant
                </label>
                <select
                  value={childGender}
                  onChange={(e) => setChildGender(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="enfant">Enfant</option>
                  <option value="garçon">Garçon</option>
                  <option value="fille">Fille</option>
                </select>
              </div>
            </div>
          </div>

          {/* Southern Blot Configuration */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Southern Blot</h2>
            
            {['father', 'mother', 'child'].map((person) => (
              <div key={person} className="mb-4">
                <h3 className="text-lg font-medium mb-2 capitalize">
                  {person === 'father' ? 'Père' : person === 'mother' ? 'Mère' : 'Enfant'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avant digestion
                    </label>
                    <input
                      type="text"
                      value={southernBlot[person as keyof SouthernBlotData].before}
                      onChange={(e) => updateSouthernBlot(person as keyof SouthernBlotData, 'before', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: une bande 100%, une bande 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Après digestion
                    </label>
                    <input
                      type="text"
                      value={southernBlot[person as keyof SouthernBlotData].after}
                      onChange={(e) => updateSouthernBlot(person as keyof SouthernBlotData, 'after', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: une bande 50%"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Microsatellites Configuration */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Marqueurs Microsatellites</h2>
              <button
                onClick={addMarker}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                + Ajouter marqueur
              </button>
            </div>

            {markers.map((marker, index) => (
              <div key={index} className="mb-6 p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Marqueur {index + 1}</h3>
                  {markers.length > 1 && (
                    <button
                      onClick={() => removeMarker(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du marqueur
                    </label>
                    <input
                      type="text"
                      value={marker.name}
                      onChange={(e) => updateMarker(index, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: D15S128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localisation
                    </label>
                    <select
                      value={marker.location}
                      onChange={(e) => updateMarker(index, 'location', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="dans région critique">Dans région critique</option>
                      <option value="hors région critique">Hors région critique</option>
                      <option value="région flanquante">Région flanquante</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Père
                    </label>
                    <input
                      type="text"
                      value={marker.father}
                      onChange={(e) => updateMarker(index, 'father', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 11, 14"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mère
                    </label>
                    <input
                      type="text"
                      value={marker.mother}
                      onChange={(e) => updateMarker(index, 'mother', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 12, 14"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enfant
                    </label>
                    <input
                      type="text"
                      value={marker.child}
                      onChange={(e) => updateMarker(index, 'child', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 14 (grand, 1 de chaque parent)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <button
              onClick={generatePrompt}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Générer le Prompt
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
              <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded-md border overflow-auto max-h-96">
                {generatedPrompt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 