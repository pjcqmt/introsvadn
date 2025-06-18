import { Handle, Position } from 'reactflow';
import { medicalConditions } from './MedicalSymbols';

interface CustomNodeProps {
  data: {
    id: string;
    label: string;
    conditions?: string[];
    name?: string;
  };
  isConnectable: boolean;
  onConditionDrop?: (nodeId: string, conditionId: string) => void;
}

export default function CustomNode({ data, isConnectable, onConditionDrop }: CustomNodeProps) {
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/condition')) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const conditionId = e.dataTransfer.getData('application/condition');
    if (conditionId && onConditionDrop) {
      onConditionDrop(data.id, conditionId);
    }
  };

  // Determine shape based on label
  const isFemale = data.label === '♀';

  return (
    <div
      className="relative"
      data-node-id={data.id}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Main node */}
      <div className={`w-12 h-12 border-2 border-black bg-white flex items-center justify-center ${isFemale ? 'rounded-full' : ''}`}>
        {data.label}
      </div>

      {/* Name display in south west position */}
      {data.name && (
        <div className="absolute top-full -left-2 text-sm">
          {data.name}
        </div>
      )}

      {/* Medical conditions */}
      {data.conditions && data.conditions.length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 flex flex-col items-center mt-1">
          {data.conditions.map((conditionId, index) => {
            const condition = medicalConditions.find(c => c.id === conditionId);
            if (!condition) return null;
            return (
              <div key={index} className="w-6 h-6">
                <condition.symbol />
              </div>
            );
          })}
        </div>
      )}

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
} 