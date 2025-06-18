'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
  MarkerType,
  Handle,
  Position,
  useReactFlow,
  NodeChange,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { medicalConditions, MedicalCondition } from '../ai-pedigree/MedicalSymbols';
import CustomNode from '../ai-pedigree/CustomNode';

interface NodeData {
  gender?: 'male' | 'female';
  name?: string;
  conditions: string[];
}

// Custom node components



const GridLineNode = ({ data }: { data: { label: string } }) => (
  <div className="absolute left-0 right-0 border-t-2 border-gray-200 pointer-events-none">
    <div className="absolute -top-4 left-4 bg-white px-2 text-sm font-medium text-gray-600">
      {data.label}
    </div>
  </div>
);

// Add a ConditionNode component
const ConditionNode = ({ data }: { data: { id: string; conditionId: string } }) => {
  const condition = medicalConditions.find(c => c.id === data.conditionId);
  if (!condition) return null;
  return (
    <div className="flex items-center justify-center w-12 h-12" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
      <div className="w-8 h-8 flex items-center justify-center">
        <condition.symbol />
      </div>
    </div>
  );
};

const nodeTypes = {
  gridLine: GridLineNode,
  condition: ConditionNode,
  default: (props: any) => (
    <CustomNode
      {...props}
      onConditionDrop={(nodeId: string, conditionId: string) => {
        setNodes((nds) =>
          nds.map((node) => {
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
          })
        );
      }}
    />
  ),
};

const getConditionMarkers = (conditions: string[]) => {
  const markers = [];
  if (conditions.includes('daltonism')) markers.push(<span key="d" className="absolute -top-1 -right-1 text-xs">X</span>);
  if (conditions.includes('cholesterol')) markers.push(<span key="h" className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs">|</span>);
  if (conditions.includes('cataract')) markers.push(<span key="c" className="absolute -top-1 -left-1 text-xs">-</span>);
  return markers;
};

// Edge types
const EDGE_TYPES = {
  MARRIAGE: 'marriage',
  PARENT_CHILD: 'parent-child',
};

interface EdgeData {
  type: typeof EDGE_TYPES[keyof typeof EDGE_TYPES];
}

// Custom edge components
const MarriageEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}) => {
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  return (
    <path
      d={path}
      className="stroke-black stroke-2"
      fill="none"
      strokeDasharray="none"
    />
  );
};

const ParentChildEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}) => {
  // Create a path that goes down from source and then to target
  const midY = (sourceY + targetY) / 2;
  const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
  return (
    <path
      d={path}
      className="stroke-black stroke-2"
      fill="none"
      strokeDasharray="none"
    />
  );
};

// Custom edge for freehand drawing
const DrawingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: { path?: string };
}) => {
  if (data?.path) {
    return <path d={data.path} className="stroke-black stroke-2" fill="none" />;
  }
  return null;
};

const edgeTypes = {
  [EDGE_TYPES.MARRIAGE]: MarriageEdge,
  [EDGE_TYPES.PARENT_CHILD]: ParentChildEdge,
  drawing: DrawingEdge,
};

// Helper function to convert numbers to Roman numerals
function toRomanNumeral(num: number): string {
  const romanNumerals = [
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];
  
  let result = '';
  let remaining = num;
  
  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  
  return result;
}

interface DrawingPath {
  id: string;
  path: string;
}

