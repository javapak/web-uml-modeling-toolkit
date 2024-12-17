import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react';
import './index.css';
import React from 'react';

function GeneralNodes() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed.replace(event.dataTransfer.effectAllowed.toString(), 'move');
  };

  return (
    <div className="paletteParent">
      <div
        className="rectangle"
        title="A group node that allows the creation of a subflow within the main viewmodel flow."
        onDragStart={(event) => onDragStart(event, 'Group')}
        draggable
      >
        Group
      </div>
    </div>
  );
}

export default GeneralNodes;
