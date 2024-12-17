import './index.css';
import React from 'react';

function StructuralNodes() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed.replace(event.dataTransfer.effectAllowed.toString(), 'move');
  };
}

export default StructuralNodes;
