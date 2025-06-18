// WARNING: Do not import this file in client components. Server-side use only.

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
}

interface PedigreeStructure {
  nodes: PedigreeNode[];
  relationships: {
    marriages: [string, string][];
    children: { parents: [string, string], children: string[] }[];
  };
}

interface ParsedEntity {
  type: 'person' | 'relationship';
  gender?: 'male' | 'female';
  role?: string;
  id: string;
  relatedTo?: string[];
  relationshipType?: 'spouse' | 'child' | 'parent';
}

import { generatePedigreeStructure } from './openai';

export function calculateNodePositions(nodes: PedigreeNode[]): PedigreeNode[] {
  const GENERATION_HEIGHT = 150;
  const NODE_WIDTH = 150;
  
  // Group nodes by generation
  const generationGroups = nodes.reduce((acc, node) => {
    if (!acc[node.generation]) {
      acc[node.generation] = [];
    }
    acc[node.generation].push(node);
    return acc;
  }, {} as Record<number, PedigreeNode[]>);

  // Calculate positions for each generation
  Object.entries(generationGroups).forEach(([gen, genNodes]) => {
    const generation = parseInt(gen);
    const totalWidth = genNodes.length * NODE_WIDTH;
    const startX = (1000 - totalWidth) / 2; // Assuming 1000px canvas width

    genNodes.forEach((node, idx) => {
      node.position = {
        x: startX + (idx * NODE_WIDTH),
        y: generation * GENERATION_HEIGHT
      };
    });
  });

  return nodes;
}

export function validatePedigreeStructure(structure: PedigreeStructure): boolean {
  // Validate that all referenced IDs exist
  const nodeIds = new Set(structure.nodes.map(n => n.id));

  // Check marriages
  for (const [spouse1, spouse2] of structure.relationships.marriages) {
    if (!nodeIds.has(spouse1) || !nodeIds.has(spouse2)) {
      return false;
    }
  }

  // Check parent-child relationships
  for (const { parents, children } of structure.relationships.children) {
    if (!parents.every(p => nodeIds.has(p))) {
      return false;
    }
    if (!children.every(c => nodeIds.has(c))) {
      return false;
    }
  }

  return true;
} 