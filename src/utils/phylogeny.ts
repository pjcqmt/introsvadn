export interface DNASequence {
  id: string;
  name: string;
  sequence: string;
}

export interface DistanceMatrix {
  [key: string]: { [key: string]: number };
}

export interface ClusterNode {
  id: string;
  name: string;
  children?: ClusterNode[];
  height: number;
  isLeaf: boolean;
}

export interface UPGMAStep {
  step: number;
  clusteredNodes: string[];
  distance: number;
  description: string;
  matrixBefore: DistanceMatrix;
  matrixAfter: DistanceMatrix;
  activeClusters: string[];
  newClusterName: string;
}

/**
 * Calculate the number of differences between two DNA sequences
 */
export function calculateSequenceDifferences(seq1: string, seq2: string): number {
  const cleanSeq1 = seq1.replace(/\s+/g, '').toUpperCase();
  const cleanSeq2 = seq2.replace(/\s+/g, '').toUpperCase();
  
  if (cleanSeq1.length !== cleanSeq2.length) {
    throw new Error('Les séquences doivent avoir la même longueur');
  }
  
  let differences = 0;
  for (let i = 0; i < cleanSeq1.length; i++) {
    if (cleanSeq1[i] !== cleanSeq2[i]) {
      differences++;
    }
  }
  
  return differences;
}

/**
 * Calculate distance matrix from DNA sequences
 */
export function calculateDistanceMatrix(sequences: DNASequence[]): DistanceMatrix {
  const matrix: DistanceMatrix = {};
  
  sequences.forEach(seq1 => {
    matrix[seq1.id] = {};
    sequences.forEach(seq2 => {
      if (seq1.id === seq2.id) {
        matrix[seq1.id][seq2.id] = 0;
      } else {
        const differences = calculateSequenceDifferences(seq1.sequence, seq2.sequence);
        matrix[seq1.id][seq2.id] = differences;
      }
    });
  });
  
  return matrix;
}

/**
 * Find the minimum distance in the matrix and return the indices
 */
function findMinimumDistance(clusters: ClusterNode[], matrix: DistanceMatrix): { minI: number; minJ: number; minDistance: number } {
  let minDistance = Infinity;
  let minI = -1;
  let minJ = -1;
  
  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const dist = matrix[clusters[i].id]?.[clusters[j].id] || 0;
      if (dist < minDistance) {
        minDistance = dist;
        minI = i;
        minJ = j;
      }
    }
  }
  
  return { minI, minJ, minDistance };
}

/**
 * Create a copy of the distance matrix for a specific set of clusters
 */
function copyMatrixForClusters(matrix: DistanceMatrix, clusterIds: string[]): DistanceMatrix {
  const copy: DistanceMatrix = {};
  clusterIds.forEach(id1 => {
    copy[id1] = {};
    clusterIds.forEach(id2 => {
      copy[id1][id2] = matrix[id1]?.[id2] || 0;
    });
  });
  return copy;
}

/**
 * Construct UPGMA tree from distance matrix
 */
export function constructUPGMATree(
  initialClusters: ClusterNode[], 
  distanceMatrix: DistanceMatrix
): { tree: ClusterNode | null; steps: UPGMAStep[] } {
  const steps: UPGMAStep[] = [];
  let clusters = [...initialClusters];
  let matrix = JSON.parse(JSON.stringify(distanceMatrix));
  let clusterCounter = initialClusters.length + 1;
  let stepNumber = 1;

  while (clusters.length > 1) {
    // Current cluster IDs
    const currentClusterIds = clusters.map(c => c.id);
    
    // Save matrix state before this step
    const matrixBefore = copyMatrixForClusters(matrix, currentClusterIds);
    
    // Find minimum distance
    const { minI, minJ, minDistance } = findMinimumDistance(clusters, matrix);
    
    if (minI === -1 || minJ === -1) break;

    const clusterI = clusters[minI];
    const clusterJ = clusters[minJ];
    
    // Calculate branch length (height of new cluster)
    const newHeight = minDistance / 2;
    
    // Create new cluster
    const newCluster: ClusterNode = {
      id: `cluster_${clusterCounter++}`,
      name: `(${clusterI.name}, ${clusterJ.name})`,
      children: [clusterI, clusterJ],
      height: newHeight,
      isLeaf: false
    };

    // Update distance matrix for new cluster
    const newClusterId = newCluster.id;
    matrix[newClusterId] = {};
    
    clusters.forEach((cluster, idx) => {
      if (idx !== minI && idx !== minJ) {
        // UPGMA distance calculation (average linkage)
        const distI = matrix[clusterI.id]?.[cluster.id] || 0;
        const distJ = matrix[clusterJ.id]?.[cluster.id] || 0;
        const avgDist = (distI + distJ) / 2;
        
        matrix[newClusterId][cluster.id] = avgDist;
        matrix[cluster.id][newClusterId] = avgDist;
      }
    });

    // Remove old clusters from matrix
    delete matrix[clusterI.id];
    delete matrix[clusterJ.id];
    Object.keys(matrix).forEach(key => {
      delete matrix[key][clusterI.id];
      delete matrix[key][clusterJ.id];
    });

    // Remove old clusters and add new cluster
    clusters = clusters.filter((_, idx) => idx !== minI && idx !== minJ);
    clusters.push(newCluster);

    // Save matrix state after this step
    const newClusterIds = clusters.map(c => c.id);
    const matrixAfter = copyMatrixForClusters(matrix, newClusterIds);
    
    // Record step with detailed information
    steps.push({
      step: stepNumber++,
      clusteredNodes: [clusterI.name, clusterJ.name],
      distance: minDistance,
      description: `Fusion de ${clusterI.name} et ${clusterJ.name} (distance: ${minDistance.toFixed(2)})`,
      matrixBefore,
      matrixAfter,
      activeClusters: currentClusterIds,
      newClusterName: newCluster.name
    });
  }

  return {
    tree: clusters[0] || null,
    steps
  };
}

/**
 * Validate DNA sequence
 */
export function validateDNASequence(sequence: string): boolean {
  const cleanSeq = sequence.replace(/\s+/g, '').toUpperCase();
  return /^[ATCG]+$/.test(cleanSeq);
}

/**
 * Format DNA sequence for display
 */
export function formatDNASequence(sequence: string): string {
  const cleanSeq = sequence.replace(/\s+/g, '').toUpperCase();
  const chunks: string[] = [];
  for (let i = 0; i < cleanSeq.length; i += 10) {
    chunks.push(cleanSeq.slice(i, i + 10));
  }
  return chunks.join(' ');
} 