export default function PedigreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [numGenerations, setNumGenerations] = useState<number>(0);
  const [isSetup, setIsSetup] = useState(false);
  const [isLineMode, setIsLineMode] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const type = event.dataTransfer.getData('application/nodeType');
      const gender = event.dataTransfer.getData('application/gender');
      const conditionId = event.dataTransfer.getData('application/condition');

      if (type === 'condition' && conditionId) {
        // Always create a new condition node on canvas drop
        const position = {
          x: event.clientX - event.currentTarget.getBoundingClientRect().left,
          y: event.clientY - event.currentTarget.getBoundingClientRect().top,
        };
        const newNode: Node = {
          id: `condition-${nodes.length + 1}`,
          type: 'condition',
          position,
          data: {
            id: `condition-${nodes.length + 1}`,
            conditionId,
          },
          style: {
            width: 48,
            height: 48,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
            padding: 0,
          },
        };
        setNodes((nds) => [...nds, newNode]);
        return;
      }

      if (type && gender) {
        // Handle node creation (existing logic)
        const position = {
          x: event.clientX - event.currentTarget.getBoundingClientRect().left,
          y: event.clientY - event.currentTarget.getBoundingClientRect().top,
        };

        const name = prompt('Enter name for this person:') || '';

        const newNode: Node = {
          id: `node-${nodes.length + 1}`,
          type: 'default',
          position,
          data: { 
            id: `node-${nodes.length + 1}`,
            label: gender === 'male' ? '♂' : '♀',
            conditions: [],
            name,
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
            borderRadius: gender === 'female' ? '50%' : '0%',
          },
        };

        setNodes((nds) => [...nds, newNode]);
        return;
      }
    },
    [nodes, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      
      if (!sourceNode || !targetNode) return;

      // Determine if this is a marriage connection based on the handles used
      const isMarriage = params.sourceHandle?.includes('marriage') || 
                        params.targetHandle?.includes('marriage');

      // Validate the connection
      if (isMarriage && sourceNode.data.generation !== targetNode.data.generation) {
        alert('Marriage connections must be between nodes in the same generation');
        return;
      }

      if (!isMarriage && sourceNode.data.generation >= targetNode.data.generation) {
        alert('Parent-child connections must go from parent to child');
        return;
      }

      const edgeType = isMarriage ? EDGE_TYPES.MARRIAGE : EDGE_TYPES.PARENT_CHILD;

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: edgeType,
            data: { type: edgeType },
          },
          eds
        )
      );
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const updateNodeConditions = (nodeId: string, condition: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const conditions = node.data.conditions || [];
          if (!conditions.includes(condition)) {
            return {
              ...node,
              data: {
                ...node.data,
                conditions: [...conditions, condition],
              },
            };
          }
        }
        return node;
      })
    );
  };

  const updateNodeName = (nodeId: string, name: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              name,
            },
          };
        }
        return node;
      })
    );
  };

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode && edge.target !== selectedNode));
      setSelectedNode(null);
    } else if (selectedLine !== null) {
      setLines((lines) => lines.filter((_, idx) => idx !== selectedLine));
      setSelectedLine(null);
    }
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isLineMode) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (!lineStart) {
      setLineStart({ x, y });
      setMousePos({ x, y });
    } else {
      setLines((prev) => [...prev, { x1: lineStart.x, y1: lineStart.y, x2: x, y2: y }]);
      setLineStart(null);
      setMousePos(null);
    }
  }, [isLineMode, lineStart]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isLineMode || !lineStart) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    setMousePos({ x, y });
  }, [isLineMode, lineStart]);

  useEffect(() => {
    if ((!selectedNode && selectedLine === null) || isLineMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedLine, isLineMode]);

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6">Pedigree Setup</h1>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Generations:
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={numGenerations || ''}
              onChange={(e) => setNumGenerations(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
            />
            <p className="mt-2 text-sm text-gray-500">Enter a number between 1 and 10</p>
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            disabled={numGenerations < 1}
            onClick={() => setIsSetup(true)}
          >
            Create Pedigree
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4 bg-white flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Pedigree Editor</h1>
          <button
            onClick={() => {
              setIsSetup(false);
              setNodes([]);
              setEdges([]);
              setLines([]);
              setSelectedNode(null);
            }}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Reset
          </button>
        </div>

        {/* Draw Line Mode Toggle */}
        <div className="mb-6">
          <button
            onClick={() => {
              setIsLineMode((v) => !v);
              setLineStart(null);
            }}
            className={`w-full py-2 px-4 rounded-md ${
              isLineMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isLineMode ? 'Exit Draw Line Mode' : 'Draw Line'}
          </button>
          {isLineMode && (
            <p className="mt-2 text-sm text-gray-600">
              Click two points on the canvas to draw a straight line
            </p>
          )}
        </div>

        {/* Node Controls - Only visible in normal mode */}
        {!isLineMode && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold mb-3 text-gray-700">Nodes</h2>
              <div className="space-y-4">
                <div
                  className="w-12 h-12 border-2 border-black bg-white cursor-move flex items-center justify-center hover:bg-gray-50"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/nodeType', 'single');
                    e.dataTransfer.setData('application/gender', 'male');
                  }}
                >
                  ♂
                </div>
                <div
                  className="w-12 h-12 rounded-full border-2 border-black bg-white cursor-move flex items-center justify-center hover:bg-gray-50"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/nodeType', 'single');
                    e.dataTransfer.setData('application/gender', 'female');
                  }}
                >
                  ♀
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Medical Conditions */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Medical Conditions</h2>
          <div className="space-y-4">
            {medicalConditions.map(condition => (
              <div
                key={condition.id}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/nodeType', 'condition');
                  e.dataTransfer.setData('application/condition', condition.id);
                }}
              >
                <condition.symbol />
                <span className="text-sm">{condition.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node Editor - Only visible when a node is selected */}
        {selectedNode && !isLineMode && nodes.find((n) => n.id === selectedNode && n.type !== 'condition') && (
          <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
              <input
                type="text"
                value={nodes.find((n) => n.id === selectedNode)?.data.name || ''}
                onChange={(e) => updateNodeName(selectedNode, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter name"
              />
            </div>
            
            <h3 className="font-medium mb-2 text-sm">Conditions:</h3>
            <div className="space-y-2">
              {medicalConditions.map((condition) => (
                <label key={condition.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={nodes.find((n) => n.id === selectedNode)?.data.conditions.includes(condition.id) || false}
                    onChange={() => {
                      setNodes((nds) =>
                        nds.map((node) => {
                          if (node.id === selectedNode) {
                            const hasCondition = node.data.conditions.includes(condition.id);
                            return {
                              ...node,
                              data: {
                                ...node.data,
                                conditions: hasCondition
                                  ? node.data.conditions.filter((c) => c !== condition.id)
                                  : [...node.data.conditions, condition.id],
                              },
                            };
                          }
                          return node;
                        })
                      );
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{condition.name}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={deleteSelected}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Delete Node
              </button>
              <div className="text-xs text-gray-500">
                ID: {nodes.find((n) => n.id === selectedNode)?.data.generation && 
                     toRomanNumeral(nodes.find((n) => n.id === selectedNode)?.data.generation || 0)}-
                     {nodes.find((n) => n.id === selectedNode)?.data.positionInGeneration}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-4 flex">
        {/* Generation Labels */}
        <div className="w-12 flex flex-col mr-4">
          {Array.from({ length: numGenerations }).map((_, index) => (
            <div
              key={index}
              className="h-[150px] flex items-center justify-center font-mono text-sm font-medium text-gray-600"
            >
              {toRomanNumeral(index + 1)}
            </div>
          ))}
        </div>

        {/* Canvas with Generation Grid */}
        <div className="flex-1 relative">
          {/* Generation Grid Lines */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ height: `${numGenerations * 150}px` }}
          >
            {Array.from({ length: numGenerations - 1 }).map((_, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-dotted border-gray-300"
                style={{ top: `${(index + 1) * 150}px` }}
              />
            ))}
          </div>

          {/* ReactFlow Canvas */}
          <div 
            className="border border-gray-200 rounded-lg bg-white"
            style={{ height: `${Math.max(600, numGenerations * 150)}px`, position: 'relative' }}
            onClick={isLineMode ? handleCanvasClick : undefined}
            onMouseMove={isLineMode ? handleCanvasMouseMove : undefined}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {/* SVG for straight lines */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: isLineMode ? 'all' : 'none',
                zIndex: 2,
              }}
              onClick={() => {
                setSelectedLine(null);
                setSelectedNode(null);
              }}
            >
              {lines.map((line, idx) => (
                <line
                  key={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={selectedLine === idx ? '#1976D2' : 'black'}
                  strokeWidth={selectedLine === idx ? 4 : 2}
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLine(idx);
                    setSelectedNode(null);
                  }}
                />
              ))}
              {/* Preview line if one point is selected */}
              {isLineMode && lineStart && mousePos && (
                <line
                  x1={lineStart.x}
                  y1={lineStart.y}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="#888"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}
            </svg>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={(_, node) => setSelectedNode(node.id)}
                defaultEdgeOptions={{
                  type: EDGE_TYPES.PARENT_CHILD,
                }}
                style={{ background: '#fff' }}
                panOnDrag={!isLineMode}
                zoomOnScroll={!isLineMode}
                nodesDraggable={!isLineMode}
                nodesConnectable={!isLineMode}
                elementsSelectable={!isLineMode}
              >
                <Controls />
                <MiniMap />
                <Background />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </div>
  );
} 