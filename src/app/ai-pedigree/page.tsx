'use client';

import { useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge,
  Position,
  MarkerType,
  NodeChange,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { medicalConditions, MedicalCondition } from './MedicalSymbols';
import CustomNode from './CustomNode';

interface PedigreeNode {
  id: string;
  gender: 'male' | 'female';
  generation: number;
  position: { x: number; y: number };
  relationships?: {
    spouse?: string;
    children?: string[];
    parents?: string[];
  };
  conditions?: string[];
}

interface PedigreeStructure {
  nodes: PedigreeNode[];
  relationships: {
    marriages: [string, string][];
    children: { parents: [string, string], children: string[] }[];
  };
}

// Define node types
const nodeTypes = {
  default: CustomNode,
};

export default function AIPedigreePage() {
  const [prompt, setPrompt] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedStructure, setParsedStructure] = useState<string>('');
  const [manualJson, setManualJson] = useState('');

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const handleDragStart = (event: React.DragEvent, condition: MedicalCondition) => {
    event.dataTransfer.setData('application/condition', condition.id);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const conditionId = event.dataTransfer.getData('application/condition');
    const condition = medicalConditions.find(c => c.id === conditionId);
    if (!condition) return;

    // Get the node under the drop
    const bounds = (event.target as HTMLElement).getBoundingClientRect();
    const nodeId = (event.target as HTMLElement).getAttribute('data-node-id');
    if (!nodeId) return;

    // Update the node with the condition
    setNodes(nodes.map(node => {
      if (node.id === nodeId) {
        const conditions = node.data.conditions || [];
        if (!conditions.includes(conditionId)) {
          return {
            ...node,
            data: {
              ...node.data,
              conditions: [...conditions, conditionId],
            },
          };
        }
      }
      return node;
    }));
  };

  const parsePrompt = async (prompt: string) => {
    setLoading(true);
    setError(null);
    setManualJson('');
    try {
      const response = await fetch('/api/ai-pedigree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to generate structure');
        setManualJson(data.rawJson || '');
        return;
      }
      const structure = await response.json();
      renderStructure(structure);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse prompt');
    } finally {
      setLoading(false);
    }
  };

  const renderStructure = (structure: any) => {
    // 1. Create base nodes (individuals)
    const baseNodes: Node[] = structure.nodes.map((node: any) => ({
      id: node.id,
      type: 'default',
      position: node.position,
      data: { 
        label: node.gender === 'male' ? '♂' : '♀',
        conditions: [],
      },
      style: {
        width: 48,
        height: 48,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: node.gender === 'female' ? '50%' : '0%',
      },
    }));

    // 2. Add marriage nodes (one per couple)
    const marriageNodes: Node[] = [];
    const marriageNodeIds: string[] = [];
    const marriageNodeMap: Record<string, string> = {};
    structure.relationships.marriages.forEach(([spouse1, spouse2]: [string, string], idx: number) => {
      const marriageId = `marriage-${spouse1}-${spouse2}`;
      marriageNodeIds.push(marriageId);
      marriageNodeMap[[spouse1, spouse2].sort().join('-')] = marriageId;
      // Position marriage node between spouses
      const spouse1Node = structure.nodes.find((n: any) => n.id === spouse1);
      const spouse2Node = structure.nodes.find((n: any) => n.id === spouse2);
      const x = spouse1Node && spouse2Node ? (spouse1Node.position.x + spouse2Node.position.x) / 2 : 0;
      const y = spouse1Node && spouse2Node ? (spouse1Node.position.y + spouse2Node.position.y) : 0;
      marriageNodes.push({
        id: marriageId,
        type: 'marriage',
        position: { x, y },
        data: { label: '' },
        style: {
          width: 24,
          height: 8,
          background: 'black',
          border: 'none',
          borderRadius: 4,
          zIndex: 1,
        },
        draggable: false,
        selectable: false,
      });
    });

    // 3. Edges: parent to marriage node, marriage node to child
    const edges: Edge[] = [];
    // Marriage edges (horizontal from each spouse to marriage node)
    structure.relationships.marriages.forEach(([spouse1, spouse2]: [string, string]) => {
      const marriageId = marriageNodeMap[[spouse1, spouse2].sort().join('-')];
      edges.push({
        id: `edge-${spouse1}-marriage`,
        source: spouse1,
        target: marriageId,
        type: 'straight',
        style: { strokeWidth: 2 },
      });
      edges.push({
        id: `edge-${spouse2}-marriage`,
        source: spouse2,
        target: marriageId,
        type: 'straight',
        style: { strokeWidth: 2 },
      });
    });
    // Children edges (vertical from marriage node to child)
    structure.relationships.children.forEach(({ parents, children }: any) => {
      const marriageId = marriageNodeMap[parents.sort().join('-')];
      if (!marriageId) return;
      children.forEach((child: string) => {
        edges.push({
          id: `edge-${marriageId}-${child}`,
          source: marriageId,
          target: child,
          type: 'smoothstep',
          style: { strokeWidth: 2 },
        });
      });
    });

    setNodes([...baseNodes, ...marriageNodes]);
    setEdges(edges);
    setParsedStructure(JSON.stringify(structure, null, 2));
    setError(null);
  };

  const handleManualJsonSubmit = () => {
    try {
      const structure = JSON.parse(manualJson);
      renderStructure(structure);
      setError(null);
    } catch (err) {
      setError('Invalid JSON. Please correct and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-96 border-r border-gray-200 p-6 bg-white flex flex-col">
        <h1 className="text-2xl font-bold mb-6">AI Pedigree Generator</h1>
        
        {/* Medical Conditions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Medical Conditions</h2>
          <div className="space-y-4">
            {medicalConditions.map(condition => (
              <div
                key={condition.id}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                draggable
                onDragStart={(e) => handleDragStart(e, condition)}
              >
                <condition.symbol />
                <span className="text-sm">{condition.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Existing prompt textarea and buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your pedigree tree
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Example: Create a family tree with a father and mother who have two children, one male and one female..."
          />
        </div>

        <button
          onClick={() => parsePrompt(prompt)}
          disabled={loading || !prompt.trim()}
          className={`w-full py-2 px-4 rounded-md ${
            loading || !prompt.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Pedigree'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
            {manualJson !== '' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edit JSON manually:
                </label>
                <textarea
                  value={manualJson}
                  onChange={(e) => setManualJson(e.target.value)}
                  className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-xs"
                />
                <button
                  onClick={handleManualJsonSubmit}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Render from JSON
                </button>
              </div>
            )}
          </div>
        )}

        {parsedStructure && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold mb-2">Generated Structure:</h2>
            <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto">
              {parsedStructure}
            </pre>
          </div>
        )}
      </div>

      {/* Main Content / Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
} 