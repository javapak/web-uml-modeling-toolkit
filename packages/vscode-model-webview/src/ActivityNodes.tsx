import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react';
import './index.css';
import React from 'react';
import { UserCreatedNodes} from '../../core/src/base.metamodel';

function ActivityNodes() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed.replace(event.dataTransfer.effectAllowed.toString(), 'move');
  };
  
  const behavioralNodes = UserCreatedNodes.filter((viewModNode) => viewModNode.isStructural === false)

  return (
    <div className='paletteParent'>
    {behavioralNodes.map((viewModNode) => (
            <div
            style={viewModNode.style}
            onDragStart={(event) => onDragStart(event, viewModNode.type)}
            draggable
          >
            {viewModNode.type}
          </div>
    
    ))}
    </div>

  );
}

export default ActivityNodes;